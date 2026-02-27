import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';

describe('Auth E2E', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    //  in memory mongo


    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const conn = app.get<Connection>(getConnectionToken());
    await conn.close();

    await app.close();
    await mongod.stop();
  });

  it('signup -> signin -> me (happy path)', async () => {
    const email = 'test@example.com';
    const password = 'Passw0rd!';
    const name = 'Tester';

    // Signup
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, name, password })
      .expect(201);

    expect(signupRes.body).toHaveProperty('id');
    expect(signupRes.body).toMatchObject({ email, name });
    expect(signupRes.body).not.toHaveProperty('password');
    expect(signupRes.body).not.toHaveProperty('passwordHash');

    // Signin
    const signinRes = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password })
      .expect(201);

    expect(signinRes.body).toHaveProperty('accessToken');
    const token = signinRes.body.accessToken as string;
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // looks like a JWT

    // Protected
    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toMatchObject({ email, name });
    expect(meRes.body).toHaveProperty('id');
  });

  it('me should fail without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('signup should fail on duplicate email', async () => {
    const email = 'dup@example.com';
    const password = 'Passw0rd!';
    const name = 'Tester';

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, name, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, name, password })
      .expect(409);
  });

  it('signin should fail on wrong password', async () => {
    const email = 'wrongpass@example.com';
    const password = 'Passw0rd!';
    const name = 'Tester';

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, name, password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password: 'WrongPass1!' })
      .expect(401);
  });
});
