import { validateOwnershipToken, validateRevelation } from '../middlewares/auth'
import { Seal, Status } from '../classes/Seal'
import { SealEvent, SealEventName } from '../classes/SealEvent'
import {
  AppDataSource,
  sealEventRepository,
  sealRepository,
} from '../config/db'
import { NotFoundError } from '../classes/Error'
import validateSealRequest from '../middlewares/validation'

module.exports = {
  getSeal: [
    validateOwnershipToken,
    async (req, res, next) => {
      const { id } = req.params
      try {
        let seal = await sealRepository.findOneByOrFail({ id })
        if (!seal) {
          throw new NotFoundError()
        }
        res.json(seal)
      } catch (e) {
        next(e)
      }
    },
  ],

  createSeal: [
    validateSealRequest,
    async (req, res, next) => {
      const { not_before, expires_at, revelation_token_max_use } = req.body
      const seal = new Seal({
        not_before,
        expires_at,
        revelation_token_max_use,
      })
      const sealEvent = new SealEvent(SealEventName.CREATE, seal.id)
      try {
        await AppDataSource.transaction(async (tx) => {
          await tx.withRepository(sealRepository).save(seal)
          await tx.withRepository(sealEventRepository).save(sealEvent)
        })
        res.status(201).json(seal)
      } catch (e) {
        next(e)
      }
    },
  ],

  deleteSeal: [
    validateOwnershipToken,
    async (req, res, next) => {
      const { id } = req.params
      const sealEvent = new SealEvent(SealEventName.DELETE, id)
      try {
        const seal = await sealRepository.findOneBy({ id })
        if (!seal) {
          throw new NotFoundError()
        }
        AppDataSource.transaction(async (tx) => {
          await tx.withRepository(sealRepository).delete
          await tx.withRepository(sealEventRepository).save(sealEvent)
        })
        res.status(204).send()
      } catch (e) {
        next(e)
      }
    },
  ],

  updateSeal: [
    validateOwnershipToken,
    async (req, res, next) => {
      const { id } = req.params
      const sealEvent = new SealEvent(SealEventName.REVOKE, id)
      try {
        const seal = await sealRepository.findOneBy({ id })
        if (!seal) {
          throw new NotFoundError()
        }
        seal.status = Status.REVOKED
        AppDataSource.transaction(async (tx) => {
          await tx.withRepository(sealRepository).save(seal)
          await tx.withRepository(sealEventRepository).save(sealEvent)
        })
        res.status(200).json(seal)
      } catch (e) {
        next(e)
      }
    },
  ],

  revealSeal: [
    validateRevelation,
    async (req, res, next) => {
      const { id } = req.params
      const sealEvent = new SealEvent(SealEventName.REVEAL, id)
      try {
        const seal = await sealRepository.findOneBy({ id })
        if (!seal) {
          throw new NotFoundError()
        }
        seal.status = Status.REVEALED
        AppDataSource.transaction(async (tx) => {
          await tx.withRepository(sealRepository).save(seal)
          await tx.withRepository(sealEventRepository).save(sealEvent)
        })
        const { key, salt } = seal
        const partialSeal = { id, key, salt }
        res.status(200).json(partialSeal)
      } catch (e) {
        next(e)
      }
    },
  ],

  getSealEvents: [
    validateOwnershipToken,
    async (req, res, next) => {
      const { id } = req.params
      try {
        const sealEvents = await sealEventRepository.find({
          select: ['timestamp', 'eventName'],
          where: { sealId: id },
        })
        res.status(200).json(
          sealEvents.map((e) => {
            return { timestamp: e.timestamp, eventName: e.eventName }
          })
        )
      } catch (e) {
        next(e)
      }
    },
  ],
}
