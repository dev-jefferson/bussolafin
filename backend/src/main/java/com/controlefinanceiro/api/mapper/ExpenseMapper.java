package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.Expense;
import com.controlefinanceiro.api.dto.expense.ExpenseResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = CategoryMapper.class)
public interface ExpenseMapper {

    ExpenseResponse toResponse(Expense expense);
}
