package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Expense;
import com.controlefinanceiro.api.domain.ExpenseEntry;
import com.controlefinanceiro.api.dto.expense.ExpenseEntryPaidRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseEntryRequest;
import com.controlefinanceiro.api.dto.expense.ExpenseEntryResponse;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.ExpenseEntryMapper;
import com.controlefinanceiro.api.repository.ExpenseEntryRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseEntryService {

    private final ExpenseEntryRepository expenseEntryRepository;
    private final ExpenseService expenseService;
    private final ExpenseEntryMapper expenseEntryMapper;

    public List<ExpenseEntryResponse> list(UUID userId, UUID budgetId, UUID expenseId) {
        expenseService.findOwned(userId, budgetId, expenseId);
        return expenseEntryRepository
                .findByExpense_IdAndExpense_Budget_User_IdOrderByDayAscCreatedAtAsc(expenseId, userId)
                .stream()
                .map(expenseEntryMapper::toResponse)
                .toList();
    }

    @Transactional
    public ExpenseEntryResponse create(UUID userId, UUID budgetId, UUID expenseId, ExpenseEntryRequest request) {
        Expense expense = expenseService.findOwned(userId, budgetId, expenseId);
        ExpenseEntry entry = ExpenseEntry.builder()
                .expense(expense)
                .description(request.description())
                .day(request.day())
                .value(request.value())
                .build();
        return expenseEntryMapper.toResponse(expenseEntryRepository.save(entry));
    }

    @Transactional
    public ExpenseEntryResponse update(
            UUID userId, UUID budgetId, UUID expenseId, UUID entryId, ExpenseEntryRequest request) {
        ExpenseEntry entry = findOwned(userId, budgetId, expenseId, entryId);
        entry.setDescription(request.description());
        entry.setDay(request.day());
        entry.setValue(request.value());
        return expenseEntryMapper.toResponse(entry);
    }

    @Transactional
    public ExpenseEntryResponse setPaid(
            UUID userId, UUID budgetId, UUID expenseId, UUID entryId, ExpenseEntryPaidRequest request) {
        ExpenseEntry entry = findOwned(userId, budgetId, expenseId, entryId);
        entry.setPaid(Boolean.TRUE.equals(request.paid()));
        return expenseEntryMapper.toResponse(entry);
    }

    @Transactional
    public void delete(UUID userId, UUID budgetId, UUID expenseId, UUID entryId) {
        expenseEntryRepository.delete(findOwned(userId, budgetId, expenseId, entryId));
    }

    private ExpenseEntry findOwned(UUID userId, UUID budgetId, UUID expenseId, UUID entryId) {
        expenseService.findOwned(userId, budgetId, expenseId);
        return expenseEntryRepository.findByIdAndExpense_IdAndExpense_Budget_User_Id(entryId, expenseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Lançamento não encontrado"));
    }
}
