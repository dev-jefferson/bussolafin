package com.controlefinanceiro.api.dto.summary;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetSummaryResponse(
        UUID budgetId,
        int month,
        int year,
        BigDecimal previousBalance,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalExpensesSimulated,
        BigDecimal totalAdjustable,
        BigDecimal totalAdjustableSimulated,
        BigDecimal economia,
        BigDecimal economiaSimulada) {
}
