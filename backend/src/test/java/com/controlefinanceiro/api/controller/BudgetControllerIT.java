package com.controlefinanceiro.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.controlefinanceiro.api.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class BudgetControllerIT extends AbstractIntegrationTest {

    @Test
    void fullFlowCreatesBudgetWithIncomesAndExpensesAndComputesSummary() throws Exception {
        String token = registerAndGetToken("owner@example.com");

        String comidaCategoryId = createCategory(token, "COMIDA", true);
        String aguaCategoryId = createCategory(token, "AGUA", false);

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":7,"year":2026,"previousBalance":900.00}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Renda dia 10","day":10,"value":19240.00}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId":"%s","value":2000.00,"simulatedValue":800.00}
                                """.formatted(comidaCategoryId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryId":"%s","value":100.00}
                                """.formatted(aguaCategoryId)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/summary")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(20140.00))
                .andExpect(jsonPath("$.totalExpenses").value(2100.00))
                .andExpect(jsonPath("$.totalExpensesSimulated").value(900.00))
                .andExpect(jsonPath("$.totalAdjustable").value(2000.00))
                .andExpect(jsonPath("$.totalAdjustableSimulated").value(800.00))
                .andExpect(jsonPath("$.economia").value(18040.00))
                .andExpect(jsonPath("$.economiaSimulada").value(19240.00));
    }

    @Test
    void userCannotAccessAnotherUsersBudget() throws Exception {
        String ownerToken = registerAndGetToken("isolation-owner@example.com");
        String intruderToken = registerAndGetToken("isolation-intruder@example.com");

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":8,"year":2026,"previousBalance":0}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String budgetId = objectMapper.readTree(budgetResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(get("/api/v1/budgets/" + budgetId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + intruderToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/summary")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + intruderToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/budgets/" + budgetId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + intruderToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void cannotCreateDuplicateBudgetForSamePeriod() throws Exception {
        String token = registerAndGetToken("dupbudget@example.com");

        mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":9,"year":2026,"previousBalance":0}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":9,"year":2026,"previousBalance":0}
                                """))
                .andExpect(status().isConflict());
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
}
