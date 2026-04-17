package com.anime.reco.controller;

import com.anime.reco.dto.CommentRequest;
import com.anime.reco.dto.RatingRequest;
import com.anime.reco.dto.ReviewRequest;
import com.anime.reco.dto.WatchlistRequest;
import com.anime.reco.model.*;
import com.anime.reco.repository.*;
import com.anime.reco.service.CommunityService;
import com.anime.reco.service.UserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/social")
@Transactional
public class SocialController {
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;
    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final CommunityService communityService;
    private final UserService userService;
    private final FollowRequestRepository followRequestRepository;
    private final AppNotificationRepository notificationRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final ReviewCommentRepository reviewCommentRepository;

    public SocialController(RatingRepository ratingRepository,
                            ReviewRepository reviewRepository,
                            WatchlistRepository watchlistRepository,
                            UserRepository userRepository,
                            CommunityService communityService,
                            UserService userService,
                            FollowRequestRepository followRequestRepository,
                            AppNotificationRepository notificationRepository,
                            ReviewLikeRepository reviewLikeRepository,
                            ReviewCommentRepository reviewCommentRepository) {
        this.ratingRepository = ratingRepository;
        this.reviewRepository = reviewRepository;
        this.watchlistRepository = watchlistRepository;
        this.userRepository = userRepository;
        this.communityService = communityService;
        this.userService = userService;
        this.followRequestRepository = followRequestRepository;
        this.notificationRepository = notificationRepository;
        this.reviewLikeRepository = reviewLikeRepository;
        this.reviewCommentRepository = reviewCommentRepository;
    }

    @PostMapping("/ratings")
    public Rating addRating(@AuthenticationPrincipal UserDetails principal,
                            @Valid @RequestBody RatingRequest request) {
        return communityService.rateAnime(currentUser(principal), request);
    }

    @GetMapping("/ratings/anime/{animeId}")
    public List<Rating> ratingsForAnime(@PathVariable Long animeId) {
        return ratingRepository.findByAnimeId(animeId);
    }

    @PostMapping("/reviews")
    public Review addReview(@AuthenticationPrincipal UserDetails principal,
                            @Valid @RequestBody ReviewRequest request) {
        return communityService.addReview(currentUser(principal), request);
    }

    @GetMapping("/reviews/anime/{animeId}")
    public List<Review> reviewsForAnime(@PathVariable Long animeId) {
        return reviewRepository.findByAnimeIdOrderByCreatedAtDesc(animeId);
    }

    @GetMapping("/reviews/user/{userId}")
    public List<Review> reviewsByUser(@PathVariable Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping("/reviews/{reviewId}/like")
    public Map<String, Long> likeReview(@AuthenticationPrincipal UserDetails principal, @PathVariable Long reviewId) {
        User me = currentUser(principal);
        reviewLikeRepository.findByReviewIdAndUserId(reviewId, me.getId()).ifPresentOrElse(
                existing -> reviewLikeRepository.delete(existing),
                () -> {
                    ReviewLike like = new ReviewLike();
                    like.setReview(reviewRepository.findById(reviewId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found")));
                    like.setUser(me);
                    reviewLikeRepository.save(like);
                    notifyUser(like.getReview().getUser(), me.getUsername() + " liked your review");
                }
        );
        return Map.of("likes", reviewLikeRepository.countByReviewId(reviewId));
    }

    @PostMapping("/reviews/{reviewId}/comments")
    public ReviewComment commentReview(@AuthenticationPrincipal UserDetails principal,
                                       @PathVariable Long reviewId,
                                       @Valid @RequestBody CommentRequest request) {
        User me = currentUser(principal);
        ReviewComment comment = new ReviewComment();
        comment.setUser(me);
        comment.setReview(reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found")));
        comment.setContent(request.getContent());
        ReviewComment saved = reviewCommentRepository.save(comment);
        notifyUser(saved.getReview().getUser(), me.getUsername() + " commented on your review");
        return saved;
    }

    @GetMapping("/reviews/{reviewId}/comments")
    public List<ReviewComment> reviewComments(@PathVariable Long reviewId) {
        return reviewCommentRepository.findByReviewIdOrderByCreatedAtDesc(reviewId);
    }

    @PostMapping("/watchlist")
    public WatchlistItem addWatchlistItem(@AuthenticationPrincipal UserDetails principal,
                                          @Valid @RequestBody WatchlistRequest watchlistItem) {
        return communityService.upsertWatchlist(currentUser(principal), watchlistItem);
    }

    @GetMapping("/watchlist")
    public List<WatchlistItem> myWatchlist(@AuthenticationPrincipal UserDetails principal) {
        User user = currentUser(principal);
        return watchlistRepository.findByUserId(user.getId());
    }

    @GetMapping("/watchlist/{userId}")
    public List<WatchlistItem> getWatchlist(@PathVariable Long userId) {
        return watchlistRepository.findByUserId(userId);
    }

    @PostMapping("/follow/request/{targetId}")
    public FollowRequest requestFollow(@AuthenticationPrincipal UserDetails principal, @PathVariable Long targetId) {
        User me = currentUser(principal);
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));
        if (me.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        boolean alreadyConnected = me.getFriends().stream().anyMatch(friend -> friend.getId().equals(targetId));
        if (alreadyConnected) {
            throw new IllegalArgumentException("You already follow this user");
        }

        boolean pendingAlreadyExists = followRequestRepository.existsByRequesterIdAndTargetIdAndStatus(me.getId(), targetId, "PENDING");
        if (pendingAlreadyExists) {
            throw new IllegalArgumentException("Follow request already pending");
        }

        FollowRequest followRequest = new FollowRequest();
        followRequest.setRequester(me);
        followRequest.setTarget(target);

        FollowRequest saved = followRequestRepository.save(followRequest);
        notifyUser(target, me.getUsername() + " sent you a follow request");
        return saved;
    }

    @GetMapping("/follow/requests")
    public List<FollowRequest> myFollowRequests(@AuthenticationPrincipal UserDetails principal) {
        User me = currentUser(principal);
        return followRequestRepository.findByTargetIdAndStatusOrderByCreatedAtDesc(me.getId(), "PENDING");
    }

    @PostMapping("/follow/accept/{requestId}")
    public List<UserSummary> acceptFollow(@AuthenticationPrincipal UserDetails principal, @PathVariable Long requestId) {
        User me = currentUser(principal);
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow request not found"));
        if (!request.getTarget().getId().equals(me.getId())) {
            throw new IllegalArgumentException("Not allowed");
        }

        request.setStatus("ACCEPTED");
        followRequestRepository.save(request);

        User updated = userService.addFriend(me.getId(), request.getRequester().getId());
        List<FollowRequest> duplicatePendingRequests = followRequestRepository.findPendingBetweenUsers(
                me.getId(),
                request.getRequester().getId(),
                "PENDING"
        );
        if (!duplicatePendingRequests.isEmpty()) {
            followRequestRepository.deleteAll(duplicatePendingRequests);
        }
        notifyUser(request.getRequester(), me.getUsername() + " accepted your follow request");
        return updated.getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @PostMapping("/friends/{friendId}")
    public List<UserSummary> addFriend(@AuthenticationPrincipal UserDetails principal, @PathVariable Long friendId) {
        User user = currentUser(principal);
        User updated = userService.addFriend(user.getId(), friendId);
        return updated.getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @DeleteMapping("/friends/{friendId}")
    public List<UserSummary> removeFriend(@AuthenticationPrincipal UserDetails principal, @PathVariable Long friendId) {
        User user = currentUser(principal);
        User updated = userService.removeFriend(user.getId(), friendId);
        return updated.getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/friends")
    public List<UserSummary> myFriends(@AuthenticationPrincipal UserDetails principal) {
        return currentUser(principal).getFriends().stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/followers")
    public List<UserSummary> myFollowers(@AuthenticationPrincipal UserDetails principal) {
        User me = currentUser(principal);
        return userRepository.findAll().stream()
                .filter(u -> u.getFriends().stream().anyMatch(friend -> friend.getId().equals(me.getId())))
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @GetMapping("/users/search")
    public List<UserSummary> searchUsers(@RequestParam(defaultValue = "") String username) {
        return userService.searchUsers(username).stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/notifications")
    public List<AppNotification> notifications(@AuthenticationPrincipal UserDetails principal) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser(principal).getId());
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
