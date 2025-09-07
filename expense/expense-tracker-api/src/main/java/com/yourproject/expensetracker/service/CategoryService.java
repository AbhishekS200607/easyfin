package com.yourproject.expensetracker.service;

import com.yourproject.expensetracker.dto.CategoryDto;
import com.yourproject.expensetracker.exception.CategoryNotFoundException;
import com.yourproject.expensetracker.exception.UnauthorizedAccessException;
import com.yourproject.expensetracker.model.Category;
import com.yourproject.expensetracker.repository.CategoryRepository;
import com.yourproject.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CategoryDto> getUserCategories(String username) {
        Long userId = getUserIdByUsername(username);
        return categoryRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto createCategory(String username, CategoryDto categoryDto) {
        Long userId = getUserIdByUsername(username);
        Category category = new Category(userId, categoryDto.getName(), categoryDto.getType());
        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    public void deleteCategory(String username, Long categoryId) {
        Long userId = getUserIdByUsername(username);
        Category category = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    private Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"))
                .getId();
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getType());
    }
}