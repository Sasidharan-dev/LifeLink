package com.lifelink.service;

import com.lifelink.dto.DashboardDto;
import com.lifelink.entity.RequestStatus;
import com.lifelink.entity.Urgency;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.DonorRepository;
import com.lifelink.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;

    public DashboardService(UserRepository userRepository, DonorRepository donorRepository,
                            BloodRequestRepository bloodRequestRepository) {
        this.userRepository = userRepository;
        this.donorRepository = donorRepository;
        this.bloodRequestRepository = bloodRequestRepository;
    }

    public DashboardDto getDashboardStats() {
        long totalDonors = donorRepository.count();
        long activeDonors = donorRepository.countActiveDonors();
        long totalRequests = bloodRequestRepository.count();
        long pendingRequests = bloodRequestRepository.countByStatus(RequestStatus.PENDING);
        long emergencyRequests = bloodRequestRepository.countEmergencyRequests();
        long totalUsers = userRepository.count();
        long completedRequests = bloodRequestRepository.countByStatus(RequestStatus.COMPLETED);
        long recentRequests = bloodRequestRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));
        long criticalRequests = bloodRequestRepository.countByUrgencyAndStatus(Urgency.CRITICAL, RequestStatus.PENDING);
        long eligibleDonors = donorRepository.countEligibleDonors();

        return new DashboardDto(
                totalDonors,
                activeDonors,
                totalRequests,
                pendingRequests,
                emergencyRequests,
                totalUsers,
                completedRequests,
                recentRequests,
                criticalRequests,
                eligibleDonors
        );
    }
}
