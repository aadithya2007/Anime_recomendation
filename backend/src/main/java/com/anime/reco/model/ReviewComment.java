package com.anime.reco.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class ReviewComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Review review;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
