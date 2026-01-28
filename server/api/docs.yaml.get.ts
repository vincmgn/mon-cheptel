import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineEventHandler(() => {
  const specPath = path.join(__dirname, '../../openapi.yaml')
  const spec = fs.readFileSync(specPath, 'utf-8')
  return spec
})
