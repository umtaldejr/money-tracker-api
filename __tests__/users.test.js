const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Users API', () => {
  let authToken;
  let currentUserId;

  beforeEach(async () => {
    User.destroy();

    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const userResponse = await request(app)
      .post('/api/v1/users')
      .send(userData);

    currentUserId = userResponse.body.id;

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    User.destroy();
  });

  describe('POST /api/v1/users', () => {
    beforeEach(async () => {
      User.destroy();
    });

    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.password).toBeUndefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should fail to create user with invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Please provide a valid email address');
    });

    it('should fail to create user with short password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toContain('Password must be at least 6 characters long');
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('User with this email already exists');
    });

    it('should fail to create user without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({})
        .expect(400);

      expect(response.body.errors).toContain('Name is required and must be a string');
      expect(response.body.errors).toContain('Email is required and must be a string');
      expect(response.body.errors).toContain('Password is required and must be a string');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should get all users with valid token', async () => {
      await User.create({ name: 'Jane Smith', email: 'jane@example.com', password: 'password123' });
      await User.create({ name: 'Bob Johnson', email: 'bob@example.com', password: 'password123' });

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Test User');
      expect(response.body[0].password).toBeUndefined();
    });

    it('should fail to get users without token', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should return empty array when no users exist', async () => {
      User.destroy();

      const userData = {
        name: 'Only User',
        email: 'only@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/v1/users')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      const token = loginResponse.body.token;

      User.destroy();

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token - user not found');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get own user by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.name).toBe('Test User');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.password).toBeUndefined();
    });

    it('should fail to get other user data', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .get(`/api/v1/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toBe('Invalid ID format: \'invalid-id\'. Expected a valid UUID.');
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update own user with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe('updated@example.com');
      expect(response.body.password).toBeUndefined();
    });

    it('should update only provided fields', async () => {
      const updateData = { name: 'Only Name Updated' };

      const response = await request(app)
        .put(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Only Name Updated');
      expect(response.body.email).toBe('test@example.com');
    });

    it('should fail to update with invalid email', async () => {
      const updateData = { email: 'invalid-email' };

      const response = await request(app)
        .put(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.errors).toContain('Please provide a valid email address');
    });

    it('should fail to update with duplicate email', async () => {
      await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      const updateData = { email: 'other@example.com' };

      const response = await request(app)
        .put(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toBe('Email already in use');
    });

    it('should fail to update other user data', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      const updateData = { name: 'Hacked Name' };

      const response = await request(app)
        .put(`/api/v1/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete own user', async () => {
      await request(app)
        .delete(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const user = await User.findByPk(currentUserId);
      expect(user).toBeNull();
    });

    it('should fail to delete other user data', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .delete(`/api/v1/users/${otherUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      const response = await request(app)
        .delete(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.error).toBe('Access denied - you can only access your own data');
    });

    it('should return 404 for already deleted user', async () => {
      await User.deleteById(currentUserId);

      const response = await request(app)
        .delete(`/api/v1/users/${currentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token - user not found');
    });
  });
});
