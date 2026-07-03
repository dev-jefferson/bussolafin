package com.controlefinanceiro.api.dto.recurring;

import com.controlefinanceiro.api.dto.category.CategoryResponse;
import java.math.BigDecimal;
import java.util.UUID;

public record RecurringExpenseResponse(
        UUID id,
        String description,
        CategoryResponse category,
        Integer day,
        BigDecimal value,
        BigDecimal simulatedValue,
        boolean active) {
}
