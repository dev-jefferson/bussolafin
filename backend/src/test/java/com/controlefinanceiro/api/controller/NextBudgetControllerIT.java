package com.controlefinanceiro.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.controlefinanceiro.api.AbstractIntegrationTest;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class NextBudgetControllerIT extends AbstractIntegrationTest {

    @Test
    void createsNextBudgetWithoutAnyPreviousBudget() throws Exception {
        String token = registerAndGetToken("next-budget-first@example.com");
        LocalDate now = LocalDate.now();

        mockMvc.perform(post("/api/v1/budgets/next")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budget.month").value(now.getMonthValue()))
                .andExpect(jsonPath("$.budget.year").value(now.getYear()))
                .andExpect(jsonPath("$.budget.previousBalance").value(0.00))
                .andExpect(jsonPath("$.generation.expensesAdded").value(0))
                .andExpect(jsonPath("$.generation.incomesAdded").value(0))
                .andExpect(jsonPath("$.incomesCopied").value(0));
    }

    @Test
    void createsNextBudgetCarryingForwardPreviousLeftoverAndRecurringItems() throws Exception {
        String token = registerAndGetToken("next-budget-carry@example.com");

        String categoryId = createCategory(token, "Casa");
        createRecurringExpense(token, "Aluguel", categoryId, "1000.00");

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":7,"year":2026,"previousBalance":500.00}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String julyBudgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Salario","value":3000.00}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Mercado","categoryId":"%s","value":800.00,"adjustable":false}
                                """.formatted(categoryId)))
                .andExpect(status().isCreated());

        // Julho: renda total = 500 (sobra) + 3000 = 3500; gastos = 800; economia = 2700.
        MvcResult nextResult = mockMvc.perform(post("/api/v1/budgets/next")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budget.month").value(8))
                .andExpect(jsonPath("$.budget.year").value(2026))
                .andExpect(jsonPath("$.budget.previousBalance").value(2700.00))
                .andExpect(jsonPath("$.generation.expensesAdded").value(1))
                .andExpect(jsonPath("$.generation.incomesAdded").value(0))
                .andExpect(jsonPath("$.incomesCopied").value(1))
                .andReturn();
        String augustBudgetId = objectMapper.readTree(nextResult.getResponse().getContentAsString())
                .get("budget").get("id").asText();

        mockMvc.perform(get("/api/v1/budgets/" + augustBudgetId + "/incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].description").value("Salario"))
                .andExpect(jsonPath("$[0].value").value(3000.00))
                .andExpect(jsonPath("$[0].recurring").value(false));
    }

    @Test
    void doesNotDuplicateIncomeThatIsAlreadyRecurring() throws Exception {
        String token = registerAndGetToken("next-budget-no-dup@example.com");
        createRecurringIncome(token, "Salario", "3000.00");

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":7,"year":2026,"previousBalance":0}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String julyBudgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asText();

        // Populate July with the recurring income (as if "Gerar recorrentes" had been used).
        mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        MvcResult nextResult = mockMvc.perform(post("/api/v1/budgets/next")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.generation.incomesAdded").value(1))
                .andExpect(jsonPath("$.incomesCopied").value(0))
                .andReturn();
        String augustBudgetId = objectMapper.readTree(nextResult.getResponse().getContentAsString())
                .get("budget").get("id").asText();

        mockMvc.perform(get("/api/v1/budgets/" + augustBudgetId + "/incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1));
    }

    private String createCategory(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/categories")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    private void createRecurringExpense(String token, String description, String categoryId, String value)
            throws Exception {
        mockMvc.perform(post("/api/v1/recurring-expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"%s","categoryId":"%s","value":%s,"adjustable":false,"active":true}
                                """.formatted(description, categoryId, value)))
                .andExpect(status().isCreated());
    }

    private void createRecurringIncome(String token, String description, String value) throws Exception {
        mockMvc.perform(post("/api/v1/recurring-incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"%s","value":%s,"active":true}
                                """.formatted(description, value)))
                .andExpect(status().isCreated());
    }
}
