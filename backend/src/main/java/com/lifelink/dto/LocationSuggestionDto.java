package com.lifelink.dto;

public record LocationSuggestionDto(
        String label,
        String displayName,
        String city,
        String district,
        String state,
        String country,
        String lat,
        String lon
) {}
