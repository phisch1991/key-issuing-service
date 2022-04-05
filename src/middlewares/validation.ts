import { ErrorReasons, SealRequestError } from '../classes/Error'

export default function validateSealRequest(req, res, next) {
  const errorReasons: Array<ErrorReasons> = []

  const { revelation_token_max_use, not_before, expires_at } = req.body

  if (revelation_token_max_use < 0) {
    errorReasons.push(ErrorReasons.NEGATIVE_MAX_USE)
  }

  if (not_before && Date.parse(not_before) < Date.now()) {
    errorReasons.push(ErrorReasons.NOT_BEFORE_IN_PAST)
  }

  if (expires_at && Date.parse(expires_at) < Date.now()) {
    errorReasons.push(ErrorReasons.EXPIRES_AT_IN_PAST)
  }

  if (
    not_before &&
    expires_at &&
    Date.parse(not_before) > Date.parse(expires_at)
  ) {
    errorReasons.push(ErrorReasons.NOT_BEFORE_AFTER_EXPIRES_AT)
  }

  errorReasons.length > 0 ? next(new SealRequestError(errorReasons)) : next()
}
