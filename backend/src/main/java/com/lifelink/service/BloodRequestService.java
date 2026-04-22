package com.lifelink.service;

import com.lifelink.dto.BloodRequestDto;
import com.lifelink.dto.DonorDto;
import com.lifelink.entity.BloodRequest;
import com.lifelink.entity.RequestStatus;
import com.lifelink.entity.Urgency;
import com.lifelink.entity.User;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.security.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final UserRepository userRepository;
    private final DonorService donorService;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository, UserRepository userRepository,
                               DonorService donorService) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.userRepository = userRepository;
        this.donorService = donorService;
    }

    public List<BloodRequestDto.Response> getAllRequests() {
        return bloodRequestRepository.findAll().stream()
                .map(this::toResponse)
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    public List<BloodRequestDto.Response> getEmergencyRequests() {
        return bloodRequestRepository.findEmergencyRequests().stream()
                .map(this::toResponse)
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    public List<BloodRequestDto.Response> searchRequests(String bloodGroup, String location, RequestStatus status) {
        return bloodRequestRepository.searchRequests(normalizeOptionalBloodGroup(bloodGroup), normalizeText(location), status).stream()
                .map(this::toResponse)
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    public BloodRequestDto.Response getRequestById(Long id) {
        BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blood request not found with id: " + id));
        return toResponse(request);
    }

    public List<BloodRequestDto.Response> getMyRequests() {
        UserDetailsImpl userDetails = getCurrentUser();
        return bloodRequestRepository.findByRequestedByIdOrderByCreatedAtDesc(userDetails.getId()).stream()
                .map(this::toResponse)
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    @Transactional
    public BloodRequestDto.Response createRequest(BloodRequestDto.CreateRequest req) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setBloodGroup(normalizeRequiredBloodGroup(req.getBloodGroup()));
        bloodRequest.setLocation(normalizeRequiredText(req.getLocation(), "Location"));
        bloodRequest.setState(normalizeText(req.getState()));
        bloodRequest.setDistrict(normalizeText(req.getDistrict()));
        bloodRequest.setCity(normalizeText(req.getCity()));
        bloodRequest.setLatitude(req.getLatitude());
        bloodRequest.setLongitude(req.getLongitude());
        bloodRequest.setUrgency(req.getUrgency());
        bloodRequest.setContact(normalizeRequiredText(req.getContact(), "Contact"));
        bloodRequest.setNotes(normalizeText(req.getNotes()));
        bloodRequest.setStatus(RequestStatus.PENDING);
        bloodRequest.setRequestedBy(user);

        return toResponse(bloodRequestRepository.save(bloodRequest));
    }

    @Transactional
    public BloodRequestDto.Response updateStatus(Long id, BloodRequestDto.StatusUpdate statusUpdate) {
        BloodRequest request = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blood request not found with id: " + id));
        ensureCanManageRequest(request);
        request.setStatus(statusUpdate.getStatus());
        return toResponse(bloodRequestRepository.save(request));
    }

    @Transactional
    public void deleteRequest(Long id) {
        if (!bloodRequestRepository.existsById(id)) {
            throw new RuntimeException("Blood request not found with id: " + id);
        }
        bloodRequestRepository.deleteById(id);
    }

    private BloodRequestDto.Response toResponse(BloodRequest request) {
        List<DonorDto.Response> matchedDonors = donorService.findMatchesForRequest(
                request.getBloodGroup(),
                request.getState(),
                request.getDistrict(),
                request.getCity(),
                request.getLatitude(),
                request.getLongitude(),
                5
        );

        return new BloodRequestDto.Response(
                request.getId(),
                request.getBloodGroup(),
                request.getLocation(),
                request.getState(),
                request.getDistrict(),
                request.getCity(),
                request.getLatitude(),
                request.getLongitude(),
                request.getUrgency(),
                request.getStatus(),
                request.getContact(),
                request.getNotes(),
                request.getRequestedBy() != null ? request.getRequestedBy().getId() : null,
                request.getRequestedBy() != null ? request.getRequestedBy().getName() : null,
                request.getCreatedAt(),
                request.getUpdatedAt(),
                calculatePriorityScore(request),
                matchedDonors.size(),
                matchedDonors
        );
    }

    private Comparator<BloodRequestDto.Response> responseComparator() {
        return Comparator
                .comparing(BloodRequestDto.Response::getPriorityScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(BloodRequestDto.Response::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private Integer calculatePriorityScore(BloodRequest request) {
        int urgencyScore = switch (request.getUrgency()) {
            case CRITICAL -> 130;
            case HIGH -> 100;
            case MEDIUM -> 50;
            case LOW -> 10;
        };

        int hoursOpen = request.getCreatedAt() == null ? 0 : (int) java.time.Duration.between(request.getCreatedAt(), java.time.LocalDateTime.now()).toHours();
        return urgencyScore + Math.min(hoursOpen, 48);
    }

    private void ensureCanManageRequest(BloodRequest request) {
        UserDetailsImpl currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = request.getRequestedBy() != null && request.getRequestedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Not authorized to update this blood request");
        }
    }

    private String normalizeRequiredBloodGroup(String bloodGroup) {
        String normalized = normalizeRequiredText(bloodGroup, "Blood group").toUpperCase(Locale.ROOT);
        if (!normalized.matches("^(A|B|AB|O)[+-]$")) {
            throw new RuntimeException("Invalid blood group format");
        }
        return normalized;
    }

    private String normalizeOptionalBloodGroup(String bloodGroup) {
        String normalized = normalizeText(bloodGroup);
        if (normalized == null) {
            return null;
        }
        normalized = normalized.toUpperCase(Locale.ROOT);
        if (!normalized.matches("^(A|B|AB|O)[+-]$")) {
            throw new RuntimeException("Invalid blood group format");
        }
        return normalized;
    }

    private String normalizeRequiredText(String value, String label) {
        String normalized = normalizeText(value);
        if (normalized == null) {
            throw new RuntimeException(label + " is required");
        }
        return normalized;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
