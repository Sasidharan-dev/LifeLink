package com.lifelink.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "donors")
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(name = "blood_group", nullable = false)
    private String bloodGroup;

    @NotBlank
    @Column(nullable = false)
    private String location;

    @Column(name = "state_name")
    private String state;

    @Column(name = "district_name")
    private String district;

    @Column(name = "city_name")
    private String city;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private Boolean availability = true;

    @Column(name = "last_donation_date")
    private java.time.LocalDate lastDonationDate;

    @Column
    private Integer age;

    @Column
    private Double weight;

    @Column(nullable = false)
    private Boolean healthy = true;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @Column(name = "last_active_at")
    private java.time.LocalDateTime lastActiveAt;

    @PrePersist
    protected void onCreate() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        lastActiveAt = now;
        if (availability == null) {
            availability = true;
        }
        if (healthy == null) {
            healthy = true;
        }
    }

    @jakarta.persistence.PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    public Donor() {
    }

    public Donor(Long id, User user, String bloodGroup, String location, String state, String district, String city,
                 String phone, Boolean availability, java.time.LocalDate lastDonationDate, Integer age, Double weight,
                 Boolean healthy, Double latitude, Double longitude, java.time.LocalDateTime createdAt,
                 java.time.LocalDateTime updatedAt, java.time.LocalDateTime lastActiveAt) {
        this.id = id;
        this.user = user;
        this.bloodGroup = bloodGroup;
        this.location = location;
        this.state = state;
        this.district = district;
        this.city = city;
        this.phone = phone;
        this.availability = availability;
        this.lastDonationDate = lastDonationDate;
        this.age = age;
        this.weight = weight;
        this.healthy = healthy;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastActiveAt = lastActiveAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public java.time.LocalDate getLastDonationDate() {
        return lastDonationDate;
    }

    public void setLastDonationDate(java.time.LocalDate lastDonationDate) {
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

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public java.time.LocalDateTime getLastActiveAt() {
        return lastActiveAt;
    }

    public void setLastActiveAt(java.time.LocalDateTime lastActiveAt) {
        this.lastActiveAt = lastActiveAt;
    }
}
