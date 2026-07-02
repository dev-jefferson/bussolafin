package com.controlefinanceiro.api.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @NotBlank(message = "Nome é obrigatório")
        String name,

        @NotNull(message = "Informe se a categoria é ajustável")
        Boolean adjustable) {
}
