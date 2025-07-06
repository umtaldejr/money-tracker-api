const bcrypt = require('bcryptjs');
const validator = require('validator');
const memoryStore = require('../store/memoryStore');

class User {
  constructor(data) {
    Object.assign(this, data);
  }

  static validate(userData, isUpdate = false) {
    const errors = [];
    const { name, email, password } = userData;

    if (!isUpdate && (!name || typeof name !== 'string')) {
      errors.push('Name is required and must be a string');
    } else if (name !== undefined) {
      if (typeof name !== 'string') {
        errors.push('Name must be a string');
      } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else if (name.trim().length > 50) {
        errors.push('Name cannot exceed 50 characters');
      }
    }

    if (!isUpdate && (!email || typeof email !== 'string')) {
      errors.push('Email is required and must be a string');
    } else if (email !== undefined) {
      if (typeof email !== 'string') {
        errors.push('Email must be a string');
      } else if (!validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate && (!password || typeof password !== 'string')) {
      errors.push('Password is required and must be a string');
    } else if (password !== undefined) {
      if (typeof password !== 'string') {
        errors.push('Password must be a string');
      } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    return errors;
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(candidatePassword) {
    const userWithPassword = await User.findByIdWithPassword(this.id);
    return await bcrypt.compare(candidatePassword, userWithPassword.password);
  }

  toJSON() {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static async create(userData) {
    const validationErrors = User.validate(userData);
    if (validationErrors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = validationErrors;
      throw error;
    }

    const existingUser = memoryStore.getUserByEmail(userData.email);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.name = 'UniqueConstraintError';
      throw error;
    }

    const userToCreate = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: await User.hashPassword(userData.password)
    };

    const createdUser = memoryStore.createUser(userToCreate);
    return new User(createdUser);
  }

  static findByEmail(email) {
    const userData = memoryStore.getUserByEmail(email);
    return userData ? new User(userData) : null;
  }

  static findByEmailWithPassword(email) {
    const userData = memoryStore.getUserByEmail(email);
    return userData ? userData : null;
  }

  static findByPk(id) {
    const userData = memoryStore.getUserById(id);
    return userData ? new User(userData) : null;
  }

  static findByIdWithPassword(id) {
    const userData = memoryStore.getUserById(id);
    return userData ? userData : null;
  }

  static findAll() {
    const users = memoryStore.getUsers();
    return users.map(userData => new User(userData));
  }

  static async bulkCreate(usersData) {
    const createdUsers = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    return createdUsers;
  }

  async update(updates) {
    const validationErrors = User.validate(updates, true);
    if (validationErrors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = validationErrors;
      throw error;
    }

    if (updates.email && updates.email !== this.email) {
      const existingUser = memoryStore.getUserByEmail(updates.email);
      if (existingUser && existingUser.id !== this.id) {
        const error = new Error('Email already in use');
        error.name = 'UniqueConstraintError';
        throw error;
      }
    }

    const updatesToApply = { ...updates };

    if (updatesToApply.name !== undefined) {
      updatesToApply.name = updatesToApply.name.trim();
    }
    if (updatesToApply.email !== undefined) {
      updatesToApply.email = updatesToApply.email.toLowerCase().trim();
    }
    if (updatesToApply.password !== undefined) {
      updatesToApply.password = await User.hashPassword(updatesToApply.password);
    }

    const updatedUserData = memoryStore.updateUser(this.id, updatesToApply);
    if (!updatedUserData) {
      return null;
    }

    Object.assign(this, updatedUserData);
    return this;
  }

  static deleteById(id) {
    return memoryStore.deleteUser(id);
  }

  static destroy() {
    memoryStore.clearUsers();
  }
}

module.exports = User;
