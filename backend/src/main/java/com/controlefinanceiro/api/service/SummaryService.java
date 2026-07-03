package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.dto.summary.CategoryBreakdownItem;
import com.controlefinanceiro.api.repository.CategoryBreakdownProjection;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SummaryService {

    private final BudgetService budgetService;
    private final BudgetSummaryCalculator budgetSummaryCalculator;
    private final ExpenseRepository expenseRepository;

    public BudgetSummaryResponse getSummary(UUID userId, UUID budgetId) {
        Budget budget = budgetService.findOwned(userId, budgetId);
        return budgetSummaryCalculator.compute(budget);
    }

    public List<CategoryBreakdownItem> getBreakdown(UUID userId, UUID budgetId) {
        budgetService.findOwned(userId, budgetId);
        return expenseRepository.getBreakdownByCategory(budgetId).stream()
                .map(this::toItem)
                .toList();
    }

    private CategoryBreakdownItem toItem(CategoryBreakdownProjection p) {
        return new CategoryBreakdownItem(
                p.getCategoryId(), p.getCategoryName(), p.getAdjustable(), p.getTotal(), p.getTotalSimulated());
    }
}
