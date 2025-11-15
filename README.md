# Expenses Tracker

A modern, full-featured expenses tracking application with user authentication.

## Features

- 🔐 **User Authentication**: Login and registration system
- 💰 **Expense Management**: Add, edit, and delete expenses
- 📊 **Expense Summary**: View total expenses, monthly expenses, and category breakdown
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 💾 **Local Storage**: All data is stored locally in your browser

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account by clicking "Sign Up" on the login page
2. **Login**: Use your credentials to log in
3. **Add Expenses**: Click the "Add Expense" button to add new expenses
4. **View Summary**: Check the summary cards for quick insights
5. **Manage Expenses**: Edit or delete expenses as needed

## Technologies Used

- React 18
- TypeScript
- React Router
- Vite
- CSS3

## Project Structure

```
expenses-tracker/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context (Auth)
│   ├── pages/           # Page components
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

