import app from '../src/app'
import request from 'supertest'

describe('example', () => {
  it('should return an object with the message "Hello World!"', async () => {
    const response = await request(app)
      .get('/test')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toEqual({
      db: ':memory',
      message: 'Hello World!'
    })
  })
})
