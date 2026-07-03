package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.Budget;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUser_IdOrderByYearDescMonthDesc(UUID userId);

    Optional<Budget> findFirstByUser_IdOrderByYearDescMonthDesc(UUID userId);

    Optional<Budget> findByIdAndUser_Id(UUID id, UUID userId);

    Optional<Budget> findByUser_IdAndMonthAndYear(UUID userId, int month, int year);

    boolean existsByUser_IdAndMonthAndYear(UUID userId, int month, int year);

    List<Budget> findTop12ByUser_IdOrderByYearDescMonthDesc(UUID userId);

    /**
     * Budgets strictly before the given period, most recent first - element 0 is the
     * "predecessor" whose economia should feed this period's previousBalance.
     */
    @Query("""
        SELECT b FROM Budget b
        WHERE b.user.id = :userId
          AND (b.year < :year OR (b.year = :year AND b.month < :month))
        ORDER BY b.year DESC, b.month DESC
        """)
    List<Budget> findBudgetsBeforePeriod(
            @Param("userId") UUID userId, @Param("year") int year, @Param("month") int month, Pageable pageable);
}
