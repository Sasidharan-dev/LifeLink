package com.lifelink.service;

import com.lifelink.dto.UserDto;
import com.lifelink.entity.User;
import com.lifelink.repository.DonorRepository;
import com.lifelink.repository.BloodRequestRepository;
import com.lifelink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private BloodRequestRepository bloodRequestRepository;

    public List<UserDto.Response> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteDonor(Long id) {
        if (!donorRepository.existsById(id)) {
            throw new RuntimeException("Donor not found with id: " + id);
        }
        donorRepository.deleteById(id);
    }

    @Transactional
    public void deleteRequest(Long id) {
        if (!bloodRequestRepository.existsById(id)) {
            throw new RuntimeException("Request not found with id: " + id);
        }
        bloodRequestRepository.deleteById(id);
    }

    private UserDto.Response toUserResponse(User user) {
        return new UserDto.Response(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
