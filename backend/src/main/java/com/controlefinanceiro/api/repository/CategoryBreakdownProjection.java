package com.controlefinanceiro.api.repository;

import java.math.BigDecimal;
import java.util.UUID;

public interface CategoryBreakdownProjection {

    UUID getCategoryId();

    String getCategoryName();

    BigDecimal getTotal();

    BigDecimal getTotalSimulated();
}
