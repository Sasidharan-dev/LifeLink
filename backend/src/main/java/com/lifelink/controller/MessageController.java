package com.lifelink.controller;

import com.lifelink.dto.ApiResponse;
import com.lifelink.dto.MessageDto;
import com.lifelink.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageDto.Response>> sendMessage(
            @Valid @RequestBody MessageDto.SendRequest request) {
        MessageDto.Response response = messageService.sendMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Message sent", response));
    }

    @GetMapping("/conversation/{otherUserId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageDto.Response>>> getConversation(
            @PathVariable Long otherUserId) {
        return ResponseEntity.ok(ApiResponse.success(messageService.getConversation(otherUserId)));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(messageService.getUnreadCount()));
    }
}
