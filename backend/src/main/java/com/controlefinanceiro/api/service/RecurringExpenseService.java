package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.ExpenseCategory;
import com.controlefinanceiro.api.domain.RecurringExpense;
import com.controlefinanceiro.api.dto.recurring.RecurringExpenseRequest;
import com.controlefinanceiro.api.dto.recurring.RecurringExpenseResponse;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.RecurringExpenseMapper;
import com.controlefinanceiro.api.repository.ExpenseCategoryRepository;
import com.controlefinanceiro.api.repository.RecurringExpenseRepository;
import com.controlefinanceiro.api.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final RecurringExpenseMapper recurringExpenseMapper;

    public List<RecurringExpenseResponse> list(UUID userId) {
        return recurringExpenseRepository.findByUser_IdOrderByDescriptionAsc(userId).stream()
                .map(recurringExpenseMapper::toResponse)
                .toList();
    }

    @Transactional
    public RecurringExpenseResponse create(UUID userId, RecurringExpenseRequest request) {
        ExpenseCategory category = findOwnedCategory(userId, request.categoryId());
        RecurringExpense recurringExpense = RecurringExpense.builder()
                .user(userRepository.getReferenceById(userId))
                .category(category)
                .description(request.description())
                .value(request.value())
                .simulatedValue(request.simulatedValue())
                .active(Boolean.TRUE.equals(request.active()))
                .build();
        return recurringExpenseMapper.toResponse(recurringExpenseRepository.save(recurringExpense));
    }

    @Transactional
    public RecurringExpenseResponse update(UUID userId, UUID id, RecurringExpenseRequest request) {
        RecurringExpense recurringExpense = findOwned(userId, id);
        ExpenseCategory category = findOwnedCategory(userId, request.categoryId());
        recurringExpense.setCategory(category);
        recurringExpense.setDescription(request.description());
        recurringExpense.setValue(request.value());
        recurringExpense.setSimulatedValue(request.simulatedValue());
        recurringExpense.setActive(Boolean.TRUE.equals(request.active()));
        return recurringExpenseMapper.toResponse(recurringExpense);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        recurringExpenseRepository.delete(findOwned(userId, id));
    }

    private RecurringExpense findOwned(UUID userId, UUID id) {
        return recurringExpenseRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa recorrente não encontrada"));
    }

    private ExpenseCategory findOwnedCategory(UUID userId, UUID categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
