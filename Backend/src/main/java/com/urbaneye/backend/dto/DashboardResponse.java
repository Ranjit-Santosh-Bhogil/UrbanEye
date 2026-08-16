package com.urbaneye.backend.dto;

import com.urbaneye.backend.models.Issue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private StatsDto stats;
    private List<Issue> recentIssues;
    private List<Issue> mapIssues;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsDto {
        private long total;
        private long pending;
        private long resolved;
    }
}
