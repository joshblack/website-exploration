import React from 'react'
import classes from './Header.module.css'

export interface HeaderProps {}

export function Header(_props: HeaderProps) {
  return <header className={classes.header}>header</header>
}
