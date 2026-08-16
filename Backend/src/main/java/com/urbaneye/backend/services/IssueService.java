package com.urbaneye.backend.services;

import com.urbaneye.backend.dto.AdminIssuesResponse;
import com.urbaneye.backend.dto.DashboardResponse;
import com.urbaneye.backend.dto.IssueCreateRequest;
import com.urbaneye.backend.exception.BadRequestException;
import com.urbaneye.backend.exception.ResourceNotFoundException;
import com.urbaneye.backend.models.Feedback;
import com.urbaneye.backend.models.Issue;
import com.urbaneye.backend.models.User;
import com.urbaneye.backend.repositories.IssueRepository;
import com.urbaneye.backend.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class IssueService {

    private static final Logger logger = LoggerFactory.getLogger(IssueService.class);

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public Issue createIssue(IssueCreateRequest request, Long userId) {
        logger.info("Creating issue for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Handle image upload via base64
        String finalImageUrl = "";
        if (StringUtils.hasText(request.getImageUrl())) {
            finalImageUrl = cloudinaryService.uploadBase64Image(request.getImageUrl());
        }

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getDescription())
                .isUrgent(request.getIsUrgent() != null && request.getIsUrgent())
                .imageUrl(finalImageUrl)
                .createdBy(user)
                .status("Pending")
                .build();

        issue.recalculatePriorityScore();
        Issue savedIssue = issueRepository.save(issue);
        logger.info("Issue created successfully with id: {}", savedIssue.getId());

        return savedIssue;
    }

    public List<Issue> getMyReports(Long userId) {
        logger.info("Fetching reports for user: {}", userId);
        return issueRepository.findByCreatedByIdOrderByCreatedAtDesc(userId);
    }

    public DashboardResponse getDashboardStats() {
        logger.info("Fetching dashboard statistics");

        long total = issueRepository.count();
        long pending = issueRepository.countByStatus("Pending");
        long resolved = issueRepository.countByStatusIn(Arrays.asList("Resolved", "Rejected"));

        List<Issue> recentIssues = issueRepository.findTop6ByOrderByCreatedAtDesc();
        List<Issue> mapIssues = issueRepository.findAll();

        return DashboardResponse.builder()
                .stats(DashboardResponse.StatsDto.builder()
                        .total(total)
                        .pending(pending)
                        .resolved(resolved)
                        .build())
                .recentIssues(recentIssues)
                .mapIssues(mapIssues)
                .build();
    }

    public List<Issue> getNearbyIssues(String location) {
        logger.info("Fetching nearby issues for location: {}", location);
        if (!StringUtils.hasText(location)) {
            throw new BadRequestException("Location parameter is required");
        }
        return issueRepository.findByLocationContainingIgnoreCaseOrderByCreatedAtDesc(location);
    }

    public Issue toggleUpvote(Long issueId, Long userId) {
        logger.info("Toggling upvote for issue: {} by user: {}", issueId, userId);

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyUpvoted = issue.getUpvotes().stream()
                .anyMatch(u -> u.getId().equals(currentUser.getId()));

        if (alreadyUpvoted) {
            issue.getUpvotes().removeIf(u -> u.getId().equals(currentUser.getId()));
            logger.info("Upvote removed for issue: {} by user: {}", issueId, userId);
        } else {
            issue.getUpvotes().add(currentUser);
            logger.info("Upvote added for issue: {} by user: {}", issueId, userId);
        }

        issue.recalculatePriorityScore();
        return issueRepository.save(issue);
    }

    public Issue addFeedback(Long issueId, String feedbackText, Long userId) {
        logger.info("Adding feedback to issue: {} by user: {}", issueId, userId);

        if (!StringUtils.hasText(feedbackText)) {
            throw new BadRequestException("Feedback text is required");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Feedback feedback = Feedback.builder()
                .text(feedbackText)
                .user(currentUser)
                .build();

        issue.getFeedbacks().add(feedback);
        logger.info("Feedback added to issue: {}", issueId);

        return issueRepository.save(issue);
    }

    public AdminIssuesResponse getAllIssuesAdmin() {
        logger.info("Fetching all issues for admin");

        List<Issue> issues = issueRepository.findAllByOrderByPriorityScoreDescCreatedAtDesc();

        long total = issues.size();
        long pending = issues.stream().filter(i -> "Pending".equalsIgnoreCase(i.getStatus())).count();
        long resolved = issues.stream().filter(i -> "Resolved".equalsIgnoreCase(i.getStatus()) || "Rejected".equalsIgnoreCase(i.getStatus())).count();

        return AdminIssuesResponse.builder()
                .issues(issues)
                .stats(AdminIssuesResponse.StatsDto.builder()
                        .total(total)
                        .pending(pending)
                        .resolved(resolved)
                        .build())
                .build();
    }

    public Issue updateIssueStatus(Long issueId, String status) {
        logger.info("Updating issue: {} status to: {}", issueId, status);

        if (!Arrays.asList("Pending", "In Progress", "Resolved", "Rejected").contains(status)) {
            throw new BadRequestException("Invalid status provided");
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        issue.setStatus(status);
        Issue updatedIssue = issueRepository.save(issue);
        logger.info("Issue status updated successfully");

        return updatedIssue;
    }

    public void deleteIssue(Long issueId, Long userId) {
        logger.info("Deleting issue: {} by user: {}", issueId, userId);

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        // Only allow user who created the issue or admin to delete
        if (!issue.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("You do not have permission to delete this issue");
        }

        issueRepository.deleteById(issueId);
        logger.info("Issue deleted successfully");
    }
}
