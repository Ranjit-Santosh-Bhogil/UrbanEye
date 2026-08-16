package com.urbaneye.backend.controllers;

import com.urbaneye.backend.models.Announcement;
import com.urbaneye.backend.security.UserPrincipal;
import com.urbaneye.backend.services.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        List<Announcement> announcements = announcementService.getAnnouncements();
        return ResponseEntity.ok(announcements);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAnnouncement(@RequestBody Map<String, String> request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String message = request.get("message");
        Announcement announcement = announcementService.createAnnouncement(message, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(announcement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAnnouncement(@PathVariable("id") Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        announcementService.deleteAnnouncement(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
