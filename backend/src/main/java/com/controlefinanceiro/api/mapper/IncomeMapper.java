package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.Income;
import com.controlefinanceiro.api.dto.income.IncomeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface IncomeMapper {

    @Mapping(target = "recurring", expression = "java(income.getRecurringIncome() != null)")
    IncomeResponse toResponse(Income income);
}
