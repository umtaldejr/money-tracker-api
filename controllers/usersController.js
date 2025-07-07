const User = require('../models/User');

class UsersController {
  static async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ errors: error.errors });
      }

      if (error.name === 'UniqueConstraintError') {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      res.status(500).json({ error: 'Something went wrong!' });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();

      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update(req.body);

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ errors: error.errors });
      }

      if (error.name === 'UniqueConstraintError') {
        return res.status(409).json({ error: 'Email already in use' });
      }

      res.status(500).json({ error: 'Something went wrong!' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const deletedUser = User.deleteById(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  }
}

module.exports = UsersController;
