package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.ExpenseCategory;
import com.controlefinanceiro.api.dto.category.CategoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryMapper {

    CategoryResponse toResponse(ExpenseCategory category);
}
