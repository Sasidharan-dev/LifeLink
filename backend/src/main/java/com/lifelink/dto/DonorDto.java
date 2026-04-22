package com.lifelink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DonorDto {

    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Blood group is required")
        @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group format (e.g. A+, O-, AB+)")
        private String bloodGroup;

        @NotBlank(message = "Location is required")
        private String location;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "District is required")
        private String district;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Phone is required")
        private String phone;

        private Boolean availability = true;

        private LocalDate lastDonationDate;

        private Integer age;

        private Double weight;

        private Boolean healthy = true;

        private Double latitude;

        private Double longitude;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBloodGroup() {
            return bloodGroup;
        }

        public void setBloodGroup(String bloodGroup) {
            this.bloodGroup = bloodGroup;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Boolean getAvailability() {
            return availability;
        }

        public void setAvailability(Boolean availability) {
            this.availability = availability;
        }

        public LocalDate getLastDonationDate() {
            return lastDonationDate;
        }

        public void setLastDonationDate(LocalDate lastDonationDate) {
            this.lastDonationDate = lastDonationDate;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public Double getWeight() {
            return weight;
        }

        public void setWeight(Double weight) {
            this.weight = weight;
        }

        public Boolean getHealthy() {
            return healthy;
        }

        public void setHealthy(Boolean healthy) {
            this.healthy = healthy;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }

    public static class UpdateRequest {
        private String name;
        private String bloodGroup;
        private String location;
        private String state;
        private String district;
        private String city;
        private String phone;
        private Boolean availability;
        private LocalDate lastDonationDate;
        private Integer age;
        private Double weight;
        private Boolean healthy;
        private Double latitude;
        private Double longitude;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBloodGroup() {
            return bloodGroup;
        }

        public void setBloodGroup(String bloodGroup) {
            this.bloodGroup = bloodGroup;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }

        public String getDistrict() {
            return district;
        }

        public void setDistrict(String district) {
            this.district = district;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public Boolean getAvailability() {
            return availability;
        }

        public void setAvailability(Boolean availability) {
            this.availability = availability;
        }

        public LocalDate getLastDonationDate() {
            return lastDonationDate;
        }

        public void setLastDonationDate(LocalDate lastDonationDate) {
            this.lastDonationDate = lastDonationDate;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public Double getWeight() {
            return weight;
        }

        public void setWeight(Double weight) {
            this.weight = weight;
        }

        public Boolean getHealthy() {
            return healthy;
        }

        public void setHealthy(Boolean healthy) {
            this.healthy = healthy;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }

    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private String userEmail;
        private String bloodGroup;
        private String location;
        private String state;
        private String district;
        private String city;
        private String phone;
        private Boolean availability;
        private LocalDate lastDonationDate;
        private LocalDateTime createdAt;
        private Boolean emergencyDonor;
        private Integer age;
        private Double weight;
        private Boolean healthy;
        private Boolean eligibleToDonate;
        private String eligibilityStatus;
        private LocalDate nextEligibleDate;
        private Double latitude;
        private Double longitude;
        private Double distanceKm;
        private Integer matchScore;
        private String whatsappLink;
        private LocalDateTime lastActiveAt;
        private LocalDateTime updatedAt;

        public Response(Long id, Long userId, String userName, String userEmail, String bloodGroup, String location,
                        String state, String district, String city, String phone, Boolean availability,
                        LocalDate lastDonationDate, LocalDateTime createdAt, Boolean emergencyDonor, Integer age,
                        Double weight, Boolean healthy, Boolean eligibleToDonate, String eligibilityStatus,
                        LocalDate nextEligibleDate, Double latitude, Double longitude, Double distanceKm,
                        Integer matchScore, String whatsappLink, LocalDateTime lastActiveAt,
                        LocalDateTime updatedAt) {
            this.id = id;
            this.userId = userId;
            this.userName = userName;
            this.userEmail = userEmail;
            this.bloodGroup = bloodGroup;
            this.location = location;
            this.state = state;
            this.district = district;
            this.city = city;
            this.phone = phone;
            this.availability = availability;
            this.lastDonationDate = lastDonationDate;
            this.createdAt = createdAt;
            this.emergencyDonor = emergencyDonor;
            this.age = age;
            this.weight = weight;
            this.healthy = healthy;
            this.eligibleToDonate = eligibleToDonate;
            this.eligibilityStatus = eligibilityStatus;
            this.nextEligibleDate = nextEligibleDate;
            this.latitude = latitude;
            this.longitude = longitude;
            this.distanceKm = distanceKm;
            this.matchScore = matchScore;
            this.whatsappLink = whatsappLink;
            this.lastActiveAt = lastActiveAt;
            this.updatedAt = updatedAt;
        }

        public Long getId() {
            return id;
        }

        public Long getUserId() {
            return userId;
        }

        public String getUserName() {
            return userName;
        }

        public String getUserEmail() {
            return userEmail;
        }

        public String getBloodGroup() {
            return bloodGroup;
        }

        public String getLocation() {
            return location;
        }

        public String getState() {
            return state;
        }

        public String getDistrict() {
            return district;
        }

        public String getCity() {
            return city;
        }

        public String getPhone() {
            return phone;
        }

        public Boolean getAvailability() {
            return availability;
        }

        public LocalDate getLastDonationDate() {
            return lastDonationDate;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public Boolean getEmergencyDonor() {
            return emergencyDonor;
        }

        public Integer getAge() {
            return age;
        }

        public Double getWeight() {
            return weight;
        }

        public Boolean getHealthy() {
            return healthy;
        }

        public Boolean getEligibleToDonate() {
            return eligibleToDonate;
        }

        public String getEligibilityStatus() {
            return eligibilityStatus;
        }

        public LocalDate getNextEligibleDate() {
            return nextEligibleDate;
        }

        public Double getLatitude() {
            return latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public Double getDistanceKm() {
            return distanceKm;
        }

        public Integer getMatchScore() {
            return matchScore;
        }

        public String getWhatsappLink() {
            return whatsappLink;
        }

        public LocalDateTime getLastActiveAt() {
            return lastActiveAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }
    }
}
