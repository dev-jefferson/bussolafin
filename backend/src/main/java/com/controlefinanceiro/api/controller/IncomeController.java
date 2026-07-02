package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.income.IncomeRequest;
import com.controlefinanceiro.api.dto.income.IncomeResponse;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.IncomeService;
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
@RequestMapping("/api/v1/budgets/{budgetId}/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<IncomeResponse>> list(@PathVariable UUID budgetId) {
        return ResponseEntity.ok(incomeService.list(currentUserProvider.getUserId(), budgetId));
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> create(
            @PathVariable UUID budgetId, @Valid @RequestBody IncomeRequest request) {
        IncomeResponse created = incomeService.create(currentUserProvider.getUserId(), budgetId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> update(
            @PathVariable UUID budgetId, @PathVariable UUID id, @Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.ok(incomeService.update(currentUserProvider.getUserId(), budgetId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID budgetId, @PathVariable UUID id) {
        incomeService.delete(currentUserProvider.getUserId(), budgetId, id);
        return ResponseEntity.noContent().build();
    }
}
