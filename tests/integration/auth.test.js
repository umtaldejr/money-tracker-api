const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('Authentication API', () => {
  beforeEach(async () => {
    User.destroy();
  });

  afterAll(async () => {
    User.destroy();
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/users')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        });
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.name).toBe('John Doe');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should fail to login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail to login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should fail to login without email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should fail to login without password', async () => {
      const loginData = {
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const userResponse = await request(app)
        .post('/api/v1/users')
        .send(userData);

      userId = userResponse.body.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      token = loginResponse.body.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.password).toBeUndefined();
      expect(response.body.id).toBe(userId);
    });

    it('should fail to get current user without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });

    it('should fail to get current user with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should fail to get current user with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Invalid-format')
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('Protected Routes', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const userResponse = await request(app)
        .post('/api/v1/users')
        .send(userData);

      userId = userResponse.body.id;

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      token = loginResponse.body.token;
    });

    describe('GET /api/v1/users', () => {
      it('should get all users with valid token', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('John Doe');
      });

      it('should fail to get users without token', async () => {
        const response = await request(app)
          .get('/api/v1/users')
          .expect(401);

        expect(response.body.error).toBe('Access token required');
      });
    });

    describe('GET /api/v1/users/:id', () => {
      it('should get own user data with valid token', async () => {
        const response = await request(app)
          .get(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.name).toBe('John Doe');
        expect(response.body.email).toBe('john@example.com');
      });

      it('should fail to get other user data', async () => {
        const otherUserData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        };

        const otherUserResponse = await request(app)
          .post('/api/v1/users')
          .send(otherUserData);

        const otherUserId = otherUserResponse.body.id;

        const response = await request(app)
          .get(`/api/v1/users/${otherUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.error).toBe('Access denied - you can only access your own data');
      });
    });

    describe('PUT /api/v1/users/:id', () => {
      it('should update own user data with valid token', async () => {
        const updateData = {
          name: 'John Updated',
          email: 'john.updated@example.com'
        };

        const response = await request(app)
          .put(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe('John Updated');
        expect(response.body.email).toBe('john.updated@example.com');
      });

      it('should fail to update other user data', async () => {
        const otherUserData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        };

        const otherUserResponse = await request(app)
          .post('/api/v1/users')
          .send(otherUserData);

        const otherUserId = otherUserResponse.body.id;

        const response = await request(app)
          .put(`/api/v1/users/${otherUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Hacked Name' })
          .expect(403);

        expect(response.body.error).toBe('Access denied - you can only access your own data');
      });
    });

    describe('DELETE /api/v1/users/:id', () => {
      it('should delete own user data with valid token', async () => {
        await request(app)
          .delete(`/api/v1/users/${userId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(204);

        const user = await User.findByPk(userId);
        expect(user).toBeNull();
      });

      it('should fail to delete other user data', async () => {
        const otherUserData = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        };

        const otherUserResponse = await request(app)
          .post('/api/v1/users')
          .send(otherUserData);

        const otherUserId = otherUserResponse.body.id;

        const response = await request(app)
          .delete(`/api/v1/users/${otherUserId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(403);

        expect(response.body.error).toBe('Access denied - you can only access your own data');
      });
    });
  });
});
