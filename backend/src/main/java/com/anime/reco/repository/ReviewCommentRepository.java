package com.anime.reco.repository;

import com.anime.reco.model.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {
    List<ReviewComment> findByReviewIdOrderByCreatedAtDesc(Long reviewId);
}
