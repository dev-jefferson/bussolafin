package com.controlefinanceiro.api.dto.expense;

import jakarta.validation.constraints.NotNull;

public record ExpensePaidRequest(
        @NotNull(message = "Informe se a despesa está paga")
        Boolean paid) {
}
