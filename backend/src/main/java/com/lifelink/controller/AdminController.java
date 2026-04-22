package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.BloodRequestDto;
import com.lifelink.dto.DonorDto;
import com.lifelink.dto.UserDto;
import com.lifelink.service.AdminService;
import com.lifelink.service.BloodRequestService;
import com.lifelink.service.DonorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DonorService donorService;

    @Autowired
    private BloodRequestService bloodRequestService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto.Response>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @GetMapping("/donors")
    public ResponseEntity<ApiResponse<List<DonorDto.Response>>> getAllDonors() {
        return ResponseEntity.ok(ApiResponse.success(donorService.getAllDonors()));
    }

    @DeleteMapping("/donors/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDonor(@PathVariable Long id) {
        adminService.deleteDonor(id);
        return ResponseEntity.ok(ApiResponse.success("Donor deleted", null));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<BloodRequestDto.Response>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success(bloodRequestService.getAllRequests()));
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        adminService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request deleted", null));
    }
}
