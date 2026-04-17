package com.anime.reco.controller;

import com.anime.reco.model.Anime;
import com.anime.reco.repository.AnimeRepository;
import com.anime.reco.service.SocialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/anime")
public class AnimeController {
    private final AnimeRepository animeRepository;
    private final SocialService socialService;

    public AnimeController(AnimeRepository animeRepository, SocialService socialService) {
        this.animeRepository = animeRepository;
        this.socialService = socialService;
    }

    @GetMapping
    public List<Anime> listAnime() {
        return animeRepository.findAll();
    }

    @PostMapping
    public Anime addAnime(@RequestBody Anime anime) {
        return animeRepository.save(anime);
    }

    @GetMapping("/recommendations")
    public List<Anime> recommendations() {
        return socialService.topRecommendations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Anime> getById(@PathVariable Long id) {
        return animeRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
