package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.dashboard.MonthComparisonItem;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.DashboardService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/comparison")
    public ResponseEntity<List<MonthComparisonItem>> comparison(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(dashboardService.getComparison(currentUserProvider.getUserId(), months));
    }
}
