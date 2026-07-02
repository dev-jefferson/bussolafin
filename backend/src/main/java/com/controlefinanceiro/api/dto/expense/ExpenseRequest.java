package com.controlefinanceiro.api.dto.expense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ExpenseRequest(
        @NotBlank(message = "Nome é obrigatório")
        String description,

        @NotNull(message = "Categoria é obrigatória")
        UUID categoryId,

        @NotNull(message = "Valor é obrigatório")
        @DecimalMin(value = "0.0", inclusive = false, message = "Valor deve ser maior que zero")
        BigDecimal value,

        @DecimalMin(value = "0.0", message = "Valor simulado não pode ser negativo")
        BigDecimal simulatedValue) {
}
