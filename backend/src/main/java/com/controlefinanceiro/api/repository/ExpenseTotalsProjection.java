package com.controlefinanceiro.api.repository;

import java.math.BigDecimal;

public interface ExpenseTotalsProjection {

    BigDecimal getTotalExpenses();

    BigDecimal getTotalExpensesSimulated();

    BigDecimal getTotalAdjustable();

    BigDecimal getTotalAdjustableSimulated();
}
