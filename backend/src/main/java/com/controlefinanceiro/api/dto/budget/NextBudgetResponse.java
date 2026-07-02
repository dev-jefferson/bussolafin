package com.controlefinanceiro.api.dto.budget;

import com.controlefinanceiro.api.dto.recurring.GenerateRecurringResponse;

public record NextBudgetResponse(
        BudgetResponse budget, GenerateRecurringResponse generation, int incomesCopied) {
}
