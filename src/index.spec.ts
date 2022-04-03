import chai from 'chai'
import request from 'supertest'
import { app } from './index'

let should = chai.should()

describe('Router', function () {
  it('should expose a GET /seals route', function () {
    request(app)
      .get('/api/v1/seals')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err: any, res: any) {
        if (err) throw err
      })
  })

  it('should should expose a POST /seals route ', function () {
    request(app)
      .post('/api/v1/seals')
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function (err: any, res: any) {
        if (err) throw err
      })
  })
})
