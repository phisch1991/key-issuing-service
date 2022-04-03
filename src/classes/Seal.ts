import { v4 } from 'uuid'
import crypto from 'crypto'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import { SealEvent } from './SealEvent'

export enum Status {
  UNREVEALED = 'unrevealed',
  REVEALED = 'revealed',
  REVOKED = 'revoked',
  INACTIVE = 'inactive',
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
    revelationTokenMaxUse: number,
    notBefore: string,
    expiresAt: string
  ) {
    this.id = v4()
    this.key = crypto.pseudoRandomBytes(32).toString('hex')
    this.salt = crypto.pseudoRandomBytes(32).toString('hex')
    ;(this.revelation_token = crypto.pseudoRandomBytes(32).toString('hex')),
      (this.revelation_token_max_use = revelationTokenMaxUse)
    ;(this.ownership_token = crypto.pseudoRandomBytes(32).toString('hex')),
      (this.not_before = notBefore)
    this.expires_at = expiresAt
    this.status = Status.UNREVEALED
  }
}
