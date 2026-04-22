package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.DonorDto;
import com.lifelink.dto.DonorFilterOptionsDto;
import com.lifelink.service.DonorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DonorController {

    @Autowired
    private DonorService donorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonorDto.Response>>> getAllDonors() {
        return ResponseEntity.ok(ApiResponse.success(donorService.getAllDonors()));
    }

    @GetMapping("/filters")
    public ResponseEntity<ApiResponse<DonorFilterOptionsDto>> getFilterOptions(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district) {
        return ResponseEntity.ok(ApiResponse.success(donorService.getFilterOptions(state, district)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DonorDto.Response>>> searchDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean availability) {
        return ResponseEntity.ok(ApiResponse.success(
                donorService.searchDonors(bloodGroup, state, district, city, availability)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonorDto.Response>> getDonorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(donorService.getDonorById(id)));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DonorDto.Response>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(donorService.getMyDonorProfile()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DonorDto.Response>> createDonor(
            @Valid @RequestBody DonorDto.CreateRequest request) {
        DonorDto.Response response = donorService.createDonor(request);
        return ResponseEntity.ok(ApiResponse.success("Donor profile created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DonorDto.Response>> updateDonor(
            @PathVariable Long id,
            @RequestBody DonorDto.UpdateRequest request) {
        DonorDto.Response response = donorService.updateDonor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Donor profile updated successfully", response));
    }

    @PutMapping("/{id}/toggle-availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DonorDto.Response>> toggleAvailability(@PathVariable Long id) {
        DonorDto.Response response = donorService.toggleAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Availability toggled", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDonor(@PathVariable Long id) {
        donorService.deleteDonor(id);
        return ResponseEntity.ok(ApiResponse.success("Donor deleted successfully", null));
    }
}
