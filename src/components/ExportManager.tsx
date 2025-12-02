import { useAccount } from '../context/AccountContext'
import { formatCurrency } from '../utils/currency'
import { Transaction } from '../types'
import jsPDF from 'jspdf'
import './ExportManager.css'

const ExportManager = () => {
  const { bankAccounts, creditCards, loans, transactions, budgets, savings } = useAccount()

  const exportToCSV = () => {
    // Export transactions to CSV
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Account Type', 'Account Name']
    const rows = transactions.map((t) => {
      let accountName = 'Unknown'
      if (t.accountType === 'bank') {
        const acc = bankAccounts.find((a) => a.id === t.accountId)
        accountName = acc ? acc.name : 'Unknown'
      } else if (t.accountType === 'creditCard') {
        const card = creditCards.find((c) => c.id === t.accountId)
        accountName = card ? card.name : 'Unknown'
      } else if (t.accountType === 'loan') {
        const loan = loans.find((l) => l.id === t.accountId)
        accountName = loan ? loan.name : 'Unknown'
      }

      return [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        t.description || '',
        t.accountType,
        accountName,
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      bankAccounts,
      creditCards,
      loans,
      transactions,
      budgets,
      savings,
    }

    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expenses_data_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportCategoryWise = () => {
    // Get all unique categories from transactions
    const allCategories = new Set<string>()
    transactions.forEach((t) => {
      if (t.type === 'expense' || t.type === 'income') {
        allCategories.add(t.category)
      }
    })

    // Group transactions by category
    const categoryData: { [key: string]: Transaction[] } = {}
    allCategories.forEach((category) => {
      categoryData[category] = transactions.filter(
        (t) => (t.type === 'expense' || t.type === 'income') && t.category === category
      )
    })

    // Create professional branded CSV content
    let csvContent = '╔════════════════════════════════════════════════════════════════╗\n'
    csvContent += '║          EXPENSES TRACKER - CATEGORY WISE REPORT              ║\n'
    csvContent += '╚════════════════════════════════════════════════════════════════╝\n\n'
    csvContent += `Generated: ${new Date().toLocaleString()}\n`
    csvContent += `Total Categories: ${allCategories.size}\n`
    csvContent += `Total Transactions: ${transactions.length}\n\n`
    csvContent += '================================================================\n\n'

    Object.entries(categoryData).forEach(([category, categoryTransactions]) => {
      const total = categoryTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount)
      }, 0)

      const expenseCount = categoryTransactions.filter(t => t.type === 'expense').length
      const incomeCount = categoryTransactions.filter(t => t.type === 'income').length

      csvContent += `\n┌─────────────────────────────────────────────────────────────┐\n`
      csvContent += `│ CATEGORY: ${category.toUpperCase().padEnd(48)} │\n`
      csvContent += `├─────────────────────────────────────────────────────────────┤\n`
      csvContent += `│ Total: ${formatCurrency(Math.abs(total)).padEnd(20)} Type: ${(total >= 0 ? 'Income' : 'Expense').padEnd(15)} │\n`
      csvContent += `│ Transactions: ${categoryTransactions.length.toString().padEnd(10)} Expenses: ${expenseCount.toString().padEnd(5)} Income: ${incomeCount.toString().padEnd(10)} │\n`
      csvContent += `└─────────────────────────────────────────────────────────────┘\n\n`
      csvContent += 'Date,Type,Amount,Description,Account\n'

      categoryTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach((t) => {
          let accountName = 'Unknown'
          if (t.accountType === 'bank') {
            const acc = bankAccounts.find((a) => a.id === t.accountId)
            accountName = acc ? acc.name : 'Unknown'
          } else if (t.accountType === 'creditCard') {
            const card = creditCards.find((c) => c.id === t.accountId)
            accountName = card ? card.name : 'Unknown'
          } else if (t.accountType === 'loan') {
            const loan = loans.find((l) => l.id === t.accountId)
            accountName = loan ? loan.name : 'Unknown'
          }

          csvContent += `"${t.date}","${t.type}","${t.amount}","${t.description || ''}","${accountName}"\n`
        })
      csvContent += '\n'
    })

    csvContent += '\n================================================================\n'
    csvContent += '                    END OF REPORT\n'
    csvContent += '================================================================\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `category_wise_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }


  const exportSummary = () => {
    const now = new Date()
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      )
    })

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalPayments = currentMonthTransactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0)

    const cashInHand = bankAccounts
      .filter((acc) => acc.accountType === 'cash')
      .reduce((sum, acc) => sum + acc.balance, 0)

    const totalBankBalance = bankAccounts
      .filter((acc) => acc.accountType !== 'cash')
      .reduce((sum, acc) => sum + acc.balance, 0)

    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.currentBalance, 0)
    const totalLoanRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
    const netWorth = totalBankBalance + cashInHand - totalCreditCardDebt - totalLoanRemaining

    const summary = `
EXPENSES TRACKER - SUMMARY REPORT
Generated: ${new Date().toLocaleString()}

=== FINANCIAL OVERVIEW ===
Net Worth: ${formatCurrency(netWorth)}
Cash in Hand: ${formatCurrency(cashInHand)}
Bank Balance: ${formatCurrency(totalBankBalance)}
Credit Card Debt: ${formatCurrency(totalCreditCardDebt)}
Loan Remaining: ${formatCurrency(totalLoanRemaining)}

=== CURRENT MONTH (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}) ===
Total Income: ${formatCurrency(totalIncome)}
Total Expenses: ${formatCurrency(totalExpenses)}
Total Payments: ${formatCurrency(totalPayments)}
Net Balance: ${formatCurrency(totalIncome - totalExpenses)}

=== ACCOUNTS ===
Bank Accounts: ${bankAccounts.filter((a) => a.accountType !== 'cash').length}
Cash Accounts: ${bankAccounts.filter((a) => a.accountType === 'cash').length}
Credit Cards: ${creditCards.length}
Loans: ${loans.length}

=== TRANSACTIONS ===
Total Transactions: ${transactions.length}
This Month: ${currentMonthTransactions.length}

=== BUDGETS & SAVINGS ===
Active Budgets: ${budgets.length}
Savings Goals: ${savings.length}
`

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `summary_${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const now = new Date()
    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246)
    doc.text('EXPENSES TRACKER', 105, yPos, { align: 'center' })

    yPos += 10
    doc.setFontSize(14)
    doc.text('Financial Report', 105, yPos, { align: 'center' })

    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${now.toLocaleString()}`, 105, yPos, { align: 'center' })

    yPos += 15
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)

    yPos += 10

    // Financial Overview
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Financial Overview', 20, yPos)
    yPos += 8

    const cashInHand = bankAccounts
      .filter((acc) => acc.accountType === 'cash')
      .reduce((sum, acc) => sum + acc.balance, 0)

    const totalBankBalance = bankAccounts
      .filter((acc) => acc.accountType !== 'cash')
      .reduce((sum, acc) => sum + acc.balance, 0)

    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.currentBalance, 0)
    const totalLoanRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
    const netWorth = totalBankBalance + cashInHand - totalCreditCardDebt - totalLoanRemaining

    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)

    const overviewData = [
      ['Net Worth:', formatCurrency(netWorth)],
      ['Cash in Hand:', formatCurrency(cashInHand)],
      ['Bank Balance:', formatCurrency(totalBankBalance)],
      ['Credit Card Debt:', formatCurrency(totalCreditCardDebt)],
      ['Loan Remaining:', formatCurrency(totalLoanRemaining)],
    ]

    overviewData.forEach(([label, value]) => {
      doc.text(label, 25, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(value, 100, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 6
    })

    yPos += 5

    // Current Month Summary
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        transactionDate.getMonth() === now.getMonth() &&
        transactionDate.getFullYear() === now.getFullYear()
      )
    })

    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalPayments = currentMonthTransactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0)

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`Current Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`, 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)

    const monthData = [
      ['Total Income:', formatCurrency(totalIncome)],
      ['Total Expenses:', formatCurrency(totalExpenses)],
      ['Total Payments:', formatCurrency(totalPayments)],
      ['Net Balance:', formatCurrency(totalIncome - totalExpenses)],
    ]

    monthData.forEach(([label, value]) => {
      doc.text(label, 25, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(value, 100, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 6
    })

    yPos += 5

    // Category Breakdown
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Top Expense Categories', 20, yPos)
    yPos += 8

    const expensesByCategory: { [key: string]: number } = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount
      })

    const topCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)

    topCategories.forEach(([category, amount]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(category, 25, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(formatCurrency(amount), 100, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 6
    })

    yPos += 5

    // Account Summary
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Account Summary', 20, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setTextColor(40, 40, 40)

    const accountData = [
      ['Bank Accounts:', bankAccounts.filter((a) => a.accountType !== 'cash').length.toString()],
      ['Cash Accounts:', bankAccounts.filter((a) => a.accountType === 'cash').length.toString()],
      ['Credit Cards:', creditCards.length.toString()],
      ['Loans:', loans.length.toString()],
      ['Total Transactions:', transactions.length.toString()],
      ['This Month:', currentMonthTransactions.length.toString()],
      ['Active Budgets:', budgets.length.toString()],
      ['Savings Goals:', savings.length.toString()],
    ]

    accountData.forEach(([label, value]) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(label, 25, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(value, 100, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 6
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
      doc.text('Expenses Tracker - Confidential', 105, 285, { align: 'center' })
    }

    // Save PDF
    doc.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="export-manager">
      <div className="export-header">
        <h2>Export Data</h2>
        <p className="export-description">Export your financial data in various formats</p>
      </div>

      <div className="export-options">
        <div className="export-card">
          <div className="export-icon">📊</div>
          <div className="export-content">
            <h3>Export Transactions (CSV)</h3>
            <p>Export all transactions to CSV format for Excel or Google Sheets</p>
            <button onClick={exportToCSV} className="export-button">
              Download CSV
            </button>
          </div>
        </div>

        <div className="export-card">
          <div className="export-icon">📁</div>
          <div className="export-content">
            <h3>Export Category Wise (CSV)</h3>
            <p>Export transactions grouped by category with totals for each category</p>
            <button onClick={exportCategoryWise} className="export-button">
              Download Category Report
            </button>
          </div>
        </div>

        <div className="export-card">
          <div className="export-icon">📄</div>
          <div className="export-content">
            <h3>Export Financial Report (PDF)</h3>
            <p>Generate a professional PDF report with summary statistics and financial overview</p>
            <button onClick={exportToPDF} className="export-button">
              Download PDF Report
            </button>
          </div>
        </div>

        <div className="export-card">
          <div className="export-icon">💾</div>
          <div className="export-content">
            <h3>Export All Data (JSON)</h3>
            <p>Export complete data including accounts, transactions, budgets, and savings</p>
            <button onClick={exportToJSON} className="export-button">
              Download JSON
            </button>
          </div>
        </div>

        <div className="export-card">
          <div className="export-icon">📄</div>
          <div className="export-content">
            <h3>Export Summary Report</h3>
            <p>Export a text summary of your financial overview</p>
            <button onClick={exportSummary} className="export-button">
              Download Summary
            </button>
          </div>
        </div>
      </div>

      <div className="export-stats">
        <h3>Data Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">{transactions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Bank Accounts</span>
            <span className="stat-value">{bankAccounts.filter((a) => a.accountType !== 'cash').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cash Accounts</span>
            <span className="stat-value">{bankAccounts.filter((a) => a.accountType === 'cash').length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Credit Cards</span>
            <span className="stat-value">{creditCards.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Loans</span>
            <span className="stat-value">{loans.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Budgets</span>
            <span className="stat-value">{budgets.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Savings Goals</span>
            <span className="stat-value">{savings.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportManager

