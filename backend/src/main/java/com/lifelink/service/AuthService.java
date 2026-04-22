package com.lifelink.service;

import com.lifelink.dto.AuthDto;
import com.lifelink.dto.UserDto;
import com.lifelink.entity.PasswordResetToken;
import com.lifelink.entity.Role;
import com.lifelink.entity.User;
import com.lifelink.repository.PasswordResetTokenRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.security.JwtUtils;
import com.lifelink.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private static final String INVALID_RESET_TOKEN_MESSAGE = "Reset link is invalid or has expired";

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.reset-password-url:http://localhost:5173/reset-password}")
    private String resetPasswordBaseUrl;

    @Value("${app.security.password-reset.expiry-minutes:15}")
    private long passwordResetExpiryMinutes;

    public UserDto.Response getCurrentUser() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserDto.Response(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedName = normalizeName(request.getName());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.DONOR;

        User user = new User();
        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        userRepository.save(user);

        String token = jwtUtils.generateTokenFromEmail(user.getEmail());

        return new AuthDto.AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizeEmail(request.getEmail()), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("DONOR");

        return new AuthDto.AuthResponse(
                jwt,
                "Bearer",
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(),
                role
        );
    }

    @Transactional
    public void forgotPassword(AuthDto.ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            return;
        }

        passwordResetTokenRepository.markAllAsUsedByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUserId(user.getId());
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(passwordResetExpiryMinutes));
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        String resetLink = buildResetLink(resetToken.getToken());
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetLink, passwordResetExpiryMinutes);
    }

    @Transactional
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        PasswordResetToken resetToken = getValidResetToken(request.getToken());
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException(INVALID_RESET_TOKEN_MESSAGE));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        resetToken.setUsed(true);

        userRepository.save(user);
        passwordResetTokenRepository.save(resetToken);
    }

    public void validateResetPasswordToken(String token) {
        getValidResetToken(token);
    }

    private UserDetailsImpl getCurrentUserDetails() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String name) {
        String normalized = name == null ? "" : name.trim();
        if (normalized.isBlank()) {
            throw new RuntimeException("Name is required");
        }
        return normalized;
    }

    private PasswordResetToken getValidResetToken(String token) {
        String normalizedToken = token == null ? "" : token.trim();
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(normalizedToken)
                .orElseThrow(() -> new RuntimeException(INVALID_RESET_TOKEN_MESSAGE));

        if (resetToken.isUsed() || resetToken.getExpiryDate() == null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(INVALID_RESET_TOKEN_MESSAGE);
        }

        return resetToken;
    }

    private String buildResetLink(String token) {
        String baseUrl = resetPasswordBaseUrl == null ? "" : resetPasswordBaseUrl.trim();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/" + token;
    }
}
