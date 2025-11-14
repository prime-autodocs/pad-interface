import React from 'react'
import styles from './Button.module.css'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

export default function Button({ children, fullWidth = false, className, ...rest }: ButtonProps) {
  const classes = [styles.button, fullWidth ? styles.fullWidth : '', className || ''].join(' ').trim()
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}


