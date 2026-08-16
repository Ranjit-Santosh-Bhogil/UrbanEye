package com.urbaneye.backend.services;

import com.urbaneye.backend.exception.BadRequestException;
import com.urbaneye.backend.exception.ResourceNotFoundException;
import com.urbaneye.backend.models.Announcement;
import com.urbaneye.backend.models.User;
import com.urbaneye.backend.repositories.AnnouncementRepository;
import com.urbaneye.backend.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class AnnouncementService {

    private static final Logger logger = LoggerFactory.getLogger(AnnouncementService.class);

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Announcement> getAnnouncements() {
        logger.info("Fetching announcements");
        return announcementRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public Announcement createAnnouncement(String message, Long userId) {
        logger.info("Creating announcement by user: {}", userId);

        if (!StringUtils.hasText(message)) {
            throw new BadRequestException("Message is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Announcement announcement = Announcement.builder()
                .message(message)
                .createdBy(user)
                .build();

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        logger.info("Announcement created successfully with id: {}", savedAnnouncement.getId());

        return savedAnnouncement;
    }

    public void deleteAnnouncement(Long announcementId, Long userId) {
        logger.info("Deleting announcement: {} by user: {}", announcementId, userId);

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        // Only allow user who created the announcement to delete
        if (!announcement.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to delete this announcement");
        }

        announcementRepository.deleteById(announcementId);
        logger.info("Announcement deleted successfully");
    }
}
