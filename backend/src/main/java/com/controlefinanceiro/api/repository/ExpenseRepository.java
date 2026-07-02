package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.Expense;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByBudget_IdAndBudget_User_Id(UUID budgetId, UUID userId);

    Optional<Expense> findByIdAndBudget_IdAndBudget_User_Id(UUID id, UUID budgetId, UUID userId);

    @Query("""
        SELECT
          COALESCE(SUM(e.value), 0) as totalExpenses,
          COALESCE(SUM(CASE WHEN e.category.adjustable = true THEN COALESCE(e.simulatedValue, e.value) ELSE e.value END), 0) as totalExpensesSimulated,
          COALESCE(SUM(CASE WHEN e.category.adjustable = true THEN e.value ELSE 0 END), 0) as totalAdjustable,
          COALESCE(SUM(CASE WHEN e.category.adjustable = true THEN COALESCE(e.simulatedValue, e.value) ELSE 0 END), 0) as totalAdjustableSimulated
        FROM Expense e
        WHERE e.budget.id = :budgetId
        """)
    ExpenseTotalsProjection getTotalsByBudgetId(@Param("budgetId") UUID budgetId);

    @Query("""
        SELECT
          c.id as categoryId,
          c.name as categoryName,
          c.adjustable as adjustable,
          COALESCE(SUM(e.value), 0) as total,
          COALESCE(SUM(CASE WHEN c.adjustable = true THEN COALESCE(e.simulatedValue, e.value) ELSE e.value END), 0) as totalSimulated
        FROM Expense e
        JOIN e.category c
        WHERE e.budget.id = :budgetId
        GROUP BY c.id, c.name, c.adjustable
        ORDER BY total DESC
        """)
    List<CategoryBreakdownProjection> getBreakdownByCategory(@Param("budgetId") UUID budgetId);
}
