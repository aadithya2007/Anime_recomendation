package com.anime.reco.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingRequest {
    @NotNull
    private Long animeId;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer score;
}
