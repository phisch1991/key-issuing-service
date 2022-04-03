import { v4 } from 'uuid'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Seal } from './Seal'

export enum SealEventName {
  CREATE = 'create',
  REVEAL = 'reveal',
  REVOKE = 'revoke',
  DELETE = 'delete',
}

@Entity()
export class SealEvent {
  @PrimaryColumn()
  id: string

  @Column()
  @Index()
  sealId: string

  @Column()
  eventName: string

  @Column()
  timestamp: string

  constructor(eventName: SealEventName, sealId: string) {
    this.id = v4()
    this.eventName = eventName
    this.sealId = sealId
    this.timestamp = new Date().toISOString()
  }
}
