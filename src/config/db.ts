import { Seal } from '../classes/Seal'
import { SealEvent } from '../classes/SealEvent'
import { DataSource } from 'typeorm'
import logger from './logger'

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

export const init = () => {
  AppDataSource.initialize()
    .then(() => {
      logger.info('Database connection established')
    })
    .catch((e) => logger.error('Database connection failed', e))
} 