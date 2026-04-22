package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.LocationSuggestionDto;
import com.lifelink.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<LocationSuggestionDto>>> searchLocations(
            @RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(ApiResponse.success(locationService.searchLocations(q)));
    }
}
