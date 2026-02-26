import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return { theme, setTheme }
}
