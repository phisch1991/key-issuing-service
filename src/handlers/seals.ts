import { Seal, Status } from '../classes/Seal'
import { SealEvent, SealEventName } from '../classes/SealEvent'
import { AppDataSource, sealEventRepository, sealRepository } from '../index'

module.exports = {
  getSeal: async (req, res, next) => {
    const { id } = req.params
    try {
      let seal = await sealRepository.findOneByOrFail({ id })
      if (!seal) {
        res.status(404).json({ message: 'Not found' })
      }
      res.json(seal)
    } catch (e) {
      next(e)
    }
  },

  createSeal: async (req, res, next) => {
    const revelationTokenMaxUse = req.body?.revelation_token_max_use || 0
    const notBefore: string = req.body?.not_before || new Date().toISOString()
    const expiresAt: string = req.body?.expires_at || new Date().toISOString()
    const seal = new Seal(revelationTokenMaxUse, notBefore, expiresAt)
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

  deleteSeal: async (req, res, next) => {
    const { id } = req.params
    const sealEvent = new SealEvent(SealEventName.DELETE, id)
    try {
      const seal = await sealRepository.findOneBy({ id })
      if (!seal) {
        res.status(404).send()
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

  updateSeal: async (req, res, next) => {
    const { id } = req.params
    const sealEvent = new SealEvent(SealEventName.REVOKE, id)
    try {
      const seal = await sealRepository.findOneBy({ id })
      if (!seal) {
        res.status(404).send()
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

  revealSeal: async (req, res, next) => {
    const { id } = req.params
    const sealEvent = new SealEvent(SealEventName.REVEAL, id)
    try {
      const seal = await sealRepository.findOneBy({ id })
      if (!seal) {
        res.status(404).send()
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

  getSealEvents: async (req, res, next) => {
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
}
