package com.lifelink.service;

import com.lifelink.dto.DonorDto;
import com.lifelink.dto.DonorFilterOptionsDto;
import com.lifelink.entity.Donor;
import com.lifelink.entity.User;
import com.lifelink.repository.DonorRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.security.UserDetailsImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class DonorService {

    private static final int DONATION_RECOVERY_DAYS = 90;

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    public DonorService(DonorRepository donorRepository, UserRepository userRepository) {
        this.donorRepository = donorRepository;
        this.userRepository = userRepository;
    }

    public List<DonorDto.Response> getAllDonors() {
        return donorRepository.findAll().stream()
                .map(donor -> toResponse(donor, null, null, null, null))
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    public List<DonorDto.Response> searchDonors(String bloodGroup, String state, String district, String city, Boolean availability) {
        String normalizedBloodGroup = normalizeOptionalBloodGroup(bloodGroup);
        String normalizedState = normalizeText(state);
        String normalizedDistrict = normalizeText(district);
        String normalizedCity = normalizeText(city);

        return donorRepository.searchDonors(normalizedBloodGroup, normalizedState, normalizedDistrict, normalizedCity, availability).stream()
                .map(donor -> toResponse(donor, normalizedBloodGroup, normalizedState, normalizedDistrict, normalizedCity))
                .sorted(responseComparator())
                .collect(Collectors.toList());
    }

    public DonorFilterOptionsDto getFilterOptions(String state, String district) {
        return new DonorFilterOptionsDto(
                donorRepository.findDistinctStates(),
                donorRepository.findDistinctDistricts(normalizeText(state)),
                donorRepository.findDistinctCities(normalizeText(state), normalizeText(district))
        );
    }

    public DonorDto.Response getDonorById(Long id) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found with id: " + id));
        return toResponse(donor, null, null, null, null);
    }

    public DonorDto.Response getMyDonorProfile() {
        UserDetailsImpl userDetails = getCurrentUser();
        Donor donor = donorRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Donor profile not found for current user"));
        return toResponse(donor, null, null, null, null);
    }

    public List<DonorDto.Response> findMatchesForRequest(String bloodGroup, String state, String district, String city,
                                                         Double latitude, Double longitude, int limit) {
        String normalizedBloodGroup = normalizeOptionalBloodGroup(bloodGroup);
        String normalizedState = normalizeText(state);
        String normalizedDistrict = normalizeText(district);
        String normalizedCity = normalizeText(city);

        return donorRepository.findAll().stream()
                .filter(donor -> normalizedBloodGroup == null || normalizedBloodGroup.equalsIgnoreCase(donor.getBloodGroup()))
                .map(donor -> toResponse(donor, normalizedBloodGroup, normalizedState, normalizedDistrict, normalizedCity,
                        latitude, longitude))
                .filter(response -> response.getMatchScore() != null && response.getMatchScore() > 0)
                .sorted(responseComparator())
                .limit(Math.max(limit, 1))
                .collect(Collectors.toList());
    }

    @Transactional
    public DonorDto.Response createDonor(DonorDto.CreateRequest request) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (donorRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Donor profile already exists for this user");
        }

        validateDonationDate(request.getLastDonationDate());
        validateEligibilityInputs(request.getAge(), request.getWeight());
        updateUserName(user, request.getName());

        Donor donor = new Donor();
        donor.setUser(user);
        applyDonorData(donor, request.getBloodGroup(), request.getLocation(), request.getState(), request.getDistrict(),
                request.getCity(), request.getPhone(), request.getAvailability(), request.getLastDonationDate(),
                request.getAge(), request.getWeight(), request.getHealthy(), request.getLatitude(), request.getLongitude());
        donor.setLastActiveAt(LocalDateTime.now());

        return toResponse(donorRepository.save(donor), null, null, null, null);
    }

    @Transactional
    public DonorDto.Response updateDonor(Long id, DonorDto.UpdateRequest request) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found with id: " + id));
        ensureCanEdit(donor);

        if (request.getName() != null) {
            updateUserName(donor.getUser(), request.getName());
        }
        if (request.getBloodGroup() != null) {
            donor.setBloodGroup(normalizeBloodGroup(request.getBloodGroup()));
        }
        if (request.getState() != null) {
            donor.setState(normalizeRequiredText(request.getState(), "State"));
        }
        if (request.getDistrict() != null) {
            donor.setDistrict(normalizeRequiredText(request.getDistrict(), "District"));
        }
        if (request.getCity() != null) {
            donor.setCity(normalizeRequiredText(request.getCity(), "City"));
        }
        if (request.getLocation() != null || request.getState() != null || request.getDistrict() != null || request.getCity() != null) {
            donor.setLocation(buildLocation(request.getLocation(), donor.getCity(), donor.getDistrict(), donor.getState()));
        }
        if (request.getPhone() != null) {
            donor.setPhone(normalizeRequiredText(request.getPhone(), "Phone"));
        }
        if (request.getAvailability() != null) {
            donor.setAvailability(request.getAvailability());
        }
        if (request.getLastDonationDate() != null) {
            validateDonationDate(request.getLastDonationDate());
            donor.setLastDonationDate(request.getLastDonationDate());
        }
        if (request.getAge() != null) {
            donor.setAge(request.getAge());
        }
        if (request.getWeight() != null) {
            donor.setWeight(request.getWeight());
        }
        if (request.getHealthy() != null) {
            donor.setHealthy(request.getHealthy());
        }
        if (request.getLatitude() != null) {
            donor.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            donor.setLongitude(request.getLongitude());
        }

        validateEligibilityInputs(donor.getAge(), donor.getWeight());
        donor.setLastActiveAt(LocalDateTime.now());
        return toResponse(donorRepository.save(donor), null, null, null, null);
    }

    @Transactional
    public DonorDto.Response toggleAvailability(Long id) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donor not found with id: " + id));
        ensureCanEdit(donor);

        donor.setAvailability(!Boolean.TRUE.equals(donor.getAvailability()));
        donor.setLastActiveAt(LocalDateTime.now());
        return toResponse(donorRepository.save(donor), null, null, null, null);
    }

    @Transactional
    public void deleteDonor(Long id) {
        if (!donorRepository.existsById(id)) {
            throw new RuntimeException("Donor not found with id: " + id);
        }
        donorRepository.deleteById(id);
    }

    private void applyDonorData(Donor donor, String bloodGroup, String location, String state, String district,
                                String city, String phone, Boolean availability, LocalDate lastDonationDate,
                                Integer age, Double weight, Boolean healthy, Double latitude, Double longitude) {
        donor.setBloodGroup(normalizeBloodGroup(bloodGroup));
        donor.setState(normalizeRequiredText(state, "State"));
        donor.setDistrict(normalizeRequiredText(district, "District"));
        donor.setCity(normalizeRequiredText(city, "City"));
        donor.setLocation(buildLocation(location, donor.getCity(), donor.getDistrict(), donor.getState()));
        donor.setPhone(normalizeRequiredText(phone, "Phone"));
        donor.setAvailability(availability != null ? availability : true);
        donor.setLastDonationDate(lastDonationDate);
        donor.setAge(age);
        donor.setWeight(weight);
        donor.setHealthy(healthy != null ? healthy : true);
        donor.setLatitude(latitude);
        donor.setLongitude(longitude);
    }

    private void ensureCanEdit(Donor donor) {
        UserDetailsImpl currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !donor.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this donor profile");
        }
    }

    private void updateUserName(User user, String name) {
        user.setName(normalizeRequiredText(name, "Name"));
        userRepository.save(user);
    }

    private DonorDto.Response toResponse(Donor donor, String bloodGroup, String state, String district, String city) {
        return toResponse(donor, bloodGroup, state, district, city, null, null);
    }

    private DonorDto.Response toResponse(Donor donor, String bloodGroup, String state, String district, String city,
                                         Double latitude, Double longitude) {
        Integer matchScore = calculateMatchScore(donor, bloodGroup, state, district, city, latitude, longitude);
        Double distanceKm = calculateDistanceKm(latitude, longitude, donor.getLatitude(), donor.getLongitude());
        boolean eligibleToDonate = isEligible(donor);
        LocalDate nextEligibleDate = getNextEligibleDate(donor.getLastDonationDate());
        String eligibilityStatus = buildEligibilityStatus(donor, eligibleToDonate, nextEligibleDate);

        return new DonorDto.Response(
                donor.getId(),
                donor.getUser().getId(),
                donor.getUser().getName(),
                donor.getUser().getEmail(),
                donor.getBloodGroup(),
                donor.getLocation(),
                donor.getState(),
                donor.getDistrict(),
                donor.getCity(),
                donor.getPhone(),
                donor.getAvailability(),
                donor.getLastDonationDate(),
                donor.getCreatedAt(),
                isEmergencyDonor(donor),
                donor.getAge(),
                donor.getWeight(),
                donor.getHealthy(),
                eligibleToDonate,
                eligibilityStatus,
                nextEligibleDate,
                donor.getLatitude(),
                donor.getLongitude(),
                distanceKm,
                matchScore,
                buildWhatsappLink(donor.getPhone()),
                donor.getLastActiveAt(),
                donor.getUpdatedAt()
        );
    }

    private Comparator<DonorDto.Response> responseComparator() {
        return Comparator
                .comparing(DonorDto.Response::getMatchScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(DonorDto.Response::getDistanceKm, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(DonorDto.Response::getAvailability, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(DonorDto.Response::getEligibleToDonate, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(DonorDto.Response::getLastActiveAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(DonorDto.Response::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private Integer calculateMatchScore(Donor donor, String bloodGroup, String state, String district, String city,
                                        Double latitude, Double longitude) {
        boolean hasSearchContext = bloodGroup != null || state != null || district != null || city != null
                || (latitude != null && longitude != null);
        if (!hasSearchContext) {
            return null;
        }

        int score = 0;

        if (bloodGroup != null && bloodGroup.equalsIgnoreCase(donor.getBloodGroup())) {
            score += 45;
        }
        if (sameLocation(city, donor.getCity())) {
            score += 25;
        }
        if (sameLocation(district, donor.getDistrict())) {
            score += 15;
        }
        if (sameLocation(state, donor.getState())) {
            score += 10;
        }
        if (Boolean.TRUE.equals(donor.getAvailability())) {
            score += 20;
        }
        if (isEligible(donor)) {
            score += 10;
        }

        Double distanceKm = calculateDistanceKm(latitude, longitude, donor.getLatitude(), donor.getLongitude());
        if (distanceKm != null && distanceKm <= 25) {
            score += 5;
        }

        return score;
    }

    private boolean isEligible(Donor donor) {
        if (donor == null) {
            return false;
        }
        if (Boolean.FALSE.equals(donor.getHealthy())) {
            return false;
        }
        if (donor.getAge() != null && donor.getAge() < 18) {
            return false;
        }
        if (donor.getWeight() != null && donor.getWeight() < 50) {
            return false;
        }
        LocalDate nextEligibleDate = getNextEligibleDate(donor.getLastDonationDate());
        return nextEligibleDate == null || !nextEligibleDate.isAfter(LocalDate.now());
    }

    private String buildEligibilityStatus(Donor donor, boolean eligibleToDonate, LocalDate nextEligibleDate) {
        if (eligibleToDonate) {
            return "Eligible";
        }
        if (Boolean.FALSE.equals(donor.getHealthy())) {
            return "Health review needed";
        }
        if (donor.getAge() != null && donor.getAge() < 18) {
            return "Under minimum age";
        }
        if (donor.getWeight() != null && donor.getWeight() < 50) {
            return "Below minimum weight";
        }
        if (nextEligibleDate != null && nextEligibleDate.isAfter(LocalDate.now())) {
            return "Recovery period active";
        }
        return "Eligibility pending";
    }

    private LocalDate getNextEligibleDate(LocalDate lastDonationDate) {
        return lastDonationDate == null ? null : lastDonationDate.plusDays(DONATION_RECOVERY_DAYS);
    }

    private boolean isEmergencyDonor(Donor donor) {
        return Boolean.TRUE.equals(donor.getAvailability()) && isEligible(donor) && "O-".equalsIgnoreCase(donor.getBloodGroup());
    }

    private String buildLocation(String location, String city, String district, String state) {
        String normalizedLocation = normalizeText(location);
        if (normalizedLocation != null) {
            return normalizedLocation;
        }
        return String.join(", ",
                normalizeRequiredText(city, "City"),
                normalizeRequiredText(district, "District"),
                normalizeRequiredText(state, "State"));
    }

    private String buildWhatsappLink(String phone) {
        String digits = phone == null ? "" : phone.replaceAll("[^\\d]", "");
        if (digits.isBlank()) {
            return null;
        }
        String normalized = digits.length() == 10 ? "91" + digits : digits;
        return "https://wa.me/" + normalized;
    }

    private Double calculateDistanceKm(Double sourceLat, Double sourceLon, Double targetLat, Double targetLon) {
        if (sourceLat == null || sourceLon == null || targetLat == null || targetLon == null) {
            return null;
        }

        double earthRadiusKm = 6371.0;
        double latDistance = Math.toRadians(targetLat - sourceLat);
        double lonDistance = Math.toRadians(targetLon - sourceLon);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(sourceLat)) * Math.cos(Math.toRadians(targetLat))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((earthRadiusKm * c) * 10.0) / 10.0;
    }

    private boolean sameLocation(String requested, String donorValue) {
        return normalizeText(requested) != null && normalizeText(requested).equals(normalizeText(donorValue));
    }

    private String normalizeBloodGroup(String bloodGroup) {
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

    private void validateDonationDate(LocalDate date) {
        if (date != null && date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Last donation date cannot be in the future");
        }
    }

    private void validateEligibilityInputs(Integer age, Double weight) {
        if (age != null && age < 0) {
            throw new RuntimeException("Age cannot be negative");
        }
        if (weight != null && weight < 0) {
            throw new RuntimeException("Weight cannot be negative");
        }
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
