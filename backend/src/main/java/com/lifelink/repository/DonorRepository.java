package com.lifelink.repository;

import com.lifelink.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    Optional<Donor> findByUserId(Long userId);

    List<Donor> findByAvailabilityTrue();

    @Query("SELECT d FROM Donor d WHERE " +
           "(:bloodGroup IS NULL OR d.bloodGroup = :bloodGroup) AND " +
           "(:state IS NULL OR LOWER(COALESCE(d.state, '')) = LOWER(:state)) AND " +
           "(:district IS NULL OR LOWER(COALESCE(d.district, '')) = LOWER(:district)) AND " +
           "(:city IS NULL OR LOWER(COALESCE(d.city, '')) = LOWER(:city)) AND " +
           "(:availability IS NULL OR d.availability = :availability)")
    List<Donor> searchDonors(
            @Param("bloodGroup") String bloodGroup,
            @Param("state") String state,
            @Param("district") String district,
            @Param("city") String city,
            @Param("availability") Boolean availability
    );

    @Query("SELECT COUNT(d) FROM Donor d WHERE d.availability = true")
    long countActiveDonors();

    @Query("SELECT COUNT(d) FROM Donor d WHERE d.availability = true AND COALESCE(d.healthy, true) = true " +
           "AND (d.age IS NULL OR d.age >= 18) AND (d.weight IS NULL OR d.weight >= 50)")
    long countEligibleDonors();

    @Query("SELECT DISTINCT d.state FROM Donor d WHERE d.state IS NOT NULL AND d.state <> '' ORDER BY d.state ASC")
    List<String> findDistinctStates();

    @Query("SELECT DISTINCT d.district FROM Donor d WHERE d.district IS NOT NULL AND d.district <> '' " +
           "AND (:state IS NULL OR LOWER(d.state) = LOWER(:state)) ORDER BY d.district ASC")
    List<String> findDistinctDistricts(@Param("state") String state);

    @Query("SELECT DISTINCT d.city FROM Donor d WHERE d.city IS NOT NULL AND d.city <> '' " +
           "AND (:state IS NULL OR LOWER(d.state) = LOWER(:state)) " +
           "AND (:district IS NULL OR LOWER(d.district) = LOWER(:district)) ORDER BY d.city ASC")
    List<String> findDistinctCities(@Param("state") String state, @Param("district") String district);
}
