import { Seal } from '../classes/Seal'
import logger from './logger'
import { sealEventRepository, sealRepository } from '../index'
import { SealEventName } from '../classes/SealEvent'

export async function validateOwnershipToken(req): Promise<boolean> {
  try {
    const authorization_token = extractAuthorizationToken(req)
    const { ownership_token } = await sealRepository.findOneByOrFail({
      id: req.id,
    })

    return authorization_token === ownership_token
  } catch (e) {
    logger.error('Authorization with ownership_token failed', e)
    return false
  }
}

export async function validateRevelationToken(req): Promise<boolean> {
  try {
    const authorization_token = extractAuthorizationToken(req)
    const {
      revelation_token,
      revelation_token_max_use,
    } = await sealRepository.findOneByOrFail({ id: req.id })
    if (!(revelation_token_max_use === 0)) {
      const revelation_token_use = await sealEventRepository.countBy({
        sealId: req.id,
        eventName: SealEventName.REVEAL,
      })
      if (revelation_token_use >= revelation_token_max_use) {
        return false
      }
    }
    return authorization_token === revelation_token
  } catch (e) {
    logger.error('Authorization with relevation_token failed', e)
    return false
  }
}

function extractAuthorizationToken(req: any) {
  return req.get('Authorization').replace('Bearer', '').trim()
}
