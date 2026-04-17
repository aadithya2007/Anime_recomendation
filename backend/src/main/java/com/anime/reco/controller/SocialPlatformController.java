package com.anime.reco.controller;

import com.anime.reco.model.*;
import com.anime.reco.repository.*;
import com.anime.reco.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Transactional
public class SocialPlatformController {
    private final UserRepository userRepository;
    private final FollowRequestRepository followRequestRepository;
    private final AppNotificationRepository notificationRepository;
    private final WatchlistRepository watchlistRepository;
    private final AnimeRepository animeRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;

    public SocialPlatformController(UserRepository userRepository,
                                    FollowRequestRepository followRequestRepository,
                                    AppNotificationRepository notificationRepository,
                                    WatchlistRepository watchlistRepository,
                                    AnimeRepository animeRepository,
                                    ReviewRepository reviewRepository,
                                    UserService userService) {
        this.userRepository = userRepository;
        this.followRequestRepository = followRequestRepository;
        this.notificationRepository = notificationRepository;
        this.watchlistRepository = watchlistRepository;
        this.animeRepository = animeRepository;
        this.reviewRepository = reviewRepository;
        this.userService = userService;
    }

    @GetMapping("/notifications")
    public List<AppNotification> notifications(@AuthenticationPrincipal UserDetails principal) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUser(principal).getId());
    }

    @PatchMapping("/notifications/{id}/read")
    public Map<String, String> markNotificationRead(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        AppNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!notification.getUser().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return Map.of("status", "read");
    }

    @PostMapping("/follow/request/{id}")
    public FollowRequest followRequest(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        if (me.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        boolean alreadyConnected = me.getFriends().stream().anyMatch(friend -> friend.getId().equals(id));
        if (alreadyConnected) {
            throw new IllegalArgumentException("You already follow this user");
        }
        boolean pendingAlreadyExists = followRequestRepository.existsByRequesterIdAndTargetIdAndStatus(me.getId(), id, "PENDING");
        if (pendingAlreadyExists) {
            throw new IllegalArgumentException("Follow request already pending");
        }
        FollowRequest fr = new FollowRequest();
        fr.setRequester(me);
        fr.setTarget(target);
        fr.setStatus("PENDING");
        FollowRequest saved = followRequestRepository.save(fr);
        notifyUser(target, me.getUsername() + " sent you a follow request");
        return saved;
    }

    @PostMapping("/follow/accept/{id}")
    public List<UserSummary> accept(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        User updated = userService.addFriend(me.getId(), id);
        List<FollowRequest> duplicatePendingRequests = followRequestRepository.findPendingBetweenUsers(me.getId(), id, "PENDING");
        if (!duplicatePendingRequests.isEmpty()) {
            followRequestRepository.deleteAll(duplicatePendingRequests);
        }
        return updated.getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @PostMapping("/follow/accept-followback/{id}")
    public List<UserSummary> acceptFollowBack(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        User updated = userService.addFriend(me.getId(), id);
        List<FollowRequest> duplicatePendingRequests = followRequestRepository.findPendingBetweenUsers(me.getId(), id, "PENDING");
        if (!duplicatePendingRequests.isEmpty()) {
            followRequestRepository.deleteAll(duplicatePendingRequests);
        }
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        notifyUser(target, me.getUsername() + " accepted and followed you back");
        return updated.getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/user/{id}")
    public Map<String, Object> userProfile(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        long followers = userRepository.findAll().stream().filter(u -> u.getFriends().contains(user)).count();
        long following = user.getFriends().size();
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "followers", followers,
                "following", following,
                "recentReviews", reviewRepository.findByUserIdOrderByCreatedAtDesc(id).stream().limit(5).toList()
        );
    }

    @GetMapping("/user/{id}/wishlist")
    public List<WatchlistItem> userWishlist(@PathVariable Long id) {
        return watchlistRepository.findByUserId(id);
    }

    @PostMapping("/list/add/{id}")
    public WatchlistItem addToList(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        Anime anime = animeRepository.findById(id)
                .or(() -> animeRepository.findByTitle("Anime " + id))
                .orElseGet(() -> {
                    Anime created = new Anime();
                    created.setTitle("Anime " + id);
                    created.setGenre("Unknown");
                    created.setSynopsis("Added from client list API");
                    return animeRepository.save(created);
                });
        WatchlistItem item = watchlistRepository.findByUserIdAndAnimeId(me.getId(), anime.getId()).orElseGet(WatchlistItem::new);
        item.setUser(me);
        item.setAnime(anime);
        item.setStatus("PLANNED");
        return watchlistRepository.save(item);
    }

    @DeleteMapping("/list/remove/{id}")
    public Map<String, String> removeFromList(@AuthenticationPrincipal UserDetails principal, @PathVariable Long id) {
        User me = currentUser(principal);
        watchlistRepository.findByUserIdAndAnimeId(me.getId(), id).ifPresent(watchlistRepository::delete);
        return Map.of("status", "removed");
    }

    private User currentUser(UserDetails principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private UserSummary toSummary(User user) {
        return new UserSummary(user.getId(), user.getUsername());
    }

    private void notifyUser(User user, String message) {
        AppNotification notification = new AppNotification();
        notification.setUser(user);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public record UserSummary(Long id, String username) {}
}
