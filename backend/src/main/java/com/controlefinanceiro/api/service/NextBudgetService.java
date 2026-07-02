package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.Budget;
import com.controlefinanceiro.api.dto.budget.BudgetRequest;
import com.controlefinanceiro.api.dto.budget.BudgetResponse;
import com.controlefinanceiro.api.dto.budget.NextBudgetResponse;
import com.controlefinanceiro.api.dto.recurring.GenerateRecurringResponse;
import com.controlefinanceiro.api.dto.summary.BudgetSummaryResponse;
import com.controlefinanceiro.api.repository.BudgetRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
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

        return new NextBudgetResponse(created, generation);
    }
}
