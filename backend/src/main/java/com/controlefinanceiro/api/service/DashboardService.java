package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.dashboard.MonthComparisonItem;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.repository.BudgetRepository;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final BudgetRepository budgetRepository;
    private final SummaryService summaryService;

    public List<MonthComparisonItem> getComparison(UUID userId, int months) {
        List<Budget> budgets = budgetRepository.findByUser_IdOrderByYearDescMonthDesc(userId).stream()
                .limit(months)
                .toList();

        return budgets.stream()
                .map(budget -> toItem(userId, budget))
                .sorted(Comparator.<MonthComparisonItem>comparingInt(MonthComparisonItem::year)
                        .thenComparingInt(MonthComparisonItem::month))
                .toList();
    }

    private MonthComparisonItem toItem(UUID userId, Budget budget) {
        BudgetSummaryResponse summary = summaryService.getSummary(userId, budget.getId());
        return new MonthComparisonItem(
                budget.getId(),
                budget.getMonth(),
                budget.getYear(),
                summary.totalIncome(),
                summary.totalExpenses(),
                summary.totalExpensesSimulated(),
                summary.economia(),
                summary.economiaSimulada());
    }
}
