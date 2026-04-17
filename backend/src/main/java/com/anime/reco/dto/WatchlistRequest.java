package com.anime.reco.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WatchlistRequest {
    @NotNull
    private Long animeId;

    private String status = "PLANNED";
}
