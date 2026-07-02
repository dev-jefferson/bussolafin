package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.expense.ExpenseRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseResponse;
import com.controlefinanceiro.api.dto.summary.CategoryBreakdownItem;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.ExpenseService;
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
@RequestMapping("/api/v1/budgets/{budgetId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final SummaryService summaryService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> list(@PathVariable UUID budgetId) {
        return ResponseEntity.ok(expenseService.list(currentUserProvider.getUserId(), budgetId));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(
            @PathVariable UUID budgetId, @Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse created = expenseService.create(currentUserProvider.getUserId(), budgetId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> update(
            @PathVariable UUID budgetId, @PathVariable UUID id, @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.update(currentUserProvider.getUserId(), budgetId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID budgetId, @PathVariable UUID id) {
        expenseService.delete(currentUserProvider.getUserId(), budgetId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<CategoryBreakdownItem>> byCategory(@PathVariable UUID budgetId) {
        return ResponseEntity.ok(summaryService.getBreakdown(currentUserProvider.getUserId(), budgetId));
    }
}
