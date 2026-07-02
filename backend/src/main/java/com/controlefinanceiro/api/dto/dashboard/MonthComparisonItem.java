package com.controlefinanceiro.api.dto.dashboard;

import java.math.BigDecimal;
import java.util.UUID;

public record MonthComparisonItem(
        UUID budgetId,
        int month,
        int year,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalExpensesSimulated,
        BigDecimal economia,
        BigDecimal economiaSimulada) {
}
