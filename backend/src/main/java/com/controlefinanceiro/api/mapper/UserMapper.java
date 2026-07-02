package com.controlefinanceiro.api.mapper;

import com.controlefinanceiro.api.domain.User;
import com.controlefinanceiro.api.dto.auth.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    UserResponse toResponse(User user);
}
