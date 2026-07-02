package com.controlefinanceiro.api.dto.income;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record IncomeRequest(
        @NotBlank(message = "Descrição é obrigatória")
        String description,

        @Min(value = 1, message = "Dia deve estar entre 1 e 31")
        @Max(value = 31, message = "Dia deve estar entre 1 e 31")
        Integer day,

        @NotNull(message = "Valor é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero")
        BigDecimal value) {
}
