# EasyFi - Expense Tracker

A modern, professional expense tracking application designed for the Indian market with comprehensive financial management features.

## 🌟 Features

### 💰 Financial Management
- **Income Tracking**: Record and categorize income sources
- **Expense Management**: Track spending with detailed categorization
- **Balance Monitoring**: Real-time balance calculations
- **Monthly Income Reminders**: Automated salary tracking with notifications

### 📊 Analytics & Reporting
- **Interactive Charts**: Monthly overview and category-wise expense charts
- **Financial Summary**: Total income, expenses, and balance overview
- **Transaction History**: Detailed transaction logs with search and filter

### 🔔 Smart Notifications
- **Low Balance Alerts**: Customizable wallet balance warnings
- **Monthly Salary Reminders**: Automated reminders on specified days
- **Browser Notifications**: Native notification support

### 🏦 Indian Market Features
- **INR Currency**: All amounts displayed in Indian Rupees (₹)
- **Indian Banking**: Support for SBI, HDFC, ICICI, Axis Bank, etc.
- **UPI Integration**: PhonePe, Google Pay, Paytm payment methods
- **Local Categories**: Pre-configured categories for Indian spending patterns

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: H2 (Development) / PostgreSQL (Production)
- **Security**: JWT Authentication
- **API**: RESTful APIs with proper error handling

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with dark theme
- **Charts**: Chart.js for data visualization
- **Icons**: Professional SVG icons
- **Responsive**: Mobile-first design

### Database Schema
```sql
Users (id, username, email, password, created_at)
Categories (id, name, type, user_id, created_at)
Transactions (id, amount, description, date, type, category_id, user_id, created_at)
```

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Modern web browser

### Backend Setup
```bash
cd expense-tracker-api
mvn clean install
mvn spring-boot:run
```
Server runs on: `http://localhost:8080`

### Frontend Setup
```bash
cd expense-tracker-ui
# Serve using any HTTP server
python -m http.server 3000
# OR
npx serve .
```
Frontend runs on: `http://localhost:3000`

### Default Configuration
- **Database**: H2 in-memory (auto-configured)
- **API Base URL**: `http://localhost:8080/api`
- **Default Categories**: Auto-created on user registration

## 📱 User Guide

### Getting Started
1. **Register**: Create account with username, email, password
2. **Login**: Access dashboard with credentials
3. **Setup**: Configure monthly income and reminder settings
4. **Track**: Start adding income and expenses

### Dashboard Features
- **Stats Cards**: Income, expenses, balance, wallet overview
- **Quick Actions**: Fast access to add income/expense
- **Charts**: Visual representation of financial data
- **Recent Transactions**: Latest 5 transactions with status

### Adding Transactions
- **Income Page**: Dedicated page for income entries
- **Expense Page**: Separate page for expense tracking
- **Category Search**: Real-time category filtering
- **Auto-categorization**: Smart category suggestions

### Settings & Reminders
- **Monthly Income**: Set salary amount and payment day
- **Low Balance Alerts**: Configure wallet warnings
- **Reminder System**: Enable/disable monthly notifications
- **Browser Notifications**: Native notification support

## 🏗️ Project Structure

```
expense/
├── expense-tracker-api/          # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/yourproject/expensetracker/
│   │       ├── controller/       # REST Controllers
│   │       ├── service/          # Business Logic
│   │       ├── model/           # JPA Entities
│   │       ├── repository/      # Data Access Layer
│   │       ├── dto/             # Data Transfer Objects
│   │       └── config/          # Configuration Classes
│   └── pom.xml                  # Maven Dependencies
│
├── expense-tracker-ui/           # Frontend Application
│   ├── css/
│   │   └── style.css           # Modern CSS Styling
│   ├── js/
│   │   ├── auth.js             # Authentication Logic
│   │   ├── main.js             # Main Application Logic
│   │   ├── dashboard.js        # Dashboard Functionality
│   │   ├── transaction.js      # Transaction Management
│   │   ├── settings.js         # Settings & Reminders
│   │   └── config.js           # API Configuration
│   ├── index.html              # Landing Page
│   ├── login.html              # Login Page
│   ├── register.html           # Registration Page
│   ├── dashboard.html          # Main Dashboard
│   ├── income.html             # Income Entry Page
│   ├── expense.html            # Expense Entry Page
│   ├── settings.html           # Settings Page
│   └── [other pages]           # Additional Pages
│
└── README.md                    # This File
```

## 🔧 Configuration

### Backend Configuration (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# Server Configuration
server.port=8080
```

### Frontend Configuration (js/config.js)
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`
    },
    TRANSACTIONS: {
        BASE: `${API_BASE_URL}/transactions`,
        SUMMARY: `${API_BASE_URL}/transactions/summary`
    },
    CATEGORIES: {
        BASE: `${API_BASE_URL}/categories`
    }
};
```

## 🚀 Deployment

### Production Database Setup
1. **PostgreSQL Configuration**:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/easyfi
spring.datasource.username=your-username
spring.datasource.password=your-password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

2. **Environment Variables**:
```bash
export DB_URL=jdbc:postgresql://localhost:5432/easyfi
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export JWT_SECRET=your-production-secret
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim
COPY target/expense-tracker-api.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@easyfi.com
- Documentation: [Wiki](https://github.com/yourrepo/easyfi/wiki)

## 🎯 Roadmap

- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Budget Planning
- [ ] Multi-currency Support
- [ ] Bank Integration APIs
- [ ] Export/Import Features
- [ ] Team Collaboration

---

**EasyFi** - Making expense tracking easy for everyone! 🚀
