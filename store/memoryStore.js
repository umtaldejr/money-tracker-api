const { v4: uuidv4 } = require('uuid');

class MemoryStore {
  constructor() {
    this.users = [];
  }

  generateId() {
    return uuidv4();
  }

  addTimestamps(data) {
    const now = new Date().toISOString();
    return {
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  updateTimestamps(data) {
    return {
      ...data,
      updatedAt: new Date().toISOString()
    };
  }

  clear() {
    this.clearUsers();
  }

  clearUsers() {
    this.users = [];
  }

  getUsers() {
    return [...this.users];
  }

  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const user = this.addTimestamps({
      id: this.generateId(),
      ...userData
    });
    this.users.push(user);
    return user;
  }

  updateUser(id, updates) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }

    this.users[index] = this.updateTimestamps({
      ...this.users[index],
      ...updates
    });

    return this.users[index];
  }

  deleteUser(id) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }

    const deletedUser = this.users[index];
    this.users.splice(index, 1);

    return deletedUser;
  }
}

module.exports = new MemoryStore();
