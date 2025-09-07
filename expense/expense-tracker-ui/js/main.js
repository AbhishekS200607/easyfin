let transactions = [];
let categories = [];
let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadUserInfo();
    loadCategories();
    loadTransactions();
    loadSummary();
});

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('username').textContent = escapeHtml(user.username);
    }
}

async function loadCategories() {
    try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.BASE, {
            headers: getAuthHeaders()
        });
        categories = response.data;
        populateCategorySelect();
    } catch (error) {
        showMessage('Failed to load categories', 'error');
    }
}

async function loadTransactions() {
    try {
        const response = await axios.get(API_ENDPOINTS.TRANSACTIONS.BASE, {
            headers: getAuthHeaders()
        });
        transactions = response.data;
        displayTransactions();
    } catch (error) {
        showMessage('Failed to load transactions', 'error');
    }
}

async function loadSummary() {
    try {
        const response = await axios.get(API_ENDPOINTS.TRANSACTIONS.SUMMARY, {
            headers: getAuthHeaders()
        });
        displaySummary(response.data);
    } catch (error) {
        showMessage('Failed to load summary', 'error');
    }
}

function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = escapeHtml(category.name);
        option.dataset.type = category.type;
        select.appendChild(option);
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadUserInfo();
    loadCategories();
    loadTransactions();
    loadSummary();
    updateMonthlyIncomeDisplay();
    checkDashboardReminder();
});

function displayTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Show only recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<div class="no-transactions">No transactions yet</div>';
        return;
    }
    
    recentTransactions.forEach((transaction, index) => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const isIncome = transaction.type === 'INCOME';
        const icon = isIncome ? '↗️' : '↙️';
        const amountClass = isIncome ? 'income' : 'expense';
        const amountPrefix = isIncome ? '+' : '-';
        
        item.innerHTML = `
            <div class="transaction-icon ${amountClass}">
                ${icon}
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${escapeHtml(transaction.categoryName || 'Unknown')}</div>
                <div class="transaction-time">${formatTransactionTime(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${amountPrefix}$${transaction.amount.toFixed(2)}
            </div>
        `;
        
        container.appendChild(item);
    });
}

function formatTransactionTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function displaySummary(summary) {
    const incomeEl = document.getElementById('totalIncome');
    const expenseEl = document.getElementById('totalExpense');
    const balanceEl = document.getElementById('balance');
    const walletEl = document.getElementById('walletBalance');
    
    incomeEl.textContent = `$${summary.totalIncome.toFixed(2)}`;
    expenseEl.textContent = `$${summary.totalExpense.toFixed(2)}`;
    balanceEl.textContent = `$${summary.balance.toFixed(2)}`;
    
    if (walletEl) {
        walletEl.textContent = `$${summary.balance.toFixed(2)}`;
        walletEl.className = `wallet-amount ${summary.balance >= 0 ? 'positive' : 'negative'}`;
    }
    
    balanceEl.className = `amount ${summary.balance >= 0 ? 'positive' : 'negative'}`;
    
    // Check wallet alert
    checkWalletAlert(summary.balance);
    
    // Add pulse animation to updated summary
    [incomeEl, expenseEl, balanceEl, walletEl].filter(el => el).forEach(el => {
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 600);
    });
}

async function saveTransaction(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    
    if (!categoryId || !amount || !date || !type) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showMessage('Amount must be greater than 0', 'error');
        return;
    }
    
    const transactionData = {
        categoryId: parseInt(categoryId),
        amount,
        description,
        date,
        type
    };
    
    try {
        if (currentEditId) {
            await axios.put(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${currentEditId}`, transactionData, {
                headers: getAuthHeaders()
            });
            showMessage('Transaction updated successfully', 'success');
        } else {
            await axios.post(API_ENDPOINTS.TRANSACTIONS.BASE, transactionData, {
                headers: getAuthHeaders()
            });
            showMessage('Transaction added successfully', 'success');
        }
        
        resetForm();
        loadTransactions();
        loadSummary();
    } catch (error) {
        const message = error.response?.data?.error || 'Failed to save transaction';
        showMessage(message, 'error');
    }
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    currentEditId = id;
    document.getElementById('categoryId').value = transaction.categoryId;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('description').value = transaction.description || '';
    document.getElementById('date').value = transaction.date;
    document.getElementById('type').value = transaction.type;
    
    document.getElementById('submitBtn').textContent = 'Update Transaction';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
        await axios.delete(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`, {
            headers: getAuthHeaders()
        });
        showMessage('Transaction deleted successfully', 'success');
        loadTransactions();
        loadSummary();
    } catch (error) {
        showMessage('Failed to delete transaction', 'error');
    }
}

function resetForm() {
    document.getElementById('transactionForm').reset();
    currentEditId = null;
    document.getElementById('submitBtn').textContent = 'Add Transaction';
    document.getElementById('cancelBtn').style.display = 'none';
}

function checkDashboardReminder() {
    const enableReminders = localStorage.getItem('enableReminders') === 'true';
    const monthlyAmount = localStorage.getItem('monthlyIncome');
    const incomeDay = parseInt(localStorage.getItem('incomeDay') || '1');
    const lastIncomeMonth = localStorage.getItem('lastIncomeMonth');
    
    const reminderEl = document.getElementById('dashboardReminder');
    
    if (!enableReminders || !monthlyAmount) {
        reminderEl.style.display = 'none';
        return;
    }
    
    const today = new Date();
    const currentMonth = today.getFullYear() + '-' + (today.getMonth() + 1);
    const currentDay = today.getDate();
    
    if (lastIncomeMonth !== currentMonth && currentDay >= incomeDay) {
        reminderEl.innerHTML = `
            <div class="reminder-banner">
                🔔 <strong>Income Reminder:</strong> Time to add your monthly income of $${parseFloat(monthlyAmount).toFixed(2)}!
                <button onclick="window.location.href='settings.html'" class="btn-small">Add Income</button>
            </div>
        `;
        reminderEl.style.display = 'block';
    } else {
        reminderEl.style.display = 'none';
    }
}

function updateMonthlyIncomeDisplay() {
    const monthlyIncome = localStorage.getItem('monthlyIncome') || '0';
    const monthlyEl = document.getElementById('monthlyIncome');
    if (monthlyEl) {
        monthlyEl.textContent = `Monthly Income: $${parseFloat(monthlyIncome).toFixed(2)}`;
    }
}

function checkWalletAlert(balance) {
    const lowBalanceLimit = parseFloat(localStorage.getItem('lowBalanceAlert') || '100');
    const alertEl = document.getElementById('walletAlert');
    
    if (alertEl && balance < lowBalanceLimit) {
        alertEl.textContent = `⚠️ Low Balance Alert! Your wallet is below $${lowBalanceLimit.toFixed(2)}`;
        alertEl.style.display = 'block';
        alertEl.classList.add('animate-pulse');
    } else if (alertEl) {
        alertEl.style.display = 'none';
    }
}

