package com.controlefinanceiro.api.dto.recurring;

import java.math.BigDecimal;
import java.util.UUID;

public record RecurringIncomeResponse(
        UUID id, String description, Integer day, BigDecimal value, boolean active) {
}
