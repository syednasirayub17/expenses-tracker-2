# 📡 API Documentation

## Base URL

**Production**: `https://expenses-tracker-api-a7ni.onrender.com`
**Development**: `http://localhost:5000`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "2025-11-24T10:00:00.000Z"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "username": "john_updated",
  "email": "john.new@example.com"
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_updated",
  "email": "john.new@example.com"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}

Response: 200 OK
{
  "message": "Password updated successfully"
}
```

---

### Bank Accounts

#### Get All Bank Accounts
```http
GET /api/accounts/bank
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "HDFC Savings",
    "balance": 50000,
    "type": "savings",
    "createdAt": "2025-11-24T10:00:00.000Z"
  }
]
```

#### Create Bank Account
```http
POST /api/accounts/bank
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "HDFC Savings",
  "balance": 50000,
  "type": "savings"
}

Response: 201 Created
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "HDFC Savings",
  "balance": 50000,
  "type": "savings"
}
```

#### Update Bank Account
```http
PUT /api/accounts/bank/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "HDFC Savings Updated",
  "balance": 55000
}

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "HDFC Savings Updated",
  "balance": 55000
}
```

#### Delete Bank Account
```http
DELETE /api/accounts/bank/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "message": "Account deleted successfully"
}
```

---

### Credit Cards

#### Get All Credit Cards
```http
GET /api/accounts/creditcard
Authorization: Bearer {token}
```

#### Create Credit Card
```http
POST /api/accounts/creditcard
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "HDFC Credit Card",
  "limit": 100000,
  "balance": 25000,
  "dueDate": "2025-12-05"
}
```

---

### Loans

#### Get All Loans
```http
GET /api/accounts/loan
Authorization: Bearer {token}
```

#### Create Loan
```http
POST /api/accounts/loan
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Home Loan",
  "principal": 5000000,
  "balance": 4500000,
  "interestRate": 8.5,
  "emiAmount": 45000,
  "emiDate": 5
}
```

---

### Transactions

#### Get All Transactions
```http
GET /api/accounts/transactions
Authorization: Bearer {token}
```

#### Create Transaction
```http
POST /api/accounts/transactions
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "accountId": "507f1f77bcf86cd799439012",
  "accountType": "bank",
  "type": "expense",
  "amount": 500,
  "category": "Food",
  "date": "2025-11-24",
  "description": "Grocery shopping"
}
```

---

### Budgets

#### Get All Budgets
```http
GET /api/accounts/budgets
Authorization: Bearer {token}
```

#### Create Budget
```http
POST /api/accounts/budgets
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "category": "Food",
  "amount": 10000,
  "period": "monthly"
}
```

---

### Investments

#### Get Stocks
```http
GET /api/investments/stocks
Authorization: Bearer {token}
```

#### Create Stock Investment
```http
POST /api/investments/stocks
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "Reliance Industries",
  "symbol": "RELIANCE",
  "quantity": 10,
  "buyPrice": 2500,
  "currentPrice": 2650
}
```

#### Get SIPs
```http
GET /api/investments/sips
Authorization: Bearer {token}
```

#### Create SIP
```http
POST /api/investments/sips
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "HDFC Equity Fund",
  "amount": 5000,
  "frequency": "monthly",
  "startDate": "2025-01-01"
}
```

---

### Day Book

#### Get Day Book Entries
```http
GET /api/daybook
Authorization: Bearer {token}
```

#### Create Day Book Entry
```http
POST /api/daybook
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "date": "2025-11-24",
  "description": "Daily summary",
  "income": 5000,
  "expense": 2000
}
```

---

### Journal

#### Get Journal Entries
```http
GET /api/journal
Authorization: Bearer {token}
```

#### Create Journal Entry
```http
POST /api/journal
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "date": "2025-11-24",
  "title": "Monthly Review",
  "content": "Financial review for November..."
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details..."
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Testing with cURL

### Register and Login
```bash
# Register
curl -X POST https://expenses-tracker-api-a7ni.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"Test123456"}'

# Login
curl -X POST https://expenses-tracker-api-a7ni.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123456"}'
```

### Use Token
```bash
# Get profile
curl -X GET https://expenses-tracker-api-a7ni.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Postman Collection

Import this collection to Postman for easy testing:

```json
{
  "info": {
    "name": "Expenses Tracker API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"Test123\"}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "register"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://expenses-tracker-api-a7ni.onrender.com"
    }
  ]
}
```

---

**Last Updated**: November 24, 2025
