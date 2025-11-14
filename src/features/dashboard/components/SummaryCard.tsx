import React from 'react'
import styles from './SummaryCard.module.css'

type Props = {
  value: number
  label: string
  icon: string
  accent?: string
  numberColor?: string
  labelColor?: string
}

export default function SummaryCard({ value, label, icon, accent = '#08B6C0', numberColor, labelColor }: Props) {
  const styleVars = {
    // @ts-ignore custom CSS variables
    '--summary-accent': accent,
    '--summary-number': numberColor || '#0f1115',
    '--summary-label': labelColor || '#0a9fa9'
  } as React.CSSProperties
  return (
    <div className={styles.card} style={styleVars}>
      <div className={styles.left}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
      </div>
      <div className={styles.iconWrap}>
        <img src={icon} alt="" className={styles.icon} />
      </div>
    </div>
  )
}


