const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Users API', () => {
  beforeEach(async () => {
    User.destroy();
  });

  afterAll(async () => {
    User.destroy();
  });

  describe('POST /api/v1/users', () => {
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
    beforeEach(async () => {
      await User.bulkCreate([
        { name: 'John Doe', email: 'john@example.com', password: 'password123' },
        { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
        { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123' }
      ]);
    });

    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].name).toBe('Jane Smith');
      expect(response.body[2].name).toBe('Bob Johnson');
    });

    it('should return empty array when no users exist', async () => {
      User.destroy();

      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      userId = user.id;
    });

    it('should get user by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .expect(400);

      expect(response.body.error).toBe("Invalid ID format: 'invalid-id'. Expected a valid UUID.");
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      userId = user.id;
    });

    it('should update user with valid data', async () => {
      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.email).toBe('john.updated@example.com');
    });

    it('should update only provided fields', async () => {
      const updateData = { name: 'John Updated' };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('John Updated');
      expect(response.body.email).toBe('john@example.com');
    });

    it('should fail to update with invalid email', async () => {
      const updateData = { email: 'invalid-email' };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.errors).toContain('Please provide a valid email address');
    });

    it('should fail to update with duplicate email', async () => {
      await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      });

      const updateData = { email: 'jane@example.com' };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toBe('Email already in use');
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/v1/users/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      userId = user.id;
    });

    it('should hard delete user', async () => {
      await request(app)
        .delete(`/api/v1/users/${userId}`)
        .expect(204);

      const user = await User.findByPk(userId);
      expect(user).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      const response = await request(app)
        .delete(`/api/v1/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return 404 for already deleted user', async () => {
      User.deleteById(userId);

      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });
});
