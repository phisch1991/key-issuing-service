import { v4 } from 'uuid'
import crypto from 'crypto'
import { Column, Entity, PrimaryColumn } from 'typeorm'

export enum Status {
  UNREVEALED = 'unrevealed',
  REVEALED = 'revealed',
  REVOKED = 'revoked',
  INACTIVE = 'inactive',
}

interface SealConfig {
  not_before?: string,
  expires_at?: string
  revelation_token_max_use?: number
}
@Entity()
export class Seal {
  @PrimaryColumn()
  id: string

  @Column()
  key: string

  @Column()
  salt: string

  @Column()
  revelation_token: string

  @Column()
  revelation_token_max_use: number

  @Column()
  ownership_token: string

  @Column()
  not_before: string

  @Column()
  expires_at: string

  @Column()
  status: Status

  constructor(
    config: SealConfig
  ) {
    this.id = v4()
    this.key = crypto.pseudoRandomBytes(32).toString('hex')
    this.salt = crypto.pseudoRandomBytes(32).toString('hex')
    this.revelation_token = crypto.pseudoRandomBytes(32).toString('hex')
    this.revelation_token_max_use = config?.revelation_token_max_use || 0
    this.ownership_token = crypto.pseudoRandomBytes(32).toString('hex')
    this.not_before = config?.not_before || new Date().toISOString()
    this.expires_at = config?.expires_at || new Date().toISOString()
    this.status = Status.UNREVEALED
  }
}
