package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import com.controlefinanceiro.api.repository.ExpenseTotalsProjection;
import com.controlefinanceiro.api.repository.IncomeRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pure number-crunching for a budget's summary, given an already-loaded (and already
 * ownership-verified) Budget. Kept separate from SummaryService/BudgetService so both can depend
 * on it without a circular dependency between the two.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetSummaryCalculator {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetSummaryResponse compute(Budget budget) {
        BigDecimal totalIncomeEntries = incomeRepository.sumValueByBudgetId(budget.getId());
        BigDecimal totalIncome = budget.getPreviousBalance().add(totalIncomeEntries);

        ExpenseTotalsProjection totals = expenseRepository.getTotalsByBudgetId(budget.getId());

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
}
