package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.ExpenseCategory;
import com.controlefinanceiro.api.dto.category.CategoryRequest;
import com.controlefinanceiro.api.dto.category.CategoryResponse;
import com.controlefinanceiro.api.exception.DuplicateResourceException;
import com.controlefinanceiro.api.exception.ResourceNotFoundException;
import com.controlefinanceiro.api.mapper.CategoryMapper;
import com.controlefinanceiro.api.repository.ExpenseCategoryRepository;
import com.controlefinanceiro.api.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final ExpenseCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> list(UUID userId) {
        return categoryRepository.findByUser_IdOrderByNameAsc(userId).stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(UUID userId, CategoryRequest request) {
        if (categoryRepository.existsByUser_IdAndNameIgnoreCase(userId, request.name())) {
            throw new DuplicateResourceException("Categoria já cadastrada: " + request.name());
        }
        ExpenseCategory category = ExpenseCategory.builder()
                .user(userRepository.getReferenceById(userId))
                .name(request.name())
                .build();
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID userId, UUID categoryId, CategoryRequest request) {
        ExpenseCategory category = findOwned(userId, categoryId);
        category.setName(request.name());
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public void delete(UUID userId, UUID categoryId) {
        ExpenseCategory category = findOwned(userId, categoryId);
        categoryRepository.delete(category);
    }

    private ExpenseCategory findOwned(UUID userId, UUID categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
