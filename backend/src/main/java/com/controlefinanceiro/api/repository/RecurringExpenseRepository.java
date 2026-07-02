package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.RecurringExpense;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, UUID> {

    List<RecurringExpense> findByUser_IdOrderByDescriptionAsc(UUID userId);

    List<RecurringExpense> findByUser_IdAndActiveTrue(UUID userId);

    Optional<RecurringExpense> findByIdAndUser_Id(UUID id, UUID userId);
}
