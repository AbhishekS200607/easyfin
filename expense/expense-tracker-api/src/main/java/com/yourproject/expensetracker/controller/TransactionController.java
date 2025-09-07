package com.yourproject.expensetracker.controller;

import com.yourproject.expensetracker.dto.TransactionDto;
import com.yourproject.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getTransactions(Authentication authentication) {
        List<TransactionDto> transactions = transactionService.getUserTransactions(authentication.getName());
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionDto transactionDto,
                                                           Authentication authentication) {
        TransactionDto createdTransaction = transactionService.createTransaction(authentication.getName(), transactionDto);
        return ResponseEntity.ok(createdTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(@PathVariable Long id,
                                                           @Valid @RequestBody TransactionDto transactionDto,
                                                           Authentication authentication) {
        TransactionDto updatedTransaction = transactionService.updateTransaction(authentication.getName(), id, transactionDto);
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        transactionService.deleteTransaction(authentication.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary(Authentication authentication) {
        Map<String, Object> summary = transactionService.getFinancialSummary(authentication.getName());
        return ResponseEntity.ok(summary);
    }
}