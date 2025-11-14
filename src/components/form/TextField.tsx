import React from 'react'
import styles from './TextField.module.css'

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export default function TextField({ label, id, ...rest }: TextFieldProps) {
  const inputId = id || React.useId()
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <input id={inputId} className={styles.input} {...rest} />
    </div>
  )
}


