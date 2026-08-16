package com.urbaneye.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "issues")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("_id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String location;

    private Double latitude;
    private Double longitude;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    @Builder.Default
    private String imageUrl = "";

    @Column(name = "is_urgent", nullable = false)
    @Builder.Default
    private boolean isUrgent = false;

    @Column(nullable = false)
    @Builder.Default
    private String status = "Pending"; // Pending, In Progress, Resolved, Rejected

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "issue_upvotes",
        joinColumns = @JoinColumn(name = "issue_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    @Builder.Default
    private Set<User> upvotes = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "issue_id")
    @Builder.Default
    private List<Feedback> feedbacks = new ArrayList<>();

    @Column(name = "priority_score", nullable = false)
    @Builder.Default
    private int priorityScore = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("upvotes")
    public List<Long> getUpvoteIds() {
        if (upvotes == null) return Collections.emptyList();
        return upvotes.stream().map(User::getId).collect(Collectors.toList());
    }

    public void recalculatePriorityScore() {
        int score = 0;
        String cat = (category != null ? category : "").toLowerCase();
        if (cat.contains("electric") || cat.contains("fire") || cat.contains("safety") || cat.contains("wire")) {
            score += 50;
        } else if (cat.contains("water") || cat.contains("sanitation") || cat.contains("garbage")) {
            score += 30;
        } else {
            score += 10;
        }

        if (isUrgent) {
            score += 20;
        }

        int upvoteCount = upvotes != null ? upvotes.size() : 0;
        score += upvoteCount * 5;

        this.priorityScore = score;
    }
}
