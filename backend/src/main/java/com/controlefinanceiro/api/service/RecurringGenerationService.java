package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Expense;
import com.controlefinanceiro.api.domain.Income;
import com.controlefinanceiro.api.domain.RecurringExpense;
import com.controlefinanceiro.api.domain.RecurringIncome;
import com.controlefinanceiro.api.dto.recurring.GenerateRecurringResponse;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.ExpenseRepository;
import com.controlefinanceiro.api.repository.IncomeRepository;
import com.controlefinanceiro.api.repository.RecurringExpenseRepository;
import com.controlefinanceiro.api.repository.RecurringIncomeRepository;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecurringGenerationService {

    private final BudgetService budgetService;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final RecurringIncomeRepository recurringIncomeRepository;

    @Transactional
    public GenerateRecurringResponse generate(UUID userId, UUID budgetId) {
        budgetService.findOwned(userId, budgetId);

        int expensesAdded = generateExpenses(userId, budgetId);
        int incomesAdded = generateIncomes(userId, budgetId);

        return new GenerateRecurringResponse(expensesAdded, incomesAdded);
    }

    private int generateExpenses(UUID userId, UUID budgetId) {
        List<Expense> existing = expenseRepository.findByBudget_IdAndBudget_User_Id(budgetId, userId);
        Set<UUID> alreadyGenerated = existing.stream()
                .map(Expense::getRecurringExpense)
                .filter(Objects::nonNull)
                .map(RecurringExpense::getId)
                .collect(Collectors.toSet());

        List<RecurringExpense> activeTemplates = recurringExpenseRepository.findByUser_IdAndActiveTrue(userId);
        var budgetRef = budgetRepository.getReferenceById(budgetId);

        int added = 0;
        for (RecurringExpense template : activeTemplates) {
            if (alreadyGenerated.contains(template.getId())) {
                continue;
            }
            Expense expense = Expense.builder()
                    .budget(budgetRef)
                    .category(template.getCategory())
                    .description(template.getDescription())
                    .day(template.getDay())
                    .value(template.getValue())
                    .simulatedValue(template.getSimulatedValue())
                    .adjustable(template.isAdjustable())
                    .recurringExpense(template)
                    .build();
            expenseRepository.save(expense);
            added++;
        }
        return added;
    }

    private int generateIncomes(UUID userId, UUID budgetId) {
        List<Income> existing = incomeRepository.findByBudget_IdAndBudget_User_IdOrderByDayAsc(budgetId, userId);
        Set<UUID> alreadyGenerated = existing.stream()
                .map(Income::getRecurringIncome)
                .filter(Objects::nonNull)
                .map(RecurringIncome::getId)
                .collect(Collectors.toSet());

        List<RecurringIncome> activeTemplates = recurringIncomeRepository.findByUser_IdAndActiveTrue(userId);
        var budgetRef = budgetRepository.getReferenceById(budgetId);

        int added = 0;
        for (RecurringIncome template : activeTemplates) {
            if (alreadyGenerated.contains(template.getId())) {
                continue;
            }
            Income income = Income.builder()
                    .budget(budgetRef)
                    .description(template.getDescription())
                    .day(template.getDay())
                    .value(template.getValue())
                    .recurringIncome(template)
                    .build();
            incomeRepository.save(income);
            added++;
        }
        return added;
    }
}
