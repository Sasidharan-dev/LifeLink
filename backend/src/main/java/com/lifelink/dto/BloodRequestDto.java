package com.lifelink.dto;

import com.lifelink.entity.RequestStatus;
import com.lifelink.entity.Urgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.util.List;

public class BloodRequestDto {

    public static class CreateRequest {
        @NotBlank(message = "Blood group is required")
        @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group format")
        private String bloodGroup;

        @NotBlank(message = "Location is required")
        private String location;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "District is required")
        private String district;

        @NotBlank(message = "City is required")
        private String city;

        private Double latitude;

        private Double longitude;

        @NotNull(message = "Urgency is required")
        private Urgency urgency;

        @NotBlank(message = "Contact is required")
        private String contact;

        private String notes;

        public CreateRequest() {
        }

        public CreateRequest(String bloodGroup, String location, Urgency urgency, String contact, String notes) {
            this.bloodGroup = bloodGroup;
            this.location = location;
            this.urgency = urgency;
            this.contact = contact;
            this.notes = notes;
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

        public Urgency getUrgency() {
            return urgency;
        }

        public void setUrgency(Urgency urgency) {
            this.urgency = urgency;
        }

        public String getContact() {
            return contact;
        }

        public void setContact(String contact) {
            this.contact = contact;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class StatusUpdate {
        @NotNull(message = "Status is required")
        private RequestStatus status;

        public StatusUpdate() {
        }

        public StatusUpdate(RequestStatus status) {
            this.status = status;
        }

        public RequestStatus getStatus() {
            return status;
        }

        public void setStatus(RequestStatus status) {
            this.status = status;
        }
    }

    public static class Response {
        private Long id;
        private String bloodGroup;
        private String location;
        private String state;
        private String district;
        private String city;
        private Double latitude;
        private Double longitude;
        private Urgency urgency;
        private RequestStatus status;
        private String contact;
        private String notes;
        private Long requestedById;
        private String requestedByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Integer priorityScore;
        private Integer matchedDonorCount;
        private List<DonorDto.Response> matchedDonors;

        public Response() {
        }

        public Response(Long id, String bloodGroup, String location, String state, String district, String city,
                        Double latitude, Double longitude, Urgency urgency, RequestStatus status,
                        String contact, String notes, Long requestedById, String requestedByName,
                        LocalDateTime createdAt, LocalDateTime updatedAt, Integer priorityScore,
                        Integer matchedDonorCount, List<DonorDto.Response> matchedDonors) {
            this.id = id;
            this.bloodGroup = bloodGroup;
            this.location = location;
            this.state = state;
            this.district = district;
            this.city = city;
            this.latitude = latitude;
            this.longitude = longitude;
            this.urgency = urgency;
            this.status = status;
            this.contact = contact;
            this.notes = notes;
            this.requestedById = requestedById;
            this.requestedByName = requestedByName;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.priorityScore = priorityScore;
            this.matchedDonorCount = matchedDonorCount;
            this.matchedDonors = matchedDonors;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public Urgency getUrgency() {
            return urgency;
        }

        public void setUrgency(Urgency urgency) {
            this.urgency = urgency;
        }

        public RequestStatus getStatus() {
            return status;
        }

        public void setStatus(RequestStatus status) {
            this.status = status;
        }

        public String getContact() {
            return contact;
        }

        public void setContact(String contact) {
            this.contact = contact;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public Long getRequestedById() {
            return requestedById;
        }

        public void setRequestedById(Long requestedById) {
            this.requestedById = requestedById;
        }

        public String getRequestedByName() {
            return requestedByName;
        }

        public void setRequestedByName(String requestedByName) {
            this.requestedByName = requestedByName;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        public Integer getPriorityScore() {
            return priorityScore;
        }

        public void setPriorityScore(Integer priorityScore) {
            this.priorityScore = priorityScore;
        }

        public Integer getMatchedDonorCount() {
            return matchedDonorCount;
        }

        public void setMatchedDonorCount(Integer matchedDonorCount) {
            this.matchedDonorCount = matchedDonorCount;
        }

        public List<DonorDto.Response> getMatchedDonors() {
            return matchedDonors;
        }

        public void setMatchedDonors(List<DonorDto.Response> matchedDonors) {
            this.matchedDonors = matchedDonors;
        }
    }
}
