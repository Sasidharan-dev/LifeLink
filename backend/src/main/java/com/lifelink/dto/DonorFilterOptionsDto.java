package com.lifelink.dto;

import java.util.List;

public record DonorFilterOptionsDto(
        List<String> states,
        List<String> districts,
        List<String> cities
) {}
