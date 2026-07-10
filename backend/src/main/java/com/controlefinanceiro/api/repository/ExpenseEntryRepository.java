package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.ExpenseEntry;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseEntryRepository extends JpaRepository<ExpenseEntry, UUID> {

    List<ExpenseEntry> findByExpense_IdAndExpense_Budget_User_IdOrderByDayAscCreatedAtAsc(
            UUID expenseId, UUID userId);

    Optional<ExpenseEntry> findByIdAndExpense_IdAndExpense_Budget_User_Id(
            UUID id, UUID expenseId, UUID userId);

    @Query("SELECT COALESCE(SUM(e.value), 0) FROM ExpenseEntry e WHERE e.expense.id = :expenseId")
    BigDecimal sumValueByExpenseId(@Param("expenseId") UUID expenseId);
}
