let categories = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    console.log('Loading categories...');
    loadCategories();
});

async function loadCategories() {
    try {
        const response = await axios.get(API_ENDPOINTS.CATEGORIES.BASE, {
            headers: getAuthHeaders()
        });
        categories = response.data;
        allCategories = [...categories];
        console.log('Categories loaded:', categories.length);
        populateCategorySelect();
    } catch (error) {
        console.error('Category loading error:', error);
        showMessage('Failed to load categories', 'error');
    }
}

function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    if (!select) {
        console.error('Category select element not found');
        return;
    }
    
    const currentPage = window.location.pathname;
    const isIncomePage = currentPage.includes('income.html');
    const isExpensePage = currentPage.includes('expense.html');
    
    console.log('Populating categories:', categories.length, 'categories found');
    
    let filteredCategories = categories;
    if (isIncomePage) {
        filteredCategories = categories.filter(cat => cat.type === 'INCOME');
        console.log('Income categories:', filteredCategories.length);
    } else if (isExpensePage) {
        filteredCategories = categories.filter(cat => cat.type === 'EXPENSE');
        console.log('Expense categories:', filteredCategories.length);
    }
    
    select.innerHTML = `<option value="">Select ${isIncomePage ? 'Income' : 'Expense'} Category</option>`;
    
    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = escapeHtml(category.name);
        select.appendChild(option);
    });
    
    console.log('Categories populated successfully');
}

function filterCategories(type) {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    const select = document.getElementById('categoryId');
    
    const filteredCategories = allCategories.filter(cat => 
        cat.type === type && cat.name.toLowerCase().includes(searchTerm)
    );
    
    select.innerHTML = `<option value="">Select ${type === 'INCOME' ? 'Income' : 'Expense'} Category</option>`;
    
    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = escapeHtml(category.name);
        select.appendChild(option);
    });
}

async function saveIncome(event) {
    event.preventDefault();
    await saveTransaction(event, 'INCOME');
}

async function saveExpense(event) {
    event.preventDefault();
    await saveTransaction(event, 'EXPENSE');
}

async function saveTransaction(event, type) {
    const categoryId = document.getElementById('categoryId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    
    if (!categoryId || !amount || !date) {
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
        await axios.post(API_ENDPOINTS.TRANSACTIONS.BASE, transactionData, {
            headers: getAuthHeaders()
        });
        
        showMessage(`${type === 'INCOME' ? 'Income' : 'Expense'} added successfully! 🎉`, 'success');
        
        // Reset form
        document.getElementById(type === 'INCOME' ? 'incomeForm' : 'expenseForm').reset();
        document.getElementById('date').valueAsDate = new Date();
        document.getElementById('categorySearch').value = '';
        populateCategorySelect();
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        const message = error.response?.data?.error || `Failed to add ${type.toLowerCase()}`;
        showMessage(message, 'error');
    }
}

function showAddCategoryModal(type) {
    document.getElementById('newCategoryType').value = type;
    document.getElementById('addCategoryModal').style.display = 'block';
}

function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

async function saveNewCategory(event) {
    event.preventDefault();
    
    const name = document.getElementById('newCategoryName').value.trim();
    const type = document.getElementById('newCategoryType').value;
    
    if (!name) {
        showMessage('Please enter category name', 'error');
        return;
    }
    
    try {
        await axios.post(API_ENDPOINTS.CATEGORIES.BASE, { name, type }, {
            headers: getAuthHeaders()
        });
        showMessage('Category added successfully', 'success');
        closeAddCategoryModal();
        loadCategories();
    } catch (error) {
        showMessage('Failed to add category', 'error');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addCategoryModal');
    if (event.target === modal) {
        closeAddCategoryModal();
    }
}