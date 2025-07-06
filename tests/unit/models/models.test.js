const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

describe('User Model Unit Tests', () => {
  beforeEach(() => {
    User.destroy();
  });

  afterAll(() => {
    User.destroy();
  });

  describe('User.create', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await User.create(userData);

      await expect(User.create(userData)).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for missing required fields', async () => {
      await expect(User.create({})).rejects.toThrow();
      await expect(User.create({ name: 'John' })).rejects.toThrow();
      await expect(User.create({ email: 'john@example.com' })).rejects.toThrow();
    });
  });

  describe('User.findByPk', () => {
    it('should find user by valid ID', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = await User.create(userData);
      const foundUser = User.findByPk(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.name).toBe(userData.name);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = 'non-existent-id';
      const user = User.findByPk(nonExistentId);

      expect(user).toBeNull();
    });
  });

  describe('User.findByEmail', () => {
    it('should find user by valid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await User.create(userData);
      const foundUser = await User.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
      expect(foundUser.name).toBe(userData.name);
    });

    it('should find user by email case-insensitively', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await User.create(userData);
      const foundUser = await User.findByEmail('JOHN@EXAMPLE.COM');

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('User.findAll', () => {
    it('should return all users', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const userData2 = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456'
      };

      await User.create(userData1);
      await User.create(userData2);

      const users = await User.findAll();

      expect(users).toHaveLength(2);
      expect(users[0].name).toBe(userData1.name);
      expect(users[1].name).toBe(userData2.name);
    });

    it('should return empty array when no users exist', async () => {
      const users = await User.findAll();

      expect(users).toHaveLength(0);
    });
  });

  describe('User.update', () => {
    it('should update user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = await User.create(userData);

      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData = {
        name: 'John Updated',
        email: 'john.updated@example.com'
      };

      const updatedUser = await createdUser.update(updateData);

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.email).toBe(updateData.email);
      expect(new Date(updatedUser.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(createdUser.updatedAt).getTime());
    });

    it('should return null for non-existent user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = await User.create(userData);
      User.deleteById(createdUser.id);

      const updatedUser = await createdUser.update({ name: 'Updated' });

      expect(updatedUser).toBeNull();
    });
  });

  describe('User.delete', () => {
    it('should delete existing user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const createdUser = await User.create(userData);
      const result = User.deleteById(createdUser.id);

      expect(result).toBe(true);
      expect(User.findByPk(createdUser.id)).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const result = User.deleteById('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
