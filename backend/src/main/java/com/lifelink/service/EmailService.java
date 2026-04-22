package com.lifelink.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.require-smtp:false}")
    private boolean requireSmtp;

    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink, long expiryMinutes) {
        if (!isSmtpConfigured()) {
            if (requireSmtp) {
                throw new RuntimeException("Email delivery is not configured on the server.");
            }

            log.warn("SMTP is not configured. Password reset email was not sent to {}. Use this reset link for local testing: {}", toEmail, resetLink);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            if (fromAddress != null && !fromAddress.isBlank()) {
                helper.setFrom(fromAddress);
            }

            helper.setTo(toEmail);
            helper.setSubject("LifeLink password reset request");
            helper.setText(buildPasswordResetEmail(userName, resetLink, expiryMinutes), true);

            mailSender.send(message);
        } catch (MailException | MessagingException ex) {
            log.error("Failed to send password reset email to {}", toEmail, ex);
            throw new RuntimeException("Unable to send reset email right now. Please try again later.");
        }
    }

    private boolean isSmtpConfigured() {
        return fromAddress != null && !fromAddress.isBlank()
                && mailPassword != null && !mailPassword.isBlank();
    }

    private String buildPasswordResetEmail(String userName, String resetLink, long expiryMinutes) {
        String safeName = (userName == null || userName.isBlank()) ? "there" : userName.trim();

        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:24px;">
                  <h2 style="margin:0 0 16px;color:#b91c1c;">Reset your LifeLink password</h2>
                  <p>Hello %s,</p>
                  <p>We received a request to reset your LifeLink password. Use the button below to choose a new one.</p>
                  <p style="margin:24px 0;">
                    <a href="%s" style="background:#dc2626;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;display:inline-block;font-weight:600;">Reset Password</a>
                  </p>
                  <p>This link will expire in %d minutes and can only be used once.</p>
                  <p>If you did not request this change, you can safely ignore this email.</p>
                  <p style="word-break:break-all;color:#6b7280;font-size:13px;">%s</p>
                </div>
                """.formatted(safeName, resetLink, expiryMinutes, resetLink);
    }
}
