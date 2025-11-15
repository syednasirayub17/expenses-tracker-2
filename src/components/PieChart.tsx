import { formatCurrency } from '../utils/currency'
import './PieChart.css'

interface PieChartData {
  category: string
  amount: number
}

interface PieChartProps {
  data: PieChartData[]
}

const PieChart = ({ data }: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  
  if (total === 0) {
    return <p className="no-data">No data to display</p>
  }

  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#330867',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8'
  ]

  let currentAngle = -90 // Start from top
  const segments = data.map((item, index) => {
    const percentage = (item.amount / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    // Calculate path for pie slice
    const largeArcFlag = angle > 180 ? 1 : 0
    const x1 = 100 + 90 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 100 + 90 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 100 + 90 * Math.cos((endAngle * Math.PI) / 180)
    const y2 = 100 + 90 * Math.sin((endAngle * Math.PI) / 180)

    const pathData = [
      `M 100 100`,
      `L ${x1} ${y1}`,
      `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ')

    return {
      ...item,
      percentage,
      pathData,
      color: colors[index % colors.length],
      startAngle,
      endAngle,
    }
  })

  return (
    <div className="pie-chart-container">
      <svg viewBox="0 0 200 200" className="pie-chart">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathData}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="2"
            className="pie-segment"
            style={{ opacity: 0.9 }}
          />
        ))}
      </svg>
      <div className="pie-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: segment.color }} />
            <div className="legend-content">
              <span className="legend-label">{segment.category}</span>
              <span className="legend-value">{formatCurrency(segment.amount)}</span>
              <span className="legend-percentage">({segment.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart

