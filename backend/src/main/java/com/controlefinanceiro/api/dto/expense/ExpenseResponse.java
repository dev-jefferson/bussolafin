package com.controlefinanceiro.api.dto.expense;

import com.controlefinanceiro.api.dto.category.CategoryResponse;
import java.math.BigDecimal;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String description,
        CategoryResponse category,
        Integer day,
        BigDecimal value,
        BigDecimal simulatedValue,
        boolean adjustable,
        boolean recurring) {
}
