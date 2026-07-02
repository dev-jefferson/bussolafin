package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.budget.BudgetRequest;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import com.controlefinanceiro.api.exception.DuplicateResourceException;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.BudgetMapper;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    public List<BudgetResponse> list(UUID userId) {
        return budgetRepository.findByUser_IdOrderByYearDescMonthDesc(userId).stream()
                .map(budgetMapper::toResponse)
                .toList();
    }

    public BudgetResponse get(UUID userId, UUID budgetId) {
        return budgetMapper.toResponse(findOwned(userId, budgetId));
    }

    @Transactional
    public BudgetResponse create(UUID userId, BudgetRequest request) {
        if (budgetRepository.existsByUser_IdAndMonthAndYear(userId, request.month(), request.year())) {
            throw new DuplicateResourceException(
                    "Já existe um orçamento para %02d/%d".formatted(request.month(), request.year()));
        }
        Budget budget = Budget.builder()
                .user(userRepository.getReferenceById(userId))
                .month(request.month())
                .year(request.year())
                .previousBalance(request.previousBalance())
                .build();
        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse update(UUID userId, UUID budgetId, BudgetRequest request) {
        Budget budget = findOwned(userId, budgetId);
        boolean periodChanged = budget.getMonth() != request.month() || budget.getYear() != request.year();
        if (periodChanged && budgetRepository.existsByUser_IdAndMonthAndYear(userId, request.month(), request.year())) {
            throw new DuplicateResourceException(
                    "Já existe um orçamento para %02d/%d".formatted(request.month(), request.year()));
        }
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setPreviousBalance(request.previousBalance());
        return budgetMapper.toResponse(budget);
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId) {
        budgetRepository.delete(findOwned(userId, budgetId));
    }

    Budget findOwned(UUID userId, UUID budgetId) {
        return budgetRepository.findByIdAndUser_Id(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado"));
    }
}
