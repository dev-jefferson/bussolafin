package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.RecurringExpense;
import com.controlefinanceiro.api.dto.recurring.RecurringExpenseResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = CategoryMapper.class)
public interface RecurringExpenseMapper {

    RecurringExpenseResponse toResponse(RecurringExpense recurringExpense);
}
