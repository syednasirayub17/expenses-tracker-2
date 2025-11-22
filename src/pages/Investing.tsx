import React, { useEffect, useState } from 'react'
import StocksManager from '../components/StocksManager'
import SIPManager from '../components/SIPManager'
import './Investing.css'
import api from '../services/api'

const Investing: React.FC = () => {
  const [stocks, setStocks] = useState<any[]>([])
  const [sips, setSips] = useState<any[]>([])

  const load = async () => {
    try {
      const s = await api.investmentApi.stocks.list()
      const si = await api.investmentApi.sips.list()
      setStocks(s)
      setSips(si)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="investing-page">
      <h2>Investing</h2>
      <div className="investing-sections">
        <section>
          <h3>Stocks</h3>
          <StocksManager stocks={stocks} refresh={load} />
        </section>
        <section>
          <h3>SIPs</h3>
          <SIPManager sips={sips} refresh={load} />
        </section>
      </div>
    </div>
  )
}

export default Investing
