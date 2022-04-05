import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as OpenApiValidator from 'express-openapi-validator'
import path from 'path'
import logger from './config/logger'
import * as db from './config/db'
import 'reflect-metadata'

dotenv.config({ path: __dirname + '/.env' })
db.init()

const app = express()
const PORT: number = 8080

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

app.use(
  OpenApiValidator.middleware({
    apiSpec: './src/openapi.yaml',
    validateRequests: true,
    validateResponses: true,
    operationHandlers: path.join(__dirname),
  })
)

app.use((err, req, res, next) => {
  logger.error(err.message)
  if (err.status && err.status < 499) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    })
  } else {
    res.status(500).json({
      message: 'Internal Server Error',
    })
  }
})

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export { app }
