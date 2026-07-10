package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.expense.ExpenseEntryPaidRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseEntryRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseEntryResponse;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.ExpenseEntryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/budgets/{budgetId}/expenses/{expenseId}/entries")
@RequiredArgsConstructor
public class ExpenseEntryController {

    private final ExpenseEntryService expenseEntryService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<ExpenseEntryResponse>> list(
            @PathVariable UUID budgetId, @PathVariable UUID expenseId) {
        return ResponseEntity.ok(expenseEntryService.list(currentUserProvider.getUserId(), budgetId, expenseId));
    }

    @PostMapping
    public ResponseEntity<ExpenseEntryResponse> create(
            @PathVariable UUID budgetId,
            @PathVariable UUID expenseId,
            @Valid @RequestBody ExpenseEntryRequest request) {
        ExpenseEntryResponse created =
                expenseEntryService.create(currentUserProvider.getUserId(), budgetId, expenseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseEntryResponse> update(
            @PathVariable UUID budgetId,
            @PathVariable UUID expenseId,
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseEntryRequest request) {
        ExpenseEntryResponse updated =
                expenseEntryService.update(currentUserProvider.getUserId(), budgetId, expenseId, id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<ExpenseEntryResponse> setPaid(
            @PathVariable UUID budgetId,
            @PathVariable UUID expenseId,
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseEntryPaidRequest request) {
        ExpenseEntryResponse updated =
                expenseEntryService.setPaid(currentUserProvider.getUserId(), budgetId, expenseId, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID budgetId, @PathVariable UUID expenseId, @PathVariable UUID id) {
        expenseEntryService.delete(currentUserProvider.getUserId(), budgetId, expenseId, id);
        return ResponseEntity.noContent().build();
    }
}
