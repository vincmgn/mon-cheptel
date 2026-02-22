export const THEME_COLORS = ['green', 'sky', 'violet', 'orange'] as const
export type ThemeColor = (typeof THEME_COLORS)[number]

// Tailwind v3 hex values used for swatches (color-500)
export const THEME_PREVIEWS: Record<ThemeColor, string> = {
  green: '#22c55e',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  orange: '#f97316',
}

export function useTheme() {
  const appConfig = useAppConfig()
  const colorMode = useColorMode()

  const currentColor = useState<ThemeColor>('themeColor', () => 'green')

  function setColor(color: ThemeColor) {
    currentColor.value = color
    appConfig.ui.colors.primary = color
    if (import.meta.client) {
      localStorage.setItem('themeColor', color)
    }
  }

  function toggleDark() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    currentColor,
    themeColors: THEME_COLORS,
    themePreviews: THEME_PREVIEWS,
    setColor,
    toggleDark,
    isDark: computed(() => colorMode.value === 'dark'),
  }
}
