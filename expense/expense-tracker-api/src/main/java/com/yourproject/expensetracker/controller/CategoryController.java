package com.yourproject.expensetracker.controller;

import com.yourproject.expensetracker.dto.CategoryDto;
import com.yourproject.expensetracker.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(Authentication authentication) {
        List<CategoryDto> categories = categoryService.getUserCategories(authentication.getName());
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto, 
                                                     Authentication authentication) {
        CategoryDto createdCategory = categoryService.createCategory(authentication.getName(), categoryDto);
        return ResponseEntity.ok(createdCategory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Authentication authentication) {
        categoryService.deleteCategory(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }
}