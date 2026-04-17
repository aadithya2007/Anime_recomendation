package com.anime.reco.repository;

import com.anime.reco.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByAnimeId(Long animeId);
    List<Rating> findByUserId(Long userId);
    Optional<Rating> findByUserIdAndAnimeId(Long userId, Long animeId);
}
