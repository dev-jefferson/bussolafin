package com.controlefinanceiro.api.dto.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull(message = "Mês é obrigatório")
        @Min(value = 1, message = "Mês deve estar entre 1 e 12")
        @Max(value = 12, message = "Mês deve estar entre 1 e 12")
        Integer month,

        @NotNull(message = "Ano é obrigatório")
        @Min(value = 2000, message = "Ano inválido")
        Integer year,

        @NotNull(message = "Sobra do mês anterior é obrigatória")
        @DecimalMin(value = "0.0", message = "Sobra do mês anterior não pode ser negativa")
        BigDecimal previousBalance) {
}
