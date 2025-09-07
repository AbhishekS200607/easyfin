document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    loadSettings();
    checkIncomeReminder();
    
    // Check for reminders every day
    setInterval(checkIncomeReminder, 24 * 60 * 60 * 1000); // Check daily
});

function loadSettings() {
    const monthlyAmount = localStorage.getItem('monthlyIncome') || '';
    const incomeDay = localStorage.getItem('incomeDay') || '1';
    const lowBalanceAlert = localStorage.getItem('lowBalanceAlert') || '100';
    const enableReminders = localStorage.getItem('enableReminders') === 'true';
    
    document.getElementById('monthlyAmount').value = monthlyAmount;
    document.getElementById('incomeDay').value = incomeDay;
    document.getElementById('lowBalanceAlert').value = lowBalanceAlert;
    document.getElementById('enableReminders').checked = enableReminders;
}

function saveMonthlyIncomeSettings(event) {
    event.preventDefault();
    
    const monthlyAmount = document.getElementById('monthlyAmount').value;
    const incomeDay = document.getElementById('incomeDay').value;
    const lowBalanceAlert = document.getElementById('lowBalanceAlert').value;
    const enableReminders = document.getElementById('enableReminders').checked;
    
    localStorage.setItem('monthlyIncome', monthlyAmount);
    localStorage.setItem('incomeDay', incomeDay);
    localStorage.setItem('lowBalanceAlert', lowBalanceAlert);
    localStorage.setItem('enableReminders', enableReminders);
    
    // Request notification permission if reminders are enabled
    if (enableReminders && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    showMessage('Settings saved successfully! 💾', 'success');
    checkIncomeReminder();
}

function checkIncomeReminder() {
    const enableReminders = localStorage.getItem('enableReminders') === 'true';
    const monthlyAmount = localStorage.getItem('monthlyIncome');
    const incomeDay = parseInt(localStorage.getItem('incomeDay') || '1');
    const lastIncomeMonth = localStorage.getItem('lastIncomeMonth');
    
    const reminderBox = document.getElementById('incomeReminder');
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    
    if (!enableReminders || !monthlyAmount) {
        if (reminderBox) {
            reminderBox.innerHTML = '<p>Enable reminders and set monthly income to get notifications</p>';
        }
        if (addIncomeBtn) {
            addIncomeBtn.style.display = 'none';
        }
        return;
    }
    
    const today = new Date();
    const currentMonth = today.getFullYear() + '-' + (today.getMonth() + 1);
    const currentDay = today.getDate();
    
    // Store reminder status for dashboard
    const reminderData = {
        enableReminders,
        monthlyAmount,
        incomeDay,
        lastIncomeMonth,
        currentMonth,
        currentDay,
        shouldShowReminder: currentDay >= incomeDay && lastIncomeMonth !== currentMonth
    };
    localStorage.setItem('reminderStatus', JSON.stringify(reminderData));
    
    if (!reminderBox) return; // Exit if not on settings page
    
    // Check if income for this month is already added
    if (lastIncomeMonth === currentMonth) {
        reminderBox.innerHTML = `
            <div class="reminder-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Monthly salary for ${getMonthName(today.getMonth())} already added!
                <br><small>Amount: ₹${parseFloat(monthlyAmount).toFixed(2)}</small>
            </div>
        `;
        addIncomeBtn.style.display = 'none';
        return;
    }
    
    // Check if it's time for income reminder
    if (currentDay >= incomeDay) {
        reminderBox.innerHTML = `
            <div class="reminder-alert">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                Time to add your monthly salary!
                <br><strong>Amount: ₹${parseFloat(monthlyAmount).toFixed(2)}</strong>
                <br><small>Salary day: ${incomeDay} of each month</small>
            </div>
        `;
        addIncomeBtn.style.display = 'block';
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Salary Reminder', {
                body: `Time to add your monthly salary of ₹${parseFloat(monthlyAmount).toFixed(2)}!`,
                icon: '/favicon.ico'
            });
        }
    } else {
        const daysLeft = incomeDay - currentDay;
        reminderBox.innerHTML = `
            <div class="reminder-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Next salary in ${daysLeft} day${daysLeft > 1 ? 's' : ''}
                <br><strong>Amount: ₹${parseFloat(monthlyAmount).toFixed(2)}</strong>
                <br><small>Salary day: ${incomeDay} of each month</small>
            </div>
        `;
        addIncomeBtn.style.display = 'none';
    }
}

async function addMonthlyIncome() {
    const monthlyAmount = localStorage.getItem('monthlyIncome');
    
    if (!monthlyAmount) {
        showMessage('Please set monthly income amount first', 'error');
        return;
    }
    
    try {
        // Get all categories
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.BASE, {
            headers: getAuthHeaders()
        });
        
        let incomeCategory = response.data.find(cat => 
            cat.type === 'INCOME' && cat.name.toLowerCase() === 'salary'
        );
        
        // Create salary category if it doesn't exist
        if (!incomeCategory) {
            console.log('Creating Salary category...');
            const createResponse = await axios.post(API_ENDPOINTS.CATEGORIES.BASE, 
                { name: 'Salary', type: 'INCOME' }, 
                { headers: getAuthHeaders() }
            );
            incomeCategory = createResponse.data;
            console.log('Salary category created:', incomeCategory);
        }
        
        const today = new Date();
        const transactionData = {
            categoryId: incomeCategory.id,
            amount: parseFloat(monthlyAmount),
            description: `Monthly salary - ${getMonthName(today.getMonth())} ${today.getFullYear()}`,
            date: today.toISOString().split('T')[0],
            type: 'INCOME'
        };
        
        await axios.post(API_ENDPOINTS.TRANSACTIONS.BASE, transactionData, {
            headers: getAuthHeaders()
        });
        
        // Mark this month as income added
        const currentMonth = today.getFullYear() + '-' + (today.getMonth() + 1);
        localStorage.setItem('lastIncomeMonth', currentMonth);
        
        showMessage('Monthly salary added successfully! 💰', 'success');
        checkIncomeReminder();
        
    } catch (error) {
        console.error('Error adding monthly income:', error);
        showMessage('Failed to add monthly income: ' + (error.response?.data?.message || error.message), 'error');
    }
}

function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}