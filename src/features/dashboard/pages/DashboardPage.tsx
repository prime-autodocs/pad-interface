import React from 'react'
import styles from './DashboardPage.module.css'
import SummaryCard from '../components/SummaryCard'
import {
  months,
  servicosRealizadosMensal,
  quarters,
  servicosRealizadosTrimestral,
  years,
  servicosRealizadosAnual,
  situacaoVistorias,
  situacaoCnh,
  pedidosEmAndamento
} from '../data/mock'
import 'chart.js/auto'
import { ChartOptions } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { fetchCardsSummary, fetchNewCustomers, type NewCustomersPeriod } from '@services/dashboard/apiDashboard'
import { useFeatureFlags } from '@app/context/FeatureFlagsContext'
import { fetchFeatureFlags } from '@services/featureFlags'

type Period = 'mensal' | 'trimestral' | 'anual'

export default function DashboardPage() {
  const { flags, setFlags } = useFeatureFlags()
  const [periodNovos, setPeriodNovos] = React.useState<Period>('mensal')
  const [periodServ, setPeriodServ] = React.useState<Period>('mensal')
  const cardsMeta = React.useMemo(() => ([
    { id: 'clientes', label: 'CLIENTES CADASTRADOS', icon: '/src/assets/icons/users.png', accent: '#111214', numberColor: '#111214', labelColor: '#111214' },
    { id: 'veiculos', label: 'VEÍCULOS CADASTRADOS', icon: '/src/assets/icons/car.png', accent: '#0a9fa9', numberColor: '#0a9fa9', labelColor: '#0a9fa9' },
    { id: 'novos_clientes', label: 'NOVOS CLIENTES', icon: '/src/assets/icons/new-clients.png', accent: '#14e0d4', numberColor: '#14e0d4', labelColor: '#14e0d4' },
    { id: 'servicos', label: 'SERVIÇOS REALIZADOS', icon: '/src/assets/icons/services.png', accent: '#0a9fa9', numberColor: '#0a9fa9', labelColor: '#0a9fa9' }
  ]), [])
  const [values, setValues] = React.useState<Record<string, number | string | undefined>>({})
  const [loadingCards, setLoadingCards] = React.useState(true)
  const hasFetched = React.useRef(false)
  const [novosLabels, setNovosLabels] = React.useState<string[]>([])
  const [novosValues, setNovosValues] = React.useState<number[]>([])
  const [loadingNovos, setLoadingNovos] = React.useState(true)
  const fetchedNovosFor = React.useRef<Period | null>(null)

  React.useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    ;(async () => {
      try {
        // Fetch feature flags on dashboard entry
        try {
          const f = await fetchFeatureFlags()
          setFlags(f)
        } catch {
          // ignore; keep existing flags
        }
        setLoadingCards(true)
        const resp = await fetchCardsSummary()
        setValues({
          clientes: Number(resp.total_customers ?? 0),
          veiculos: Number(resp.total_vehicles ?? 0),
          novos_clientes: Number(resp.new_customers_current_month ?? 0),
          servicos: Number(resp.services_current_month ?? 0)
        })
        setLoadingCards(false)
      } catch {
        // exibe N/A em caso de erro
        setValues({
          clientes: 'N/A',
          veiculos: 'N/A',
          novos_clientes: 'N/A',
          servicos: 'N/A'
        })
        setLoadingCards(false)
      }
    })()
  }, [])

  React.useEffect(() => {
    // In dev with React.StrictMode, effects run twice on mount. Avoid duplicate fetch for same period.
    if (fetchedNovosFor.current === periodNovos) return
    fetchedNovosFor.current = periodNovos
    function map(p: Period): NewCustomersPeriod {
      if (p === 'mensal') return 'monthly'
      if (p === 'trimestral') return 'quarter'
      return 'annual'
    }
    ;(async () => {
      try {
        setLoadingNovos(true)
        const resp = await fetchNewCustomers(map(periodNovos))
        setNovosLabels(resp.points.map((pt) => pt.label))
        setNovosValues(resp.points.map((pt) => pt.value))
        setLoadingNovos(false)
      } catch {
        setNovosLabels([])
        setNovosValues([])
        setLoadingNovos(false)
      }
    })()
  }, [periodNovos])

  const isSmallScreen = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches

  function buildBarOptions(period: Period): ChartOptions<'bar'> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#eee' } },
        x: {
          grid: { display: false },
          ticks:
            period === 'mensal'
              ? {
                  autoSkip: true,
                  maxTicksLimit: isSmallScreen ? 6 : 12,
                  maxRotation: 0,
                  minRotation: 0,
                  font: { size: isSmallScreen ? 10 : 12, weight: 600 }
                }
              : period === 'anual'
              ? { maxRotation: 0, minRotation: 0, font: { size: 13, weight: 600 } }
              : { maxRotation: 0, minRotation: 0 }
        }
      }
    }
  }
  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    layout: { padding: 0 },
    cutout: '32%', // thicker donut
    elements: { arc: { borderWidth: 0 } } // remove gaps between slices
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
  const barDataNovos = {
    labels: novosLabels,
    datasets: [
      {
        data: novosValues,
        backgroundColor: '#08B6C0',
        maxBarThickness: isSmallScreen ? 18 : 28,
        categoryPercentage: isSmallScreen ? 0.7 : 0.8,
        barPercentage: isSmallScreen ? 0.7 : 0.8
      }
    ]
  }
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
          {cardsMeta
            .filter((c) => {
              // Helper: allow both dashed and snake_case keys
              const isOn = (...keys: string[]) => {
                const presentKeys = keys.filter((k) => k in flags)
                if (presentKeys.length === 0) return true
                return presentKeys.some((k) => flags[k] !== false)
              }
              if (c.id === 'clientes') return isOn('clientes_cadastrados', 'clientes-cadastrados')
              if (c.id === 'veiculos') return isOn('veiculos_cadastrados', 'veiculos-cadastrados')
              if (c.id === 'novos_clientes') return isOn('novos_clientes_resumo', 'novos-clientes-resumo')
              if (c.id === 'servicos') return isOn('servicos_realizados_resumo', 'servicos-realizados_resumo', 'servicos-realizados-resumo')
              return true
            })
            .map((c) => (
            <SummaryCard
              key={c.id}
              value={values[c.id] ?? 0}
              label={c.label}
              icon={c.icon}
              accent={c.accent}
              labelColor={c.labelColor}
              numberColor={c.numberColor}
              loading={loadingCards}
            />
          ))}
        </section>

        <section className={styles.row}>
          {(() => {
            const present = 'grafico_novos_clientes' in flags || 'grafico-novos-clientes' in flags
            const enabled =
              (flags['grafico_novos_clientes'] !== false) &&
              (flags['grafico-novos-clientes'] !== false)
            return present ? enabled : true
          })() && (
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
              {loadingNovos ? (
                <div className={styles.centerChart}>
                  <span className={styles.chartSpinner} />
                </div>
              ) : novosValues.length > 0 ? (
                <Bar options={barOptionsNovos} data={barDataNovos} />
              ) : (
                <div className={styles.centerChart}>
                  <span className={styles.emptyText}>Sem dados</span>
                </div>
              )}
            </div>
          </div>
          )}
          {(() => {
            const present = 'grafico_servicos_realizados' in flags || 'grafico-servicos-realizados' in flags
            const enabled =
              (flags['grafico_servicos_realizados'] !== false) &&
              (flags['grafico-servicos-realizados'] !== false)
            return present ? enabled : true
          })() && (
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
          )}
        </section>

        <section className={styles.row}>
          {(() => {
            const present = 'grafico_situacao_vistorias' in flags || 'grafico-situacao-vistorias' in flags
            const enabled =
              (flags['grafico_situacao_vistorias'] !== false) &&
              (flags['grafico-situacao-vistorias'] !== false)
            return present ? enabled : true
          })() && (
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
          )}
          {(() => {
            const present = 'grafico_situacao_cnh' in flags || 'grafico-situacao-cnh' in flags
            const enabled =
              (flags['grafico_situacao_cnh'] !== false) &&
              (flags['grafico-situacao-cnh'] !== false)
            return present ? enabled : true
          })() && (
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
          )}
          {(() => {
            const present = 'painel_pedidos_em_andamento' in flags || 'painel-pedidos-em-andamento' in flags
            const enabled =
              (flags['painel_pedidos_em_andamento'] !== false) &&
              (flags['painel-pedidos-em-andamento'] !== false)
            return present ? enabled : true
          })() && (
          <div className={styles.panel}>
            <h2>Pedidos em Andamento</h2>
            <div className={styles.ordersHeader}>
              <div className={styles.ordersMetrics}>
                <div>
                  <span className={styles.metricValue}>{totalPedidos}</span>
                  <span className={styles.metricLabel}>Pedidos Totais</span>
                </div>
                <div>
                  <span className={`${styles.metricValue} ${styles.metricValueOpen}`}>{abertos}</span>
                  <span className={`${styles.metricLabel} ${styles.metricLabelOpen}`}>Abertos</span>
                </div>
                <div>
                  <span className={`${styles.metricValue} ${styles.metricValueInProgress}`}>{emProgresso}</span>
                  <span className={`${styles.metricLabel} ${styles.metricLabelInProgress}`}>Em Progresso</span>
                </div>
                <div>
                  <span className={styles.metricValueDanger}>{atrasados}</span>
                  <span className={`${styles.metricLabel} ${styles.metricLabelDanger}`}>Atrasados</span>
                </div>
                <div>
                  <span className={`${styles.metricValue} ${styles.metricValueComplete}`}>{completos}</span>
                  <span className={`${styles.metricLabel} ${styles.metricLabelComplete}`}>Completos</span>
                </div>
              </div>
            </div>
            <ul className={styles.ordersList}>
              {pedidosEmAndamento.map((p) => {
                const dotClass =
                  p.status === 'Atrasado' ? styles.danger :
                  p.status === 'Em Progresso' ? styles.inProgress :
                  p.status === 'Aberto' ? styles.open :
                  p.status === 'Completo' ? styles.complete :
                  styles.progress
                const chipClass =
                  p.status === 'Atrasado' ? styles.chipDanger :
                  p.status === 'Em Progresso' ? styles.chipInProgress :
                  p.status === 'Aberto' ? styles.chipOpen :
                  p.status === 'Completo' ? styles.chipComplete :
                  styles.chipProgress
                return (
                <li key={p.id} className={styles.orderItem}>
                  <div className={styles.orderLegend}>
                    <span className={`${styles.dot} ${dotClass}`} />
                    <span className={styles.orderTitle}>{p.titulo}</span>
                    <span className={styles.orderClient}>{p.cliente}</span>
                  </div>
                  <span className={`${styles.chip} ${chipClass}`}>
                    {p.status}
                  </span>
                </li>
                )
              })}
            </ul>
          </div>
          )}
        </section>
        </>
  )
}


