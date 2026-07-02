package com.controlefinanceiro.api.dto.budget;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetResponse(UUID id, int month, int year, BigDecimal previousBalance) {
}
