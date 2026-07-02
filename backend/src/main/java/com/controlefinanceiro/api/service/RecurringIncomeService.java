package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.RecurringIncome;
import com.controlefinanceiro.api.dto.recurring.RecurringIncomeRequest;
import com.controlefinanceiro.api.dto.recurring.RecurringIncomeResponse;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.RecurringIncomeMapper;
import com.controlefinanceiro.api.repository.RecurringIncomeRepository;
import com.controlefinanceiro.api.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringIncomeService {

    private final RecurringIncomeRepository recurringIncomeRepository;
    private final UserRepository userRepository;
    private final RecurringIncomeMapper recurringIncomeMapper;

    public List<RecurringIncomeResponse> list(UUID userId) {
        return recurringIncomeRepository.findByUser_IdOrderByDescriptionAsc(userId).stream()
                .map(recurringIncomeMapper::toResponse)
                .toList();
    }

    @Transactional
    public RecurringIncomeResponse create(UUID userId, RecurringIncomeRequest request) {
        RecurringIncome recurringIncome = RecurringIncome.builder()
                .user(userRepository.getReferenceById(userId))
                .description(request.description())
                .day(request.day())
                .value(request.value())
                .active(Boolean.TRUE.equals(request.active()))
                .build();
        return recurringIncomeMapper.toResponse(recurringIncomeRepository.save(recurringIncome));
    }

    @Transactional
    public RecurringIncomeResponse update(UUID userId, UUID id, RecurringIncomeRequest request) {
        RecurringIncome recurringIncome = findOwned(userId, id);
        recurringIncome.setDescription(request.description());
        recurringIncome.setDay(request.day());
        recurringIncome.setValue(request.value());
        recurringIncome.setActive(Boolean.TRUE.equals(request.active()));
        return recurringIncomeMapper.toResponse(recurringIncome);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        recurringIncomeRepository.delete(findOwned(userId, id));
    }

    private RecurringIncome findOwned(UUID userId, UUID id) {
        return recurringIncomeRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Receita recorrente não encontrada"));
    }
}
