package com.controlefinanceiro.api.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank(message = "Nome é obrigatório")
        String name) {
}
