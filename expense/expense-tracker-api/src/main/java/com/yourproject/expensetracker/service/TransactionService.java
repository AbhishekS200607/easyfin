package com.yourproject.expensetracker.service;

import com.yourproject.expensetracker.dto.TransactionDto;
import com.yourproject.expensetracker.exception.CategoryNotFoundException;
import com.yourproject.expensetracker.exception.TransactionNotFoundException;
import com.yourproject.expensetracker.exception.UnauthorizedAccessException;
import com.yourproject.expensetracker.model.Category;
import com.yourproject.expensetracker.model.Transaction;
import com.yourproject.expensetracker.model.TransactionType;
import com.yourproject.expensetracker.repository.CategoryRepository;
import com.yourproject.expensetracker.repository.TransactionRepository;
import com.yourproject.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TransactionDto> getUserTransactions(String username) {
        Long userId = getUserIdByUsername(username);
        return transactionRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TransactionDto createTransaction(String username, TransactionDto transactionDto) {
        Long userId = getUserIdByUsername(username);
        
        Category category = categoryRepository.findByIdAndUserId(transactionDto.getCategoryId(), userId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        Transaction transaction = new Transaction(
                userId,
                transactionDto.getCategoryId(),
                transactionDto.getAmount(),
                transactionDto.getDescription(),
                transactionDto.getDate(),
                transactionDto.getType()
        );

        Transaction savedTransaction = transactionRepository.save(transaction);
        return convertToDto(savedTransaction);
    }

    public TransactionDto updateTransaction(String username, Long transactionId, TransactionDto transactionDto) {
        Long userId = getUserIdByUsername(username);
        
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found"));

        Category category = categoryRepository.findByIdAndUserId(transactionDto.getCategoryId(), userId)
                .orElseThrow(() -> new CategoryNotFoundException("Category not found"));

        transaction.setCategoryId(transactionDto.getCategoryId());
        transaction.setAmount(transactionDto.getAmount());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setDate(transactionDto.getDate());
        transaction.setType(transactionDto.getType());

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return convertToDto(updatedTransaction);
    }

    public void deleteTransaction(String username, Long transactionId) {
        Long userId = getUserIdByUsername(username);
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    public Map<String, Object> getFinancialSummary(String username) {
        Long userId = getUserIdByUsername(username);
        
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndType(userId, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumByUserIdAndType(userId, TransactionType.EXPENSE);
        
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;
        
        BigDecimal balance = totalIncome.subtract(totalExpense);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpense", totalExpense);
        summary.put("balance", balance);
        
        return summary;
    }

    private Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedAccessException("User not found"))
                .getId();
    }

    private TransactionDto convertToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setCategoryId(transaction.getCategoryId());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setDate(transaction.getDate());
        dto.setType(transaction.getType());
        
        categoryRepository.findById(transaction.getCategoryId())
                .ifPresent(category -> dto.setCategoryName(category.getName()));
        
        return dto;
    }
}