import React from 'react'
import styles from './DashboardPage.module.css'
import SummaryCard from '../components/SummaryCard'
import {
  summaryCards,
  months,
  novosClientesMensal,
  servicosRealizadosMensal,
  quarters,
  novosClientesTrimestral,
  servicosRealizadosTrimestral,
  years,
  novosClientesAnual,
  servicosRealizadosAnual,
  situacaoVistorias,
  situacaoCnh,
  pedidosEmAndamento
} from '../data/mock'
import 'chart.js/auto'
import { ChartOptions } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

type Period = 'mensal' | 'trimestral' | 'anual'

export default function DashboardPage() {
  const [periodNovos, setPeriodNovos] = React.useState<Period>('mensal')
  const [periodServ, setPeriodServ] = React.useState<Period>('mensal')

  function buildBarOptions(period: Period): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#eee' } },
        x: { grid: { display: false }, ticks: period === 'anual' ? { font: { size: 13, weight: 600 } } : {} }
      }
    }
  }
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  }

  function buildBarData(period: Period, monthly: number[], quarterly: number[], annual: number[]) {
    if (period === 'trimestral') {
      return {
        labels: quarters,
        datasets: [{ data: quarterly, backgroundColor: '#08B6C0', maxBarThickness: 36 }]
      }
    }
    if (period === 'anual') {
      return {
        labels: years.map(String),
        datasets: [{ data: annual, backgroundColor: '#08B6C0', maxBarThickness: 48, categoryPercentage: 0.7, barPercentage: 0.7 }]
      }
    }
    return {
      labels: months,
      datasets: [{ data: monthly, backgroundColor: '#08B6C0' }]
    }
  }

  const barOptionsNovos = buildBarOptions(periodNovos)
  const barOptionsServ = buildBarOptions(periodServ)
  const barDataNovos = buildBarData(periodNovos, novosClientesMensal, novosClientesTrimestral, novosClientesAnual)
  const barDataServ = buildBarData(periodServ, servicosRealizadosMensal, servicosRealizadosTrimestral, servicosRealizadosAnual)

  const doughnutData1 = {
    labels: situacaoVistorias.map((s) => s.label),
    datasets: [
      {
        data: situacaoVistorias.map((s) => s.value),
        backgroundColor: ['#0CB1B9', '#E7F6F7'],
        borderWidth: 0
      }
    ]
  }
  const doughnutData2 = {
    labels: situacaoCnh.map((s) => s.label),
    datasets: [
      {
        data: situacaoCnh.map((s) => s.value),
        backgroundColor: ['#0CB1B9', '#10D0C6', '#0A8690'],
        borderWidth: 0
      }
    ]
  }

  const vistColors = ['#0CB1B9', '#E7F6F7']
  const cnhColors = ['#0CB1B9', '#10D0C6', '#0A8690']

  function formatValue(values: number[]): (v: number) => string {
    const total = values.reduce((a, b) => a + b, 0)
    const isPercent = Math.abs(total - 100) < 0.5
    return (v: number) => (isPercent ? `${v}%` : `${v}`)
  }
  const formatVist = formatValue(situacaoVistorias.map((s) => s.value))
  const formatCnh = formatValue(situacaoCnh.map((s) => s.value))

  const totalPedidos = pedidosEmAndamento.length
  const abertos = pedidosEmAndamento.filter((p) => p.status === 'Aberto').length
  const emProgresso = pedidosEmAndamento.filter((p) => p.status === 'Em Progresso').length
  const atrasados = pedidosEmAndamento.filter((p) => p.status === 'Atrasado').length
  const completos = pedidosEmAndamento.filter((p) => p.status === 'Completo').length

  return (
        <>
        <section className={styles.summaries}>
          {summaryCards.map((c) => (
            <SummaryCard
              key={c.id}
              value={c.value}
              label={c.label}
              icon={c.icon}
              accent={c.accent}
              labelColor={c.labelColor}
              numberColor={c.numberColor}
            />
          ))}
        </section>

        <section className={styles.row}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Novos Clientes</h2>
              <div className={styles.segmented}>
                <button className={periodNovos === 'mensal' ? styles.segmentedActive : ''} onClick={() => setPeriodNovos('mensal')}>Mensal</button>
                <button className={periodNovos === 'trimestral' ? styles.segmentedActive : ''} onClick={() => setPeriodNovos('trimestral')}>Trimestral</button>
                <button className={periodNovos === 'anual' ? styles.segmentedActive : ''} onClick={() => setPeriodNovos('anual')}>Anual</button>
              </div>
            </div>
            <div className={styles.chartBar}>
              <Bar options={barOptionsNovos} data={barDataNovos} />
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Serviços Realizados</h2>
              <div className={styles.segmented}>
                <button className={periodServ === 'mensal' ? styles.segmentedActive : ''} onClick={() => setPeriodServ('mensal')}>Mensal</button>
                <button className={periodServ === 'trimestral' ? styles.segmentedActive : ''} onClick={() => setPeriodServ('trimestral')}>Trimestral</button>
                <button className={periodServ === 'anual' ? styles.segmentedActive : ''} onClick={() => setPeriodServ('anual')}>Anual</button>
              </div>
            </div>
            <div className={styles.chartBar}>
              <Bar options={barOptionsServ} data={barDataServ} />
            </div>
          </div>
        </section>

        <section className={styles.row}>
          <div className={styles.panel}>
            <h2>Situação das Vistorias</h2>
            <div className={styles.chartDonut}>
              <Doughnut data={doughnutData1} options={doughnutOptions} />
            </div>
            <ul className={styles.legend}>
              {situacaoVistorias.map((s, idx) => (
                <li key={s.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: vistColors[idx] }} />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendValue}>{formatVist(s.value)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <h2>Situação das CNH</h2>
            <div className={styles.chartDonut}>
              <Doughnut data={doughnutData2} options={doughnutOptions} />
            </div>
            <ul className={styles.legend}>
              {situacaoCnh.map((s, idx) => (
                <li key={s.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: cnhColors[idx] }} />
                  <span className={styles.legendLabel}>{s.label}</span>
                  <span className={styles.legendValue}>{formatCnh(s.value)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <h2>Pedidos em Andamento</h2>
            <div className={styles.ordersHeader}>
              <div className={styles.ordersMetrics}>
                <div>
                  <span className={styles.metricValue}>{totalPedidos}</span>
                  <span className={styles.metricLabel}>Pedidos Totais</span>
                </div>
                <div>
                  <span className={styles.metricValue}>{abertos}</span>
                  <span className={styles.metricLabel}>Abertos</span>
                </div>
                <div>
                  <span className={styles.metricValue}>{emProgresso}</span>
                  <span className={styles.metricLabel}>Em Progresso</span>
                </div>
                <div>
                  <span className={styles.metricValueDanger}>{atrasados}</span>
                  <span className={styles.metricLabel}>Atrasados</span>
                </div>
                <div>
                  <span className={styles.metricValue}>{completos}</span>
                  <span className={styles.metricLabel}>Completos</span>
                </div>
              </div>
            </div>
            <ul className={styles.ordersList}>
              {pedidosEmAndamento.map((p) => (
                <li key={p.id} className={styles.orderItem}>
                  <div className={styles.orderLegend}>
                    <span className={`${styles.dot} ${p.status === 'Atrasado' ? styles.danger : styles.progress}`} />
                    <span className={styles.orderTitle}>{p.titulo}</span>
                    <span className={styles.orderClient}>{p.cliente}</span>
                  </div>
                  <span className={`${styles.chip} ${p.status === 'Atrasado' ? styles.chipDanger : styles.chipProgress}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
        </>
  )
}


