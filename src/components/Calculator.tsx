import { useState } from 'react'
import './Calculator.css'

const Calculator = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [newNumber, setNewNumber] = useState(true)

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num)
      setNewNumber(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.')
      setNewNumber(false)
    } else if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  const handleOperation = (op: string) => {
    const current = parseFloat(display)
    
    if (previousValue === null) {
      setPreviousValue(display)
    } else if (operation) {
      const prev = parseFloat(previousValue)
      let result = 0
      
      switch (operation) {
        case '+':
          result = prev + current
          break
        case '-':
          result = prev - current
          break
        case '×':
          result = prev * current
          break
        case '÷':
          result = current !== 0 ? prev / current : 0
          break
      }
      
      setPreviousValue(result.toString())
      setDisplay(result.toString())
    }
    
    setOperation(op)
    setNewNumber(true)
  }

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const prev = parseFloat(previousValue)
      const current = parseFloat(display)
      let result = 0
      
      switch (operation) {
        case '+':
          result = prev + current
          break
        case '-':
          result = prev - current
          break
        case '×':
          result = prev * current
          break
        case '÷':
          result = current !== 0 ? prev / current : 0
          break
      }
      
      setDisplay(result.toString())
      setPreviousValue(null)
      setOperation(null)
      setNewNumber(true)
    }
  }

  const handleClear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setNewNumber(true)
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay('0')
      setNewNumber(true)
    }
  }

  return (
    <div className="calculator-widget">
      <div className="calculator-header">
        <span className="calculator-icon">🧮</span>
        <h3>Calculator</h3>
      </div>
      
      <div className="calculator-display">{display}</div>
      
      <div className="calculator-buttons">
        <button onClick={handleClear} className="btn btn-function">C</button>
        <button onClick={handleBackspace} className="btn btn-function">⌫</button>
        <button onClick={() => handleOperation('÷')} className="btn btn-operation">÷</button>
        <button onClick={() => handleOperation('×')} className="btn btn-operation">×</button>
        
        <button onClick={() => handleNumber('7')} className="btn btn-number">7</button>
        <button onClick={() => handleNumber('8')} className="btn btn-number">8</button>
        <button onClick={() => handleNumber('9')} className="btn btn-number">9</button>
        <button onClick={() => handleOperation('-')} className="btn btn-operation">−</button>
        
        <button onClick={() => handleNumber('4')} className="btn btn-number">4</button>
        <button onClick={() => handleNumber('5')} className="btn btn-number">5</button>
        <button onClick={() => handleNumber('6')} className="btn btn-number">6</button>
        <button onClick={() => handleOperation('+')} className="btn btn-operation">+</button>
        
        <button onClick={() => handleNumber('1')} className="btn btn-number">1</button>
        <button onClick={() => handleNumber('2')} className="btn btn-number">2</button>
        <button onClick={() => handleNumber('3')} className="btn btn-number">3</button>
        <button onClick={handleEquals} className="btn btn-equals" style={{gridRow: 'span 2'}}>&#61;</button>
        
        <button onClick={() => handleNumber('0')} className="btn btn-number" style={{gridColumn: 'span 2'}}>0</button>
        <button onClick={handleDecimal} className="btn btn-number">.</button>
      </div>
    </div>
  )
}

export default Calculator
