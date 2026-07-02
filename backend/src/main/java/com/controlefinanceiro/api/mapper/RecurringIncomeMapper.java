package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.RecurringIncome;
import com.controlefinanceiro.api.dto.recurring.RecurringIncomeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface RecurringIncomeMapper {

    RecurringIncomeResponse toResponse(RecurringIncome recurringIncome);
}
