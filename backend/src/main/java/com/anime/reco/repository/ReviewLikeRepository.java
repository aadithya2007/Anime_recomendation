package com.anime.reco.repository;

import com.anime.reco.model.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    long countByReviewId(Long reviewId);
    Optional<ReviewLike> findByReviewIdAndUserId(Long reviewId, Long userId);
}
