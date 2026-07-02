package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.Budget;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUser_IdOrderByYearDescMonthDesc(UUID userId);

    Optional<Budget> findFirstByUser_IdOrderByYearDescMonthDesc(UUID userId);

    Optional<Budget> findByIdAndUser_Id(UUID id, UUID userId);

    Optional<Budget> findByUser_IdAndMonthAndYear(UUID userId, int month, int year);

    boolean existsByUser_IdAndMonthAndYear(UUID userId, int month, int year);

    List<Budget> findTop12ByUser_IdOrderByYearDescMonthDesc(UUID userId);
}
