import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import eslintConfigPrettier from 'eslint-config-prettier'

export default createConfigForNuxt({
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
}).append(eslintConfigPrettier)
