package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BudgetMapper {

    BudgetResponse toResponse(Budget budget);
}
