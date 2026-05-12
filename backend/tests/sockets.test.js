const { server } = require('../server');
const ioClient = require('socket.io-client');
const db = require('./setup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let socket;
let port;

beforeAll(async () => {
  await db.connect();
  return new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for background socket events to finish
  await db.closeDatabase();
  return new Promise((resolve) => server.close(resolve));
});

describe('Socket.IO Real-time Engine', () => {
  let token;

  beforeAll(async () => {
    const user = await User.create({
      name: 'Socket User',
      email: 'socket@test.com',
      password: 'password123',
      role: 'volunteer'
    });
    token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'testsecret'
    );
  });

  afterEach(() => {
    if (socket && socket.connected) socket.disconnect();
  });

  it('should authenticate and connect to logistics room', (done) => {
    socket = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });

    socket.on('connect_error', (err) => {
      done(err);
    });
  });

  it('should receive sync_state on connection', (done) => {
    socket = ioClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('sync_state', (state) => {
      expect(state).toHaveProperty('activeDonations');
      expect(state).toHaveProperty('notifications');
      done();
    });
  });
});
