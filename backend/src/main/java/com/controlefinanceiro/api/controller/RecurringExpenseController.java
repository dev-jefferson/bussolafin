package com.controlefinanceiro.api.controller;

import com.controlefinanceiro.api.dto.recurring.RecurringExpenseRequest;
import com.controlefinanceiro.api.dto.recurring.RecurringExpenseResponse;
import com.controlefinanceiro.api.security.CurrentUserProvider;
import com.controlefinanceiro.api.service.RecurringExpenseService;
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
@RequestMapping("/api/v1/recurring-expenses")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> list() {
        return ResponseEntity.ok(recurringExpenseService.list(currentUserProvider.getUserId()));
    }

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> create(@Valid @RequestBody RecurringExpenseRequest request) {
        RecurringExpenseResponse created = recurringExpenseService.create(currentUserProvider.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringExpenseResponse> update(
            @PathVariable UUID id, @Valid @RequestBody RecurringExpenseRequest request) {
        return ResponseEntity.ok(recurringExpenseService.update(currentUserProvider.getUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        recurringExpenseService.delete(currentUserProvider.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
