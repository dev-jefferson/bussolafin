package com.controlefinanceiro.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.controlefinanceiro.api.AbstractIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class RecurringControllerIT extends AbstractIntegrationTest {

    @Test
    void generateRecurringCreatesEntriesAndIsIdempotent() throws Exception {
        String token = registerAndGetToken("recurring-generate@example.com");
        String categoryId = createCategory(token, "Mobilidade", true);
        createRecurringExpense(token, "Gasolina", categoryId, "250.00");
        createRecurringIncome(token, "Salário", "3000.00");

        String budgetId = createBudget(token, 7, 2026);

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expensesAdded").value(1))
                .andExpect(jsonPath("$.incomesAdded").value(1));

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value("Gasolina"))
                .andExpect(jsonPath("$[0].value").value(250.00))
                .andExpect(jsonPath("$[0].recurring").value(true));

        // Calling it again must not duplicate entries.
        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expensesAdded").value(0))
                .andExpect(jsonPath("$.incomesAdded").value(0));

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void editingRecurringTemplateDoesNotAffectAlreadyGeneratedMonths() throws Exception {
        String token = registerAndGetToken("recurring-edit@example.com");
        String categoryId = createCategory(token, "Casa", false);
        String recurringExpenseId = createRecurringExpense(token, "Aluguel", categoryId, "1000.00");

        String julyBudgetId = createBudget(token, 7, 2026);
        mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        // Bump the recurring template's default value.
        mockMvc.perform(put("/api/v1/recurring-expenses/" + recurringExpenseId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Aluguel","categoryId":"%s","value":1200.00,"active":true}
                                """.formatted(categoryId)))
                .andExpect(status().isOk());

        String augustBudgetId = createBudget(token, 8, 2026);
        mockMvc.perform(post("/api/v1/budgets/" + augustBudgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/budgets/" + julyBudgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[0].value").value(1000.00));

        mockMvc.perform(get("/api/v1/budgets/" + augustBudgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[0].value").value(1200.00));
    }

    @Test
    void promoteExpenseToRecurringCreatesTemplateAndMarksInstance() throws Exception {
        String token = registerAndGetToken("recurring-promote@example.com");
        String categoryId = createCategory(token, "Saúde", true);
        String budgetId = createBudget(token, 7, 2026);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Plano de saude","categoryId":"%s","value":450.00}
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();
        String expenseId = objectMapper.readTree(expenseResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses/" + expenseId + "/promote-to-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Plano de saude"))
                .andExpect(jsonPath("$.active").value(true));

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[0].recurring").value(true));

        mockMvc.perform(get("/api/v1/recurring-expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void expenseDayFlowsThroughCreatePromoteAndGeneration() throws Exception {
        String token = registerAndGetToken("expense-day@example.com");
        String categoryId = createCategory(token, "Contas", false);
        String julyBudgetId = createBudget(token, 7, 2026);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Luz","categoryId":"%s","day":10,"value":150.00}
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.day").value(10))
                .andReturn();
        String expenseId = objectMapper.readTree(expenseResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/budgets/" + julyBudgetId + "/expenses/" + expenseId + "/promote-to-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.day").value(10));

        String augustBudgetId = createBudget(token, 8, 2026);
        mockMvc.perform(post("/api/v1/budgets/" + augustBudgetId + "/generate-recurring")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/budgets/" + augustBudgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[0].day").value(10));
    }

    private String createCategory(String token, String name, boolean adjustable) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/categories")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","adjustable":%s}
                                """.formatted(name, adjustable)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    private String createBudget(String token, int month, int year) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":%d,"year":%d,"previousBalance":0}
                                """.formatted(month, year)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    private String createRecurringExpense(String token, String description, String categoryId, String value)
            throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/recurring-expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"%s","categoryId":"%s","value":%s,"active":true}
                                """.formatted(description, categoryId, value)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("id").asText();
    }

    private String createRecurringIncome(String token, String description, String value) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/recurring-incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"%s","value":%s,"active":true}
                                """.formatted(description, value)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }
}
