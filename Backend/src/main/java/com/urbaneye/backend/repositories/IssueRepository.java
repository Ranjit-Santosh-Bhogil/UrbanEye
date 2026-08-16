package com.urbaneye.backend.repositories;

import com.urbaneye.backend.models.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    List<Issue> findTop6ByOrderByCreatedAtDesc();

    List<Issue> findByLocationContainingIgnoreCaseOrderByCreatedAtDesc(String location);

    long countByStatus(String status);

    long countByStatusIn(Collection<String> statuses);

    List<Issue> findAllByOrderByPriorityScoreDescCreatedAtDesc();
}
