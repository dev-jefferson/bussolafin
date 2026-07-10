package com.controlefinanceiro.api.dto.expense;

import java.math.BigDecimal;
import java.util.UUID;

public record ExpenseEntryResponse(UUID id, String description, Integer day, BigDecimal value, boolean paid) {
}
