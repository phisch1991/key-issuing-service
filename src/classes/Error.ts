interface APIError {
    status: number,
    message: string,
    errors?: Array<ErrorReasons>
}

export enum ErrorReasons {
    REVOKED = 'revoked',
    INACTIVE = 'inactive',
    NOT_BEFORE_IN_PAST = 'not_before cannot be in the past',
    EXPIRES_AT_IN_PAST = 'expires_at cannot be in the past',
    NOT_BEFORE_AFTER_EXPIRES_AT = 'not_before cannot be after expires_at',
    NEGATIVE_MAX_USE = 'revelation_token_max_use must be an integer value >= 0'
}

export class UnauthenticatedError implements APIError {
    status = 401
    message = "Authentication failed"
}

export class SealRevelationError implements APIError {
    status = 400
    message: string
    errors: Array<ErrorReasons>

    constructor (reasons: Array<ErrorReasons>) {
        this.message = 'Seal cannot be revealed.'
        this.errors = reasons
    }
}

export class SealRequestError implements APIError {
    status = 400
    message: string
    errors: Array<ErrorReasons>

    constructor (reasons: Array<ErrorReasons>) {
        this.message = 'Seal cannot be created.'
        this.errors = reasons
    }
}

export class BadRequestError implements APIError {
    status = 400
    message: string

    constructor (message: string = 'Bad Request') {
        this.message = message
    }
}

export class NotFoundError implements APIError {
    status = 404
    message = 'Not found'
}