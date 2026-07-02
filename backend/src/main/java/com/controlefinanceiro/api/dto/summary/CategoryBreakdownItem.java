package com.controlefinanceiro.api.dto.summary;

import java.math.BigDecimal;
import java.util.UUID;

public record CategoryBreakdownItem(
        UUID categoryId,
        String categoryName,
        boolean adjustable,
        BigDecimal total,
        BigDecimal totalSimulated) {
}
