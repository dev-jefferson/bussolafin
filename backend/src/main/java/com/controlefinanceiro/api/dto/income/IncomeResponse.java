package com.controlefinanceiro.api.dto.income;

import java.math.BigDecimal;
import java.util.UUID;

public record IncomeResponse(UUID id, String description, Integer day, BigDecimal value, boolean recurring) {
}
