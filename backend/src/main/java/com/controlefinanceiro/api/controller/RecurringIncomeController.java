package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.recurring.RecurringIncomeRequest;
import com.controlefinanceiro.api.dto.recurring.RecurringIncomeResponse;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.RecurringIncomeService;
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
@RequestMapping("/api/v1/recurring-incomes")
@RequiredArgsConstructor
public class RecurringIncomeController {

    private final RecurringIncomeService recurringIncomeService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<RecurringIncomeResponse>> list() {
        return ResponseEntity.ok(recurringIncomeService.list(currentUserProvider.getUserId()));
    }

    @PostMapping
    public ResponseEntity<RecurringIncomeResponse> create(@Valid @RequestBody RecurringIncomeRequest request) {
        RecurringIncomeResponse created = recurringIncomeService.create(currentUserProvider.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringIncomeResponse> update(
            @PathVariable UUID id, @Valid @RequestBody RecurringIncomeRequest request) {
        return ResponseEntity.ok(recurringIncomeService.update(currentUserProvider.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recurringIncomeService.delete(currentUserProvider.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
