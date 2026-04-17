package com.anime.reco.service;

import com.anime.reco.dto.RatingRequest;
import com.anime.reco.dto.ReviewRequest;
import com.anime.reco.dto.WatchlistRequest;
import com.anime.reco.model.Anime;
import com.anime.reco.model.Rating;
import com.anime.reco.model.Review;
import com.anime.reco.model.User;
import com.anime.reco.model.WatchlistItem;
import com.anime.reco.repository.AnimeRepository;
import com.anime.reco.repository.RatingRepository;
import com.anime.reco.repository.ReviewRepository;
import com.anime.reco.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

@Service
public class CommunityService {
    private final AnimeRepository animeRepository;
    private final RatingRepository ratingRepository;
    private final ReviewRepository reviewRepository;
    private final WatchlistRepository watchlistRepository;

    public CommunityService(AnimeRepository animeRepository,
                            RatingRepository ratingRepository,
                            ReviewRepository reviewRepository,
                            WatchlistRepository watchlistRepository) {
        this.animeRepository = animeRepository;
        this.ratingRepository = ratingRepository;
        this.reviewRepository = reviewRepository;
        this.watchlistRepository = watchlistRepository;
    }

    public Rating rateAnime(User user, RatingRequest request) {
        Anime anime = animeRepository.findById(request.getAnimeId()).orElseThrow();

        Rating rating = ratingRepository.findByUserIdAndAnimeId(user.getId(), anime.getId())
                .orElseGet(Rating::new);
        rating.setUser(user);
        rating.setAnime(anime);
        rating.setScore(request.getScore());

        return ratingRepository.save(rating);
    }

    public Review addReview(User user, ReviewRequest request) {
        Anime anime = animeRepository.findById(request.getAnimeId()).orElseThrow();
        Review review = new Review();
        review.setUser(user);
        review.setAnime(anime);
        review.setContent(request.getContent());
        return reviewRepository.save(review);
    }

    public WatchlistItem upsertWatchlist(User user, WatchlistRequest request) {
        Anime anime = animeRepository.findById(request.getAnimeId()).orElseThrow();
        WatchlistItem item = watchlistRepository.findByUserIdAndAnimeId(user.getId(), anime.getId())
                .orElseGet(WatchlistItem::new);

        item.setUser(user);
        item.setAnime(anime);
        item.setStatus(request.getStatus() == null ? "PLANNED" : request.getStatus());

        return watchlistRepository.save(item);
    }
}
