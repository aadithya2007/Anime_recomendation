package com.anime.reco.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class FollowRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User requester;

    @ManyToOne(optional = false)
    private User target;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
