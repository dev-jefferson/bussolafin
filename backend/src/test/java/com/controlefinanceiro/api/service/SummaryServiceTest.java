package com.controlefinanceiro.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import com.controlefinanceiro.api.repository.ExpenseTotalsProjection;
import com.controlefinanceiro.api.repository.IncomeRepository;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Formulas verified against the real spreadsheet this system replaces
 * (Controle Financeiro Julho): Renda total 20.140, Gastos 17.615/12.415,
 * Ajustes 13.760/8.560, Economia 2.525/7.725.
 */
@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock
    private BudgetService budgetService;

    @Mock
    private IncomeRepository incomeRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private SummaryService summaryService;

    @Test
    void computesTotalsMatchingTheOriginalSpreadsheet() {
        UUID userId = UUID.randomUUID();
        UUID budgetId = UUID.randomUUID();

        Budget budget = Budget.builder()
                .month(7)
                .year(2026)
                .previousBalance(new BigDecimal("900.00"))
                .build();

        when(budgetService.findOwned(userId, budgetId)).thenReturn(budget);
        when(incomeRepository.sumValueByBudgetId(budgetId)).thenReturn(new BigDecimal("19240.00"));
        when(expenseRepository.getTotalsByBudgetId(budgetId)).thenReturn(new ExpenseTotalsProjection() {
            @Override
            public BigDecimal getTotalExpenses() {
                return new BigDecimal("17615.00");
            }

            @Override
            public BigDecimal getTotalExpensesSimulated() {
                return new BigDecimal("12415.00");
            }

            @Override
            public BigDecimal getTotalAdjustable() {
                return new BigDecimal("13760.00");
            }

            @Override
            public BigDecimal getTotalAdjustableSimulated() {
                return new BigDecimal("8560.00");
            }
        });

        BudgetSummaryResponse summary = summaryService.getSummary(userId, budgetId);

        assertThat(summary.totalIncome()).isEqualByComparingTo("20140.00");
        assertThat(summary.totalExpenses()).isEqualByComparingTo("17615.00");
        assertThat(summary.totalExpensesSimulated()).isEqualByComparingTo("12415.00");
        assertThat(summary.totalAdjustable()).isEqualByComparingTo("13760.00");
        assertThat(summary.totalAdjustableSimulated()).isEqualByComparingTo("8560.00");
        assertThat(summary.economia()).isEqualByComparingTo("2525.00");
        assertThat(summary.economiaSimulada()).isEqualByComparingTo("7725.00");
    }

    @Test
    void computesZeroEconomiaWhenExpensesEqualIncome() {
        UUID userId = UUID.randomUUID();
        UUID budgetId = UUID.randomUUID();

        Budget budget = Budget.builder()
                .month(1)
                .year(2026)
                .previousBalance(BigDecimal.ZERO)
                .build();

        when(budgetService.findOwned(userId, budgetId)).thenReturn(budget);
        when(incomeRepository.sumValueByBudgetId(budgetId)).thenReturn(new BigDecimal("1000.00"));
        when(expenseRepository.getTotalsByBudgetId(budgetId)).thenReturn(new ExpenseTotalsProjection() {
            @Override
            public BigDecimal getTotalExpenses() {
                return new BigDecimal("1000.00");
            }

            @Override
            public BigDecimal getTotalExpensesSimulated() {
                return new BigDecimal("1000.00");
            }

            @Override
            public BigDecimal getTotalAdjustable() {
                return BigDecimal.ZERO;
            }

            @Override
            public BigDecimal getTotalAdjustableSimulated() {
                return BigDecimal.ZERO;
            }
        });

        BudgetSummaryResponse summary = summaryService.getSummary(userId, budgetId);

        assertThat(summary.economia()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(summary.economiaSimulada()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
