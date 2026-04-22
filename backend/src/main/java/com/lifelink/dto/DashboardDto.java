package com.lifelink.dto;

public class DashboardDto {
    private long totalDonors;
    private long activeDonors;
    private long totalRequests;
    private long pendingRequests;
    private long emergencyRequests;
    private long totalUsers;
    private long completedRequests;
    private long recentRequests;
    private long criticalRequests;
    private long eligibleDonors;

    public DashboardDto() {
    }

    public DashboardDto(long totalDonors, long activeDonors, long totalRequests, long pendingRequests,
                        long emergencyRequests, long totalUsers, long completedRequests, long recentRequests,
                        long criticalRequests, long eligibleDonors) {
        this.totalDonors = totalDonors;
        this.activeDonors = activeDonors;
        this.totalRequests = totalRequests;
        this.pendingRequests = pendingRequests;
        this.emergencyRequests = emergencyRequests;
        this.totalUsers = totalUsers;
        this.completedRequests = completedRequests;
        this.recentRequests = recentRequests;
        this.criticalRequests = criticalRequests;
        this.eligibleDonors = eligibleDonors;
    }

    public long getTotalDonors() {
        return totalDonors;
    }

    public void setTotalDonors(long totalDonors) {
        this.totalDonors = totalDonors;
    }

    public long getActiveDonors() {
        return activeDonors;
    }

    public void setActiveDonors(long activeDonors) {
        this.activeDonors = activeDonors;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getEmergencyRequests() {
        return emergencyRequests;
    }

    public void setEmergencyRequests(long emergencyRequests) {
        this.emergencyRequests = emergencyRequests;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getCompletedRequests() {
        return completedRequests;
    }

    public void setCompletedRequests(long completedRequests) {
        this.completedRequests = completedRequests;
    }

    public long getRecentRequests() {
        return recentRequests;
    }

    public void setRecentRequests(long recentRequests) {
        this.recentRequests = recentRequests;
    }

    public long getCriticalRequests() {
        return criticalRequests;
    }

    public void setCriticalRequests(long criticalRequests) {
        this.criticalRequests = criticalRequests;
    }

    public long getEligibleDonors() {
        return eligibleDonors;
    }

    public void setEligibleDonors(long eligibleDonors) {
        this.eligibleDonors = eligibleDonors;
    }
}
