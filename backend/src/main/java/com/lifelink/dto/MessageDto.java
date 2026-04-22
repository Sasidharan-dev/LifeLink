package com.lifelink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class MessageDto {

    public static class SendRequest {
        @NotNull(message = "Receiver ID is required")
        private Long receiverId;

        @NotBlank(message = "Message content is required")
        private String content;

        public SendRequest() {
        }

        public SendRequest(Long receiverId, String content) {
            this.receiverId = receiverId;
            this.content = content;
        }

        public Long getReceiverId() {
            return receiverId;
        }

        public void setReceiverId(Long receiverId) {
            this.receiverId = receiverId;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }

    public static class Response {
        private Long id;
        private Long senderId;
        private String senderName;
        private Long receiverId;
        private String receiverName;
        private String content;
        private Boolean isRead;
        private LocalDateTime createdAt;

        public Response() {
        }

        public Response(Long id, Long senderId, String senderName, Long receiverId, String receiverName,
                        String content, Boolean isRead, LocalDateTime createdAt) {
            this.id = id;
            this.senderId = senderId;
            this.senderName = senderName;
            this.receiverId = receiverId;
            this.receiverName = receiverName;
            this.content = content;
            this.isRead = isRead;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getSenderId() {
            return senderId;
        }

        public void setSenderId(Long senderId) {
            this.senderId = senderId;
        }

        public String getSenderName() {
            return senderName;
        }

        public void setSenderName(String senderName) {
            this.senderName = senderName;
        }

        public Long getReceiverId() {
            return receiverId;
        }

        public void setReceiverId(Long receiverId) {
            this.receiverId = receiverId;
        }

        public String getReceiverName() {
            return receiverName;
        }

        public void setReceiverName(String receiverName) {
            this.receiverName = receiverName;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public Boolean getIsRead() {
            return isRead;
        }

        public void setIsRead(Boolean isRead) {
            this.isRead = isRead;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
