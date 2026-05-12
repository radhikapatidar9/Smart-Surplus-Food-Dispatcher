const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');
const User = require('../models/User');
const Donation = require('../models/Donation');

beforeAll(async () => await db.connect());
afterEach(async () => await db.clearDatabase());
afterAll(async () => await db.closeDatabase());

describe('Donations API', () => {
  let token;
  let restaurant;

  beforeEach(async () => {
    restaurant = await User.create({
      name: 'Resto 1',
      email: 'resto@test.com',
      password: 'password123',
      role: 'restaurant'
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'resto@test.com', password: 'password123' });
    
    token = login.body.accessToken;
  });

  it('should create a new donation', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        foodType: 'Fresh Salad',
        quantity: '5',
        unit: 'kg',
        location: '123 Test St',
        lat: 12.34,
        lng: 56.78
      });

    expect(res.status).toBe(201);
    expect(res.body.data.foodType).toBe('Fresh Salad');
    expect(res.body.data.status).toBe('pending');
  });

  it('should enforce role-based access for donation creation', async () => {
    const ngo = await User.create({
      name: 'NGO 1',
      email: 'ngo@test.com',
      password: 'password123',
      role: 'ngo'
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ngo@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .send({ foodType: 'Error' });

    expect(res.status).toBe(403); // NGOs cannot create donations
  });

  it('should validate 8-stage state machine transitions', async () => {
    // Admin user for status updates
    await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    const adminToken = adminLogin.body.accessToken;

    const donation = await Donation.create({
      foodType: 'Bread',
      quantity: '10',
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      location: 'Store A',
      status: 'pending'
    });

    // Valid transition: pending -> ai_verified
    const res = await request(app)
      .patch(`/api/donations/${donation._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ai_verified' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ai_verified');
  });
});
