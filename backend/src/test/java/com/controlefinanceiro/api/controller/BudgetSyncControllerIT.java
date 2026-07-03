package com.controlefinanceiro.api.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.controlefinanceiro.api.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class BudgetSyncControllerIT extends AbstractIntegrationTest {

    @Test
    void editingAnEarlierBudgetLeavesTheNextOneOutOfSyncUntilExplicitlySynced() throws Exception {
        String token = registerAndGetToken("sync-flow@example.com");

        MvcResult julyResult = mockMvc.perform(post("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"month":7,"year":2026,"previousBalance":0}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String julyId = objectMapper.readTree(julyResult.getResponse().getContentAsString())
                .get("id").asText();

        MvcResult incomeResult = mockMvc.perform(post("/api/v1/budgets/" + julyId + "/incomes")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Salario","value":3000.00}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String incomeId = objectMapper.readTree(incomeResult.getResponse().getContentAsString())
                .get("id").asText();

        // Julho: economia = 3000.
        MvcResult nextResult = mockMvc.perform(post("/api/v1/budgets/next")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.budget.previousBalance").value(3000.00))
                .andReturn();
        String augustId = objectMapper.readTree(nextResult.getResponse().getContentAsString())
                .get("budget").get("id").asText();

        // Bump July's income after August was already generated from it.
        mockMvc.perform(put("/api/v1/budgets/" + julyId + "/incomes/" + incomeId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Salario","value":4000.00}
                                """))
                .andExpect(status().isOk());

        // August is now stale: previousBalance still reflects the old July economia (3000),
        // but expectedPreviousBalance reflects the new one (4000).
        mockMvc.perform(get("/api/v1/budgets/" + augustId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.previousBalance").value(3000.00))
                .andExpect(jsonPath("$.expectedPreviousBalance").value(4000.00));

        mockMvc.perform(get("/api/v1/budgets")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[?(@.month == 8)].previousBalance").value(3000.00))
                .andExpect(jsonPath("$[?(@.month == 8)].expectedPreviousBalance").value(4000.00))
                .andExpect(jsonPath("$[?(@.month == 7)].expectedPreviousBalance[0]").value(nullValue()));

        mockMvc.perform(post("/api/v1/budgets/" + augustId + "/sync-previous-balance")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.previousBalance").value(4000.00))
                .andExpect(jsonPath("$.expectedPreviousBalance").value(4000.00));

        mockMvc.perform(get("/api/v1/budgets/" + augustId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.previousBalance").value(4000.00));
    }
}
