export const formatCurrency = (amount: number): string => {
  const preferences = localStorage.getItem('userPreferences')
  if (preferences) {
    const { currencySymbol } = JSON.parse(preferences)
    return `${currencySymbol}${amount.toFixed(2)}`
  }
  return `₹${amount.toFixed(2)}`
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

