package com.lifelink.service;

import com.lifelink.dto.MessageDto;
import com.lifelink.entity.Message;
import com.lifelink.entity.User;
import com.lifelink.repository.MessageRepository;
import com.lifelink.repository.UserRepository;
import com.lifelink.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public MessageDto.Response sendMessage(MessageDto.SendRequest request) {
        UserDetailsImpl userDetails = getCurrentUser();
        User sender = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found with id: " + request.getReceiverId()));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        message.setIsRead(false);

        message = messageRepository.save(message);
        return toResponse(message);
    }

    public List<MessageDto.Response> getConversation(Long otherUserId) {
        UserDetailsImpl userDetails = getCurrentUser();

        List<Message> messages = messageRepository.findConversation(userDetails.getId(), otherUserId);

        // Mark as read
        messages.stream()
                .filter(m -> m.getReceiver().getId().equals(userDetails.getId()) && !m.getIsRead())
                .forEach(m -> {
                    m.setIsRead(true);
                    messageRepository.save(m);
                });

        return messages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount() {
        UserDetailsImpl userDetails = getCurrentUser();
        return messageRepository.countUnreadMessages(userDetails.getId());
    }

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    private MessageDto.Response toResponse(Message message) {
        return new MessageDto.Response(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getReceiver().getId(),
                message.getReceiver().getName(),
                message.getContent(),
                message.getIsRead(),
                message.getCreatedAt()
        );
    }
}
