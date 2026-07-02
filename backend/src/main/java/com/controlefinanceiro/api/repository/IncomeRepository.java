package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.Income;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IncomeRepository extends JpaRepository<Income, UUID> {

    List<Income> findByBudget_IdAndBudget_User_IdOrderByDayAsc(UUID budgetId, UUID userId);

    Optional<Income> findByIdAndBudget_IdAndBudget_User_Id(UUID id, UUID budgetId, UUID userId);

    @Query("SELECT COALESCE(SUM(i.value), 0) FROM Income i WHERE i.budget.id = :budgetId")
    BigDecimal sumValueByBudgetId(@Param("budgetId") UUID budgetId);
}
