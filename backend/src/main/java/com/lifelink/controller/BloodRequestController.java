package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.BloodRequestDto;
import com.lifelink.entity.RequestStatus;
import com.lifelink.service.BloodRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BloodRequestController {

    @Autowired
    private BloodRequestService bloodRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BloodRequestDto.Response>>> getAllRequests(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) RequestStatus status) {
        if (bloodGroup != null || location != null || status != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    bloodRequestService.searchRequests(bloodGroup, location, status)));
        }
        return ResponseEntity.ok(ApiResponse.success(bloodRequestService.getAllRequests()));
    }

    @GetMapping("/emergency")
    public ResponseEntity<ApiResponse<List<BloodRequestDto.Response>>> getEmergencyRequests() {
        return ResponseEntity.ok(ApiResponse.success(bloodRequestService.getEmergencyRequests()));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BloodRequestDto.Response>>> getMyRequests() {
        return ResponseEntity.ok(ApiResponse.success(bloodRequestService.getMyRequests()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodRequestDto.Response>> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bloodRequestService.getRequestById(id)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BloodRequestDto.Response>> createRequest(
            @Valid @RequestBody BloodRequestDto.CreateRequest request) {
        BloodRequestDto.Response response = bloodRequestService.createRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Blood request created successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BloodRequestDto.Response>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody BloodRequestDto.StatusUpdate statusUpdate) {
        BloodRequestDto.Response response = bloodRequestService.updateStatus(id, statusUpdate);
        return ResponseEntity.ok(ApiResponse.success("Request status updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        bloodRequestService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request deleted successfully", null));
    }
}
