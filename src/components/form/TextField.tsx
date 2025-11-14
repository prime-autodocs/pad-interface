import React from 'react'
import styles from './TextField.module.css'

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  endSlot?: React.ReactNode
}

export default function TextField({ label, id, endSlot, ...rest }: TextFieldProps) {
  const inputId = id || React.useId()
  const hasEnd = Boolean(endSlot)
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.inputWrap}>
        <input id={inputId} className={[styles.input, hasEnd ? styles.withEnd : ''].join(' ').trim()} {...rest} />
        {hasEnd && <div className={styles.endSlot}>{endSlot}</div>}
      </div>
    </div>
  )
}


