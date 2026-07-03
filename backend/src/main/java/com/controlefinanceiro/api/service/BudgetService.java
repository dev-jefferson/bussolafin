package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.budget.BudgetRequest;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import com.controlefinanceiro.api.exception.BusinessRuleException;
import com.controlefinanceiro.api.exception.DuplicateResourceException;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final BudgetSummaryCalculator budgetSummaryCalculator;

    public List<BudgetResponse> list(UUID userId) {
        List<Budget> budgets = budgetRepository.findByUser_IdOrderByYearDescMonthDesc(userId);
        List<BudgetResponse> responses = new ArrayList<>(budgets.size());
        for (int i = 0; i < budgets.size(); i++) {
            Budget budget = budgets.get(i);
            // The list is ordered most-recent-first, so the chronological predecessor of
            // budgets.get(i) is simply the next element, when there is one.
            Budget predecessor = i + 1 < budgets.size() ? budgets.get(i + 1) : null;
            responses.add(toResponse(budget, predecessor));
        }
        return responses;
    }

    public BudgetResponse get(UUID userId, UUID budgetId) {
        Budget budget = findOwned(userId, budgetId);
        return toResponse(budget, findPredecessor(userId, budget).orElse(null));
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
        budgetRepository.save(budget);
        return toResponse(budget, findPredecessor(userId, budget).orElse(null));
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
        return toResponse(budget, findPredecessor(userId, budget).orElse(null));
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId) {
        budgetRepository.delete(findOwned(userId, budgetId));
    }

    /**
     * Overwrites this budget's previousBalance with its predecessor's current economia, so an
     * edit made to an earlier month can be caught up here without touching every month by hand.
     */
    @Transactional
    public BudgetResponse syncPreviousBalance(UUID userId, UUID budgetId) {
        Budget budget = findOwned(userId, budgetId);
        Budget predecessor = findPredecessor(userId, budget)
                .orElseThrow(() -> new BusinessRuleException("Este orçamento não tem um mês anterior para sincronizar"));
        BigDecimal expected = budgetSummaryCalculator.compute(predecessor).economia();
        budget.setPreviousBalance(expected);
        return toResponse(budget, predecessor);
    }

    Budget findOwned(UUID userId, UUID budgetId) {
        return budgetRepository.findByIdAndUser_Id(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado"));
    }

    private Optional<Budget> findPredecessor(UUID userId, Budget budget) {
        List<Budget> before = budgetRepository.findBudgetsBeforePeriod(
                userId, budget.getYear(), budget.getMonth(), PageRequest.of(0, 1));
        return before.isEmpty() ? Optional.empty() : Optional.of(before.get(0));
    }

    private BudgetResponse toResponse(Budget budget, Budget predecessor) {
        BigDecimal expectedPreviousBalance =
                predecessor == null ? null : budgetSummaryCalculator.compute(predecessor).economia();
        return new BudgetResponse(
                budget.getId(), budget.getMonth(), budget.getYear(), budget.getPreviousBalance(), expectedPreviousBalance);
    }
}
