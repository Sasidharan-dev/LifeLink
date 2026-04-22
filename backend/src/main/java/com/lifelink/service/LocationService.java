package com.lifelink.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifelink.dto.LocationSuggestionDto;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class LocationService {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<LocationSuggestionDto> searchLocations(String query) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.length() < 2) {
            return List.of();
        }

        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://nominatim.openstreetmap.org/search")
                .queryParam("format", "json")
                .queryParam("addressdetails", 1)
                .queryParam("limit", 8)
                .queryParam("q", normalizedQuery)
                .build()
                .encode()
                .toUri();

        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(8))
                .header("User-Agent", "lifelink-app")
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(response.body());
            List<LocationSuggestionDto> results = new ArrayList<>();
            Set<String> seenKeys = new LinkedHashSet<>();

            for (JsonNode item : root) {
                JsonNode address = item.path("address");
                String city = firstNonBlank(
                        address.path("city").asText(""),
                        address.path("town").asText(""),
                        address.path("village").asText(""),
                        address.path("municipality").asText(""),
                        address.path("hamlet").asText("")
                );
                String district = firstNonBlank(
                        address.path("county").asText(""),
                        address.path("state_district").asText(""),
                        address.path("district").asText("")
                );
                String state = firstNonBlank(address.path("state").asText(""), address.path("region").asText(""));
                String country = address.path("country").asText("");
                String displayName = item.path("display_name").asText("");
                String label = firstNonBlank(city, displayName.isBlank() ? "" : displayName.split(",")[0].trim());

                if (label.isBlank()) {
                    continue;
                }

                String dedupeKey = String.join("|", normalize(label), normalize(district), normalize(state));
                if (seenKeys.add(dedupeKey)) {
                    results.add(new LocationSuggestionDto(
                            label,
                            displayName,
                            city,
                            district,
                            state,
                            country,
                            item.path("lat").asText(""),
                            item.path("lon").asText("")
                    ));
                }
            }

            return results;
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return List.of();
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.trim().isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
