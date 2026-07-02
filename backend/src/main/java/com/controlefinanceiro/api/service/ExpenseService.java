package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Expense;
import com.controlefinanceiro.api.domain.ExpenseCategory;
import com.controlefinanceiro.api.dto.expense.ExpenseRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseResponse;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.ExpenseMapper;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.ExpenseCategoryRepository;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final BudgetService budgetService;
    private final ExpenseMapper expenseMapper;

    public List<ExpenseResponse> list(UUID userId, UUID budgetId) {
        budgetService.findOwned(userId, budgetId);
        return expenseRepository.findByBudget_IdAndBudget_User_Id(budgetId, userId).stream()
                .map(expenseMapper::toResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse create(UUID userId, UUID budgetId, ExpenseRequest request) {
        budgetService.findOwned(userId, budgetId);
        ExpenseCategory category = findOwnedCategory(userId, request.categoryId());
        Expense expense = Expense.builder()
                .budget(budgetRepository.getReferenceById(budgetId))
                .category(category)
                .value(request.value())
                .simulatedValue(request.simulatedValue())
                .build();
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(UUID userId, UUID budgetId, UUID expenseId, ExpenseRequest request) {
        Expense expense = findOwned(userId, budgetId, expenseId);
        ExpenseCategory category = findOwnedCategory(userId, request.categoryId());
        expense.setCategory(category);
        expense.setValue(request.value());
        expense.setSimulatedValue(request.simulatedValue());
        return expenseMapper.toResponse(expense);
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId, UUID expenseId) {
        expenseRepository.delete(findOwned(userId, budgetId, expenseId));
    }

    private Expense findOwned(UUID userId, UUID budgetId, UUID expenseId) {
        return expenseRepository.findByIdAndBudget_IdAndBudget_User_Id(expenseId, budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Despesa não encontrada"));
    }

    private ExpenseCategory findOwnedCategory(UUID userId, UUID categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
