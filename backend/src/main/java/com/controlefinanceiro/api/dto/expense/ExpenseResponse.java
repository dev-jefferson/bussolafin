package com.controlefinanceiro.api.dto.expense;

import com.controlefinanceiro.api.dto.category.CategoryResponse;
import java.math.BigDecimal;
import java.util.UUID;

public record ExpenseResponse(
        UUID id, CategoryResponse category, BigDecimal value, BigDecimal simulatedValue) {
}
