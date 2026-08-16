package com.urbaneye.backend.controllers;

import com.urbaneye.backend.dto.AdminIssuesResponse;
import com.urbaneye.backend.dto.DashboardResponse;
import com.urbaneye.backend.dto.IssueCreateRequest;
import com.urbaneye.backend.models.Issue;
import com.urbaneye.backend.security.UserPrincipal;
import com.urbaneye.backend.services.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @PostMapping
    public ResponseEntity<?> createIssue(@Valid @RequestBody IssueCreateRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Issue issue = issueService.createIssue(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(issue);
    }

    @GetMapping("/my-reports")
    public ResponseEntity<?> getMyReports(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Issue> myIssues = issueService.getMyReports(userPrincipal.getId());
        return ResponseEntity.ok(myIssues);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        DashboardResponse response = issueService.getDashboardStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyIssues(@RequestParam("location") String location) {
        List<Issue> issues = issueService.getNearbyIssues(location);
        return ResponseEntity.ok(issues);
    }

    @PutMapping("/{id}/upvote")
    public ResponseEntity<?> toggleUpvote(@PathVariable("id") Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Issue updatedIssue = issueService.toggleUpvote(id, userPrincipal.getId());
        return ResponseEntity.ok(updatedIssue);
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable("id") Long id, @RequestBody Map<String, String> request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        String feedbackText = request.get("text");
        Issue updatedIssue = issueService.addFeedback(id, feedbackText, userPrincipal.getId());
        return ResponseEntity.ok(updatedIssue);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllIssuesAdmin() {
        AdminIssuesResponse response = issueService.getAllIssuesAdmin();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateIssueStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        Issue updatedIssue = issueService.updateIssueStatus(id, status);
        return ResponseEntity.ok(updatedIssue);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable("id") Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        issueService.deleteIssue(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
