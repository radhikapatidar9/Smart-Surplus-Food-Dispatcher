const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Authentication API', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'restaurant'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(mockUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(mockUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('should login an existing user and return a token', async () => {
    // Manually create user first
    await User.create(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.name).toBe(mockUser.name);
  });

  it('should fail with invalid credentials', async () => {
    await User.create(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: mockUser.email,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });

  it('should prevent access to protected routes without token', async () => {
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(401);
  });
});
