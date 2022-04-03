import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import * as OpenApiValidator from 'express-openapi-validator'
import path from 'path'
import logger from './lib/logger'

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Seal } from './classes/Seal'
import { SealEvent } from './classes/SealEvent'
import { validateOwnershipToken, validateRevelationToken } from './lib/auth'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: [Seal, SealEvent],
  synchronize: true,
  logging: false,
})

export const sealRepository = AppDataSource.getRepository(Seal)
export const sealEventRepository = AppDataSource.getRepository(SealEvent)

AppDataSource.initialize()
  .then(() => {
    logger.info('Database connection established')
  })
  .catch((error) => console.log(error))

dotenv.config({ path: __dirname + '/.env' })

const app = express()
const PORT: number = 8080

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`)
  next()
})

// express-openapi-validator unfortunately parses the parameters after running the validateSecurity handlers.
// This is why we extract the seal id first separately.

app.use('/api/v1/seals/:id', (req: any, res, next) => {
  req.id = req.params.id
  next()
})

app.use(
  OpenApiValidator.middleware({
    apiSpec: './src/openapi.yaml',
    validateRequests: true,
    validateResponses: true,
    operationHandlers: path.join(__dirname),
    validateSecurity: {
      handlers: {
        OwnershipTokenAuth(req, scopes) {
          return validateOwnershipToken(req)
        },
        RevelationTokenAuth(req, scopes) {
          return validateRevelationToken(req)
        },
      },
    },
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
