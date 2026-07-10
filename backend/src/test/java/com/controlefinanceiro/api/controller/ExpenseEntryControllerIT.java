package com.controlefinanceiro.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.controlefinanceiro.api.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

class ExpenseEntryControllerIT extends AbstractIntegrationTest {

    @Test
    void createsListsAndSyncsExpenseValueFromEntries() throws Exception {
        String token = registerAndGetToken("expense-entries@example.com");
        String categoryId = createCategory(token, "Comida");
        String budgetId = createBudget(token, 7, 2026);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Refeições diárias","categoryId":"%s","value":10.00,"adjustable":false}
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();
        String expenseId = objectMapper.readTree(expenseResult.getResponse().getContentAsString())
                .get("id").asText();

        String entriesBase = "/api/v1/budgets/" + budgetId + "/expenses/" + expenseId + "/entries";

        MvcResult entryResult = mockMvc.perform(post(entriesBase)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"day":10,"value":150.00}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paid").value(false))
                .andReturn();
        String entryId = objectMapper.readTree(entryResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post(entriesBase)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"day":20,"value":150.00}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get(entriesBase)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(patch(entriesBase + "/" + entryId + "/paid")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"paid":true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(true));

        mockMvc.perform(put(entriesBase + "/" + entryId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"day":11,"value":200.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value(200.00));

        // Entries now total 200 + 150 = 350; the expense's own value still shows the original 10
        // until explicitly synced.
        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$[0].value").value(10.00));

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses/" + expenseId + "/sync-value-from-entries")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value(350.00));

        mockMvc.perform(delete(entriesBase + "/" + entryId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(entriesBase)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void userCannotAccessAnotherUsersExpenseEntries() throws Exception {
        String ownerToken = registerAndGetToken("entries-owner@example.com");
        String intruderToken = registerAndGetToken("entries-intruder@example.com");
        String categoryId = createCategory(ownerToken, "Casa");
        String budgetId = createBudget(ownerToken, 8, 2026);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/expenses")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description":"Aluguel","categoryId":"%s","value":1000.00,"adjustable":false}
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();
        String expenseId = objectMapper.readTree(expenseResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/expenses/" + expenseId + "/entries")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + intruderToken))
                .andExpect(status().isNotFound());
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
}
