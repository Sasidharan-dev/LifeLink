package com.lifelink.repository;

import com.lifelink.entity.BloodRequest;
import com.lifelink.entity.RequestStatus;
import com.lifelink.entity.Urgency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByStatus(RequestStatus status);

    List<BloodRequest> findByUrgency(Urgency urgency);

    List<BloodRequest> findByBloodGroup(String bloodGroup);

    @Query("SELECT r FROM BloodRequest r WHERE r.urgency IN ('HIGH', 'CRITICAL') AND r.status = 'PENDING' ORDER BY r.createdAt DESC")
    List<BloodRequest> findEmergencyRequests();

    @Query("SELECT COUNT(r) FROM BloodRequest r WHERE r.urgency IN ('HIGH', 'CRITICAL') AND r.status = 'PENDING'")
    long countEmergencyRequests();

    long countByStatus(RequestStatus status);

    long countByUrgencyAndStatus(Urgency urgency, RequestStatus status);

    long countByCreatedAtAfter(LocalDateTime createdAt);

    @Query("SELECT r FROM BloodRequest r WHERE " +
           "(:bloodGroup IS NULL OR r.bloodGroup = :bloodGroup) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<BloodRequest> searchRequests(
            @Param("bloodGroup") String bloodGroup,
            @Param("location") String location,
            @Param("status") RequestStatus status
    );

    List<BloodRequest> findByRequestedByIdOrderByCreatedAtDesc(Long userId);
}
