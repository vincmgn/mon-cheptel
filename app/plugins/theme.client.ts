import { THEME_COLORS, type ThemeColor } from '~/composables/useTheme'

export default defineNuxtPlugin(() => {
  const appConfig = useAppConfig()
  const themeColor = useState<ThemeColor>('themeColor')

  const saved = localStorage.getItem('themeColor') as ThemeColor | null
  if (saved && THEME_COLORS.includes(saved)) {
    themeColor.value = saved
    appConfig.ui.colors.primary = saved
  }
})
