import { useState, useMemo } from 'react'
import { useAccount } from '../context/AccountContext'
import { formatCurrency } from '../utils/currency'
import { Transaction } from '../types'
import jsPDF from 'jspdf'
import './CategoryReport.css'

type DateRange = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
type SortBy = 'amount' | 'count' | 'name'

interface CategoryData {
  category: string
  transactions: Transaction[]
  totalExpense: number
  totalIncome: number
  netAmount: number
  count: number
}

const CategoryReport = () => {
  const { transactions, bankAccounts, creditCards, loans } = useAccount()
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('amount')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter transactions by date range
  const getFilteredByDate = () => {
    const now = new Date()
    let filtered = transactions

    switch (dateRange) {
      case 'today':
        filtered = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate.toDateString() === now.toDateString()
        })
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = transactions.filter(t => new Date(t.date) >= weekAgo)
        break
      case 'month':
        filtered = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
        })
        break
      case 'year':
        filtered = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate.getFullYear() === now.getFullYear()
        })
        break
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          filtered = transactions.filter(t => {
            const tDate = new Date(t.date)
            return tDate >= start && tDate <= end
          })
        }
        break
      default:
        filtered = transactions
    }

    return filtered
  }

  // Group transactions by category
  const categoryData: CategoryData[] = useMemo(() => {
    const filtered = getFilteredByDate()
    const categoryMap: { [key: string]: Transaction[] } = {}

    filtered.forEach(t => {
      if (t.type === 'expense' || t.type === 'income') {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = []
        }
        categoryMap[t.category].push(t)
      }
    })

    const data = Object.entries(categoryMap).map(([category, txns]) => {
      const totalExpense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      const totalIncome = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      
      return {
        category,
        transactions: txns,
        totalExpense,
        totalIncome,
        netAmount: totalIncome - totalExpense,
        count: txns.length
      }
    })

    // Filter by search term
    const searchFiltered = searchTerm
      ? data.filter(d => d.category.toLowerCase().includes(searchTerm.toLowerCase()))
      : data

    // Sort
    const sorted = [...searchFiltered].sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return Math.abs(b.netAmount) - Math.abs(a.netAmount)
        case 'count':
          return b.count - a.count
        case 'name':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return sorted
  }, [transactions, dateRange, startDate, endDate, sortBy, searchTerm])

  // Get account name helper
  const getAccountName = (t: Transaction): string => {
    if (t.accountType === 'bank') {
      const acc = bankAccounts.find(a => a.id === t.accountId)
      return acc ? acc.name : 'Unknown Bank'
    } else if (t.accountType === 'creditCard') {
      const card = creditCards.find(c => c.id === t.accountId)
      return card ? card.name : 'Unknown Card'
    } else if (t.accountType === 'loan') {
      const loan = loans.find(l => l.id === t.accountId)
      return loan ? loan.name : 'Unknown Loan'
    }
    return 'Unknown'
  }

  // Export to CSV
  const exportToCSV = () => {
    let csvContent = '╔════════════════════════════════════════════════════════════════╗\n'
    csvContent += '║          EXPENSES TRACKER - CATEGORY WISE REPORT              ║\n'
    csvContent += '╚════════════════════════════════════════════════════════════════╝\n\n'
    csvContent += `Generated: ${new Date().toLocaleString()}\n`
    csvContent += `Date Range: ${dateRange.toUpperCase()}\n`
    csvContent += `Total Categories: ${categoryData.length}\n\n`
    csvContent += '================================================================\n\n'

    categoryData.forEach(({ category, transactions, totalExpense, totalIncome, netAmount, count }) => {
      csvContent += `\n┌─────────────────────────────────────────────────────────────┐\n`
      csvContent += `│ CATEGORY: ${category.toUpperCase().padEnd(48)} │\n`
      csvContent += `├─────────────────────────────────────────────────────────────┤\n`
      csvContent += `│ Total Expense: ${formatCurrency(totalExpense).padEnd(35)} │\n`
      csvContent += `│ Total Income:  ${formatCurrency(totalIncome).padEnd(35)} │\n`
      csvContent += `│ Net Amount:    ${formatCurrency(netAmount).padEnd(35)} │\n`
      csvContent += `│ Transactions:  ${count.toString().padEnd(35)} │\n`
      csvContent += `└─────────────────────────────────────────────────────────────┘\n\n`
      csvContent += 'Date,Type,Amount,Description,Account\n'

      transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .forEach(t => {
          csvContent += `"${t.date}","${t.type}","${t.amount}","${t.description || ''}","${getAccountName(t)}"\n`
        })
      csvContent += '\n'
    })

    csvContent += '\n================================================================\n'
    csvContent += '                    END OF REPORT\n'
    csvContent += '================================================================\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `category_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246)
    doc.text('CATEGORY-WISE REPORT', 105, yPos, { align: 'center' })

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' })
    doc.text(`Date Range: ${dateRange.toUpperCase()}`, 105, yPos + 5, { align: 'center' })

    yPos += 15
    doc.setDrawColor(59, 130, 246)
    doc.line(20, yPos, 190, yPos)
    yPos += 10

    categoryData.forEach(({ category, totalExpense, totalIncome, netAmount, count }) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(category.toUpperCase(), 20, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text(`Total Expense: ${formatCurrency(totalExpense)}`, 25, yPos)
      yPos += 5
      doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 25, yPos)
      yPos += 5
      doc.text(`Net Amount: ${formatCurrency(netAmount)}`, 25, yPos)
      yPos += 5
      doc.text(`Transactions: ${count}`, 25, yPos)
      yPos += 10
    })

    doc.save(`category_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const totalExpenses = categoryData.reduce((sum, c) => sum + c.totalExpense, 0)
  const totalIncome = categoryData.reduce((sum, c) => sum + c.totalIncome, 0)

  return (
    <div className="category-report">
      <div className="category-report-header">
        <div className="header-top">
          <h2>📊 Category-Wise Report</h2>
          <div className="export-buttons">
            <button onClick={exportToCSV} className="btn-export csv">
              📄 Export CSV
            </button>
            <button onClick={exportToPDF} className="btn-export pdf">
              📑 Export PDF
            </button>
          </div>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range-buttons">
              {(['all', 'today', 'week', 'month', 'year', 'custom'] as DateRange[]).map(range => (
                <button
                  key={range}
                  className={`range-btn ${dateRange === range ? 'active' : ''}`}
                  onClick={() => setDateRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {dateRange === 'custom' && (
            <div className="custom-date-range">
              <div className="date-input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="sort-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}>
                <option value="amount">Amount</option>
                <option value="count">Transaction Count</option>
                <option value="name">Category Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <p className="stat-label">Total Expenses</p>
            <p className="stat-value">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <p className="stat-label">Total Income</p>
            <p className="stat-value">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="stat-card net">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <p className="stat-label">Net Amount</p>
            <p className={`stat-value ${totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
        <div className="stat-card categories">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <p className="stat-label">Categories</p>
            <p className="stat-value">{categoryData.length}</p>
          </div>
        </div>
      </div>

      <div className="categories-list">
        {categoryData.length === 0 ? (
          <div className="no-data">
            <p>📭 No transactions found for the selected period</p>
          </div>
        ) : (
          categoryData.map(cat => (
            <div key={cat.category} className="category-card">
              <div
                className="category-header"
                onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
              >
                <div className="category-title">
                  <h3>{cat.category}</h3>
                  <span className="transaction-count">{cat.count} transactions</span>
                </div>
                <div className="category-amounts">
                  <div className="amount-item expense">
                    <span className="label">Expense:</span>
                    <span className="value">{formatCurrency(cat.totalExpense)}</span>
                  </div>
                  <div className="amount-item income">
                    <span className="label">Income:</span>
                    <span className="value">{formatCurrency(cat.totalIncome)}</span>
                  </div>
                  <div className={`amount-item net ${cat.netAmount >= 0 ? 'positive' : 'negative'}`}>
                    <span className="label">Net:</span>
                    <span className="value">{formatCurrency(cat.netAmount)}</span>
                  </div>
                </div>
                <div className="expand-icon">
                  {selectedCategory === cat.category ? '▼' : '▶'}
                </div>
              </div>

              {selectedCategory === cat.category && (
                <div className="category-transactions">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Account</th>
                        <th>Type</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(t => (
                          <tr key={t.id}>
                            <td>{new Date(t.date).toLocaleDateString()}</td>
                            <td>{t.description || '-'}</td>
                            <td>{getAccountName(t)}</td>
                            <td>
                              <span className={`type-badge ${t.type}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className={t.type === 'expense' ? 'expense-amount' : 'income-amount'}>
                              {formatCurrency(t.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CategoryReport
