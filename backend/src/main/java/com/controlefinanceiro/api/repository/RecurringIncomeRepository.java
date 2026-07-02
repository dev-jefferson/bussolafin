package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.RecurringIncome;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecurringIncomeRepository extends JpaRepository<RecurringIncome, UUID> {

    List<RecurringIncome> findByUser_IdOrderByDescriptionAsc(UUID userId);

    List<RecurringIncome> findByUser_IdAndActiveTrue(UUID userId);

    Optional<RecurringIncome> findByIdAndUser_Id(UUID id, UUID userId);
}
