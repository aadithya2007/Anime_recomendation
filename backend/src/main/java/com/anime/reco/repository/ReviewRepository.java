package com.anime.reco.repository;

import com.anime.reco.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByAnimeIdOrderByCreatedAtDesc(Long animeId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
