package com.anime.reco.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Anime anime;

    @Column(nullable = false, length = 1200)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
