package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.budget.BudgetRequest;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import com.controlefinanceiro.api.dto.recurring.GenerateRecurringResponse;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.BudgetService;
import com.controlefinanceiro.api.service.RecurringGenerationService;
import com.controlefinanceiro.api.service.SummaryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final SummaryService summaryService;
    private final RecurringGenerationService recurringGenerationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> list() {
        return ResponseEntity.ok(budgetService.list(currentUserProvider.getUserId()));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody BudgetRequest request) {
        BudgetResponse created = budgetService.create(currentUserProvider.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(budgetService.get(currentUserProvider.getUserId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(@PathVariable UUID id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.update(currentUserProvider.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetService.delete(currentUserProvider.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<BudgetSummaryResponse> summary(@PathVariable UUID id) {
        return ResponseEntity.ok(summaryService.getSummary(currentUserProvider.getUserId(), id));
    }

    @PostMapping("/{id}/generate-recurring")
    public ResponseEntity<GenerateRecurringResponse> generateRecurring(@PathVariable UUID id) {
        return ResponseEntity.ok(recurringGenerationService.generate(currentUserProvider.getUserId(), id));
    }
}
