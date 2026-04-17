package com.anime.reco.service;

import com.anime.reco.model.Anime;
import com.anime.reco.model.Rating;
import com.anime.reco.repository.AnimeRepository;
import com.anime.reco.repository.RatingRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SocialService {
    private final RatingRepository ratingRepository;
    private final AnimeRepository animeRepository;

    public SocialService(RatingRepository ratingRepository, AnimeRepository animeRepository) {
        this.ratingRepository = ratingRepository;
        this.animeRepository = animeRepository;
    }

    public List<Anime> topRecommendations() {
        Map<Long, Double> avgByAnime = ratingRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getAnime().getId(), Collectors.averagingInt(Rating::getScore)));

        return avgByAnime.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(10)
                .map(entry -> animeRepository.findById(entry.getKey()).orElse(null))
                .filter(anime -> anime != null)
                .toList();
    }
}
