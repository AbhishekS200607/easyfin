package com.yourproject.expensetracker.service;

import com.yourproject.expensetracker.dto.RegisterRequest;
import com.yourproject.expensetracker.dto.UserDto;
import com.yourproject.expensetracker.model.Category;
import com.yourproject.expensetracker.model.TransactionType;
import com.yourproject.expensetracker.model.User;
import com.yourproject.expensetracker.repository.CategoryRepository;
import com.yourproject.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDto registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);
        createDefaultCategories(savedUser.getId());
        return new UserDto(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail());
    }

    private void createDefaultCategories(Long userId) {
        // Default Income Categories
        categoryRepository.save(new Category(userId, "Salary", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Freelance", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Business", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Investment", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Rental Income", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Bonus", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Gift Received", TransactionType.INCOME));
        categoryRepository.save(new Category(userId, "Other Income", TransactionType.INCOME));
        
        // Default Expense Categories
        categoryRepository.save(new Category(userId, "Food & Dining", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Groceries", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Transportation", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Fuel", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Shopping", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Clothing", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Entertainment", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Movies & Shows", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Bills & Utilities", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Rent", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Internet & Phone", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Healthcare", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Pharmacy", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Education", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Books & Courses", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Travel", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Hotel & Accommodation", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Insurance", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Gym & Fitness", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Personal Care", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Gifts & Donations", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Bank Fees", TransactionType.EXPENSE));
        categoryRepository.save(new Category(userId, "Other", TransactionType.EXPENSE));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}