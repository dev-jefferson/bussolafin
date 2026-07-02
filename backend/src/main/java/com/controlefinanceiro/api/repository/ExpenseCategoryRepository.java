package com.controlefinanceiro.api.repository;

import com.controlefinanceiro.api.domain.ExpenseCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {

    List<ExpenseCategory> findByUser_IdOrderByNameAsc(UUID userId);

    Optional<ExpenseCategory> findByIdAndUser_Id(UUID id, UUID userId);

    boolean existsByUser_IdAndNameIgnoreCase(UUID userId, String name);
}
