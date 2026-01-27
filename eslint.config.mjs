// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  rules: {
    // Autoriser console.log en dev
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
})
