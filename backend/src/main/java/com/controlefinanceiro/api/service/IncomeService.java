package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Income;
import com.controlefinanceiro.api.domain.RecurringIncome;
import com.controlefinanceiro.api.dto.income.IncomeRequest;
import com.controlefinanceiro.api.dto.income.IncomeResponse;
import com.controlefinanceiro.api.dto.recurring.RecurringIncomeResponse;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.IncomeMapper;
import com.controlefinanceiro.api.mapper.RecurringIncomeMapper;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.IncomeRepository;
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
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final BudgetRepository budgetRepository;
    private final RecurringIncomeRepository recurringIncomeRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final IncomeMapper incomeMapper;
    private final RecurringIncomeMapper recurringIncomeMapper;

    public List<IncomeResponse> list(UUID userId, UUID budgetId) {
        budgetService.findOwned(userId, budgetId);
        return incomeRepository.findByBudget_IdAndBudget_User_IdOrderByDayAsc(budgetId, userId).stream()
                .map(incomeMapper::toResponse)
                .toList();
    }

    @Transactional
    public IncomeResponse create(UUID userId, UUID budgetId, IncomeRequest request) {
        budgetService.findOwned(userId, budgetId);
        Income income = Income.builder()
                .budget(budgetRepository.getReferenceById(budgetId))
                .description(request.description())
                .day(request.day())
                .value(request.value())
                .build();
        return incomeMapper.toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse update(UUID userId, UUID budgetId, UUID incomeId, IncomeRequest request) {
        Income income = findOwned(userId, budgetId, incomeId);
        income.setDescription(request.description());
        income.setDay(request.day());
        income.setValue(request.value());
        return incomeMapper.toResponse(income);
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId, UUID incomeId) {
        incomeRepository.delete(findOwned(userId, budgetId, incomeId));
    }

    @Transactional
    public RecurringIncomeResponse promoteToRecurring(UUID userId, UUID budgetId, UUID incomeId) {
        Income income = findOwned(userId, budgetId, incomeId);
        RecurringIncome recurringIncome = RecurringIncome.builder()
                .user(userRepository.getReferenceById(userId))
                .description(income.getDescription())
                .day(income.getDay())
                .value(income.getValue())
                .active(true)
                .build();
        recurringIncomeRepository.save(recurringIncome);
        income.setRecurringIncome(recurringIncome);
        return recurringIncomeMapper.toResponse(recurringIncome);
    }

    private Income findOwned(UUID userId, UUID budgetId, UUID incomeId) {
        return incomeRepository.findByIdAndBudget_IdAndBudget_User_Id(incomeId, budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Receita não encontrada"));
    }
}
