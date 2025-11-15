export const formatCurrency = (amount: number): string => {
  const preferences = localStorage.getItem('userPreferences')
  if (preferences) {
    const { currencySymbol } = JSON.parse(preferences)
    return `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `₹${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatCurrencyWithoutSymbol = (amount: number): string => {
  return amount.toFixed(2)
}

export const getCurrencySymbol = (): string => {
  const preferences = localStorage.getItem('userPreferences')
  if (preferences) {
    const { currencySymbol } = JSON.parse(preferences)
    return currencySymbol
  }
  return '₹'
}

