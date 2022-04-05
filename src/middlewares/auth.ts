import { sealEventRepository, sealRepository } from '../config/db'
import { SealEventName } from '../classes/SealEvent'
import { ErrorReasons, SealRevelationError, UnauthenticatedError } from '../classes/Error'
import { Status } from '../classes/Seal'

export async function validateOwnershipToken(req, res, next): Promise<void> {
  try {
    const authorization_token = extractAuthorizationToken(req)
    const { ownership_token } = await sealRepository.findOneByOrFail({
      id: req.params.id,
    })

    if (authorization_token !== ownership_token) {
      throw UnauthenticatedError
    }
    next()
  } catch (e) {
    next(e)
  }
}

export async function validateRevelation(req, res, next): Promise<void> {
  try {
    const authorization_token = extractAuthorizationToken(req)
    const {
      revelation_token,
      revelation_token_max_use,
      not_before,
      expires_at,
      status
    } = await sealRepository.findOneByOrFail({ id: req.params.id })

    if (status === Status.REVOKED) {
      throw new SealRevelationError([ErrorReasons.REVOKED])
    }

    if (authorization_token !== revelation_token) {
      throw new UnauthenticatedError()
    }

    if (Date.now() < Date.parse(not_before) || Date.now() > Date.parse(expires_at)) {
      throw new SealRevelationError([ErrorReasons.INACTIVE])
    }

    if (!(revelation_token_max_use === 0)) {
      const revelation_token_use = await sealEventRepository.countBy({
        sealId: req.id,
        eventName: SealEventName.REVEAL,
      })
      if (revelation_token_use >= revelation_token_max_use) {
        throw UnauthenticatedError
      }
    }

    next()
  } catch (e) {
    next(e)
  }
}

function extractAuthorizationToken(req: any) {
  return req.get('Authorization').replace('Bearer', '').trim()
}
