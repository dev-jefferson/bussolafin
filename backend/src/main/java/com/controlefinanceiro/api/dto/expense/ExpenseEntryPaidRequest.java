package com.controlefinanceiro.api.dto.expense;

import jakarta.validation.constraints.NotNull;

public record ExpenseEntryPaidRequest(
        @NotNull(message = "Informe se o lançamento está pago")
        Boolean paid) {
}
