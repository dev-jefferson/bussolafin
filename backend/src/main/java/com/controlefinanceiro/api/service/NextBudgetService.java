package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.domain.Income;
import com.controlefinanceiro.api.dto.budget.BudgetRequest;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import com.controlefinanceiro.api.dto.budget.NextBudgetResponse;
import com.controlefinanceiro.api.dto.recurring.GenerateRecurringResponse;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.repository.BudgetRepository;
import com.controlefinanceiro.api.repository.IncomeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NextBudgetService {

    private final BudgetRepository budgetRepository;
    private final IncomeRepository incomeRepository;
    private final BudgetService budgetService;
    private final SummaryService summaryService;
    private final RecurringGenerationService recurringGenerationService;

    @Transactional
    public NextBudgetResponse createNext(UUID userId) {
        Optional<Budget> latest = budgetRepository.findFirstByUser_IdOrderByYearDescMonthDesc(userId);

        LocalDate nextPeriod;
        BigDecimal previousBalance;

        if (latest.isPresent()) {
            Budget latestBudget = latest.get();
            nextPeriod = LocalDate.of(latestBudget.getYear(), latestBudget.getMonth(), 1).plusMonths(1);
            BudgetSummaryResponse summary = summaryService.getSummary(userId, latestBudget.getId());
            previousBalance = summary.economia();
        } else {
            LocalDate now = LocalDate.now();
            nextPeriod = LocalDate.of(now.getYear(), now.getMonth(), 1);
            previousBalance = BigDecimal.ZERO;
        }

        BudgetRequest request = new BudgetRequest(nextPeriod.getMonthValue(), nextPeriod.getYear(), previousBalance);
        BudgetResponse created = budgetService.create(userId, request);
        GenerateRecurringResponse generation = recurringGenerationService.generate(userId, created.id());
        int incomesCopied = latest.map(b -> copyNonRecurringIncomes(userId, b.getId(), created.id())).orElse(0);

        return new NextBudgetResponse(created, generation, incomesCopied);
    }

    /**
     * Copies over incomes from the previous month that aren't already covered by recurring
     * generation, so the user isn't stuck retyping their salary etc. every month — the copy is a
     * fully independent, editable entry in the new budget.
     */
    private int copyNonRecurringIncomes(UUID userId, UUID previousBudgetId, UUID newBudgetId) {
        List<Income> previousIncomes =
                incomeRepository.findByBudget_IdAndBudget_User_IdOrderByDayAsc(previousBudgetId, userId);
        var newBudgetRef = budgetRepository.getReferenceById(newBudgetId);

        int copied = 0;
        for (Income previousIncome : previousIncomes) {
            if (previousIncome.getRecurringIncome() != null) {
                continue;
            }
            Income copy = Income.builder()
                    .budget(newBudgetRef)
                    .description(previousIncome.getDescription())
                    .day(previousIncome.getDay())
                    .value(previousIncome.getValue())
                    .build();
            incomeRepository.save(copy);
            copied++;
        }
        return copied;
    }
}
