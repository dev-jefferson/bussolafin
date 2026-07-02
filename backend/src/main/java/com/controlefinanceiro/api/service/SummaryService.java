package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.dto.summary.CategoryBreakdownItem;
import com.controlefinanceiro.api.repository.CategoryBreakdownProjection;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import com.controlefinanceiro.api.repository.ExpenseTotalsProjection;
import com.controlefinanceiro.api.repository.IncomeRepository;
import java.math.BigDecimal;
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
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetSummaryResponse getSummary(UUID userId, UUID budgetId) {
        Budget budget = budgetService.findOwned(userId, budgetId);

        BigDecimal totalIncomeEntries = incomeRepository.sumValueByBudgetId(budgetId);
        BigDecimal totalIncome = budget.getPreviousBalance().add(totalIncomeEntries);

        ExpenseTotalsProjection totals = expenseRepository.getTotalsByBudgetId(budgetId);

        BigDecimal totalExpenses = totals.getTotalExpenses();
        BigDecimal totalExpensesSimulated = totals.getTotalExpensesSimulated();
        BigDecimal totalAdjustable = totals.getTotalAdjustable();
        BigDecimal totalAdjustableSimulated = totals.getTotalAdjustableSimulated();

        BigDecimal economia = totalIncome.subtract(totalExpenses);
        BigDecimal economiaSimulada = totalIncome.subtract(totalExpensesSimulated);

        return new BudgetSummaryResponse(
                budget.getId(),
                budget.getMonth(),
                budget.getYear(),
                budget.getPreviousBalance(),
                totalIncome,
                totalExpenses,
                totalExpensesSimulated,
                totalAdjustable,
                totalAdjustableSimulated,
                economia,
                economiaSimulada);
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
