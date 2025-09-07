let transactions = [];
let categories = [];
let monthlyChart, categoryChart;

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    loadUserInfo();
    loadCategories();
    loadTransactions();
    loadSummary();
    updateMonthlyIncomeDisplay();
    checkDashboardReminder();
    initializeCharts();
});

function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('username').textContent = `Welcome, ${escapeHtml(user.username)}`;
    }
}

async function loadCategories() {
    try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.BASE, {
            headers: getAuthHeaders()
        });
        categories = response.data;
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
        updateCharts();
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

function displaySummary(summary) {
    document.getElementById('totalIncome').textContent = `₹${summary.totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `₹${summary.totalExpense.toFixed(2)}`;
    document.getElementById('balance').textContent = `₹${summary.balance.toFixed(2)}`;
    document.getElementById('walletBalance').textContent = `₹${summary.balance.toFixed(2)}`;
    
    checkWalletAlert(summary.balance);
}

function displayTransactions() {
    const container = document.getElementById('transactionsList');
    container.innerHTML = '';
    
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<div class="no-transactions">No transactions yet</div>';
        return;
    }
    
    recentTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const isIncome = transaction.type === 'INCOME';
        const icon = isIncome ? '📈' : '📉';
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
                ${transaction.amount.toFixed(2)}
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

function initializeCharts() {
    // Monthly Chart
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4
            }, {
                label: 'Expenses',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#ff4444',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                x: { ticks: { color: '#ccc' } },
                y: { ticks: { color: '#ccc' } }
            }
        }
    });
    
    // Category Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: ['#ff4444', '#00ff88', '#4facfe', '#ffd700', '#ff69b4']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            }
        }
    });
}

function updateCharts() {
    // Update category chart with actual data
    const expensesByCategory = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
        const categoryName = t.categoryName || 'Unknown';
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + parseFloat(t.amount);
    });
    
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    
    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.update();
}

function showMonthlyIncomeModal() {
    const monthlyIncome = localStorage.getItem('monthlyIncome') || '0';
    const lowBalanceAlert = localStorage.getItem('lowBalanceAlert') || '100';
    
    document.getElementById('monthlyAmount').value = monthlyIncome;
    document.getElementById('lowBalanceAlert').value = lowBalanceAlert;
    document.getElementById('monthlyIncomeModal').style.display = 'block';
}

function closeMonthlyIncomeModal() {
    document.getElementById('monthlyIncomeModal').style.display = 'none';
}

function saveMonthlyIncome(event) {
    event.preventDefault();
    
    const monthlyAmount = document.getElementById('monthlyAmount').value;
    const lowBalanceAlert = document.getElementById('lowBalanceAlert').value;
    
    localStorage.setItem('monthlyIncome', monthlyAmount);
    localStorage.setItem('lowBalanceAlert', lowBalanceAlert);
    
    updateMonthlyIncomeDisplay();
    showMessage('Monthly income settings saved successfully', 'success');
    closeMonthlyIncomeModal();
}

function updateMonthlyIncomeDisplay() {
    const monthlyIncome = localStorage.getItem('monthlyIncome') || '0';
    const monthlyEl = document.getElementById('monthlyIncome');
    if (monthlyEl) {
        monthlyEl.textContent = `Monthly Income: ₹${parseFloat(monthlyIncome).toFixed(2)}`;
    }
}

function checkWalletAlert(balance) {
    const lowBalanceLimit = parseFloat(localStorage.getItem('lowBalanceAlert') || '100');
    const alertEl = document.getElementById('walletAlert');
    
    if (alertEl && balance < lowBalanceLimit) {
        alertEl.textContent = `⚠️ Low Balance Alert! Your wallet is below ₹${lowBalanceLimit.toFixed(2)}`;
        alertEl.style.display = 'block';
    } else if (alertEl) {
        alertEl.style.display = 'none';
    }
}

function checkDashboardReminder() {
    const reminderStatus = JSON.parse(localStorage.getItem('reminderStatus') || '{}');
    const reminderEl = document.getElementById('dashboardReminder');
    
    if (!reminderEl) return;
    
    if (reminderStatus.shouldShowReminder && reminderStatus.enableReminders) {
        reminderEl.innerHTML = `
            <div class="reminder-banner">
                <div class="reminder-content">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                    </svg>
                    <span><strong>Salary Reminder:</strong> Time to add your monthly salary of ₹${parseFloat(reminderStatus.monthlyAmount || 0).toFixed(2)}!</span>
                </div>
                <button onclick="window.location.href='settings.html'" class="btn-small">Add Salary</button>
            </div>
        `;
        reminderEl.style.display = 'block';
    } else {
        reminderEl.style.display = 'none';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const monthlyModal = document.getElementById('monthlyIncomeModal');
    if (event.target === monthlyModal) {
        closeMonthlyIncomeModal();
    }
}