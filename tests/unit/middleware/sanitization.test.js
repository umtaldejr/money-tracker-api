const sanitizeInput = require('../../../middleware/sanitization');

describe('sanitizeInput middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('script tag sanitization', () => {
    it('should remove script tags from body', () => {
      req.body = {
        name: 'John<script>alert("xss")</script>Doe',
        description: 'Test<script src="malicious.js"></script>content'
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('JohnDoe');
      expect(req.body.description).toBe('Testcontent');
      expect(next).toHaveBeenCalled();
    });

    it('should remove script tags with different cases', () => {
      req.body = {
        content: 'Hello<SCRIPT>alert("xss")</SCRIPT>World<ScRiPt>evil()</ScRiPt>!'
      };

      sanitizeInput(req, res, next);

      expect(req.body.content).toBe('HelloWorld!');
      expect(next).toHaveBeenCalled();
    });

    it('should remove script tags with attributes', () => {
      req.body = {
        content: '<script type="text/javascript" src="evil.js">alert("xss")</script>Safe content'
      };

      sanitizeInput(req, res, next);

      expect(req.body.content).toBe('Safe content');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('HTML tag sanitization', () => {
    it('should remove HTML tags from strings', () => {
      req.body = {
        name: '<div>John</div>',
        email: '<span>john@example.com</span>',
        bio: '<p>Hello <strong>world</strong>!</p>'
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('John');
      expect(req.body.email).toBe('john@example.com');
      expect(req.body.bio).toBe('Hello world!');
      expect(next).toHaveBeenCalled();
    });

    it('should remove self-closing tags', () => {
      req.body = {
        content: 'Line 1<br/>Line 2<hr/>Line 3<img src="test.jpg"/>'
      };

      sanitizeInput(req, res, next);

      expect(req.body.content).toBe('Line 1Line 2Line 3');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('JavaScript injection sanitization', () => {
    it('should remove javascript: protocols', () => {
      req.body = {
        link: 'javascript:alert("xss")',
        url: 'JAVASCRIPT:void(0)',
        href: 'Javascript:malicious()'
      };

      sanitizeInput(req, res, next);

      expect(req.body.link).toBe('alert("xss")');
      expect(req.body.url).toBe('void(0)');
      expect(req.body.href).toBe('malicious()');
      expect(next).toHaveBeenCalled();
    });

    it('should remove event handlers', () => {
      req.body = {
        content: 'onclick="alert()" onmouseover="evil()" ONLOAD="hack()"'
      };

      sanitizeInput(req, res, next);

      expect(req.body.content).toBe('"alert()" "evil()" "hack()"');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('nested object sanitization', () => {
    it('should sanitize nested objects', () => {
      req.body = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: '<div>Developer</div>',
            social: {
              twitter: 'javascript:alert("xss")'
            }
          }
        }
      };

      sanitizeInput(req, res, next);

      expect(req.body.user.name).toBe('John');
      expect(req.body.user.profile.bio).toBe('Developer');
      expect(req.body.user.profile.social.twitter).toBe('alert("xss")');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize arrays within objects', () => {
      req.body = {
        tags: ['<script>alert("xss")</script>tag1', '<div>tag2</div>', 'javascript:tag3'],
        categories: {
          items: ['<span>cat1</span>', 'onclick="evil()"cat2']
        }
      };

      sanitizeInput(req, res, next);

      expect(req.body.tags[0]).toBe('tag1');
      expect(req.body.tags[1]).toBe('tag2');
      expect(req.body.tags[2]).toBe('tag3');
      expect(req.body.categories.items[0]).toBe('cat1');
      expect(req.body.categories.items[1]).toBe('"evil()"cat2');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('query parameter sanitization', () => {
    it('should sanitize query parameters', () => {
      req.query = {
        search: '<script>alert("xss")</script>test',
        filter: '<div>category</div>',
        sort: 'javascript:alert("xss")'
      };

      sanitizeInput(req, res, next);

      expect(req.query.search).toBe('test');
      expect(req.query.filter).toBe('category');
      expect(req.query.sort).toBe('alert("xss")');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('params sanitization', () => {
    it('should sanitize route parameters', () => {
      req.params = {
        id: '<script>alert("xss")</script>123',
        slug: '<div>test-slug</div>',
        category: 'javascript:alert("xss")'
      };

      sanitizeInput(req, res, next);

      expect(req.params.id).toBe('123');
      expect(req.params.slug).toBe('test-slug');
      expect(req.params.category).toBe('alert("xss")');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('non-string value handling', () => {
    it('should not modify non-string values', () => {
      req.body = {
        age: 25,
        active: true,
        balance: 99.99,
        tags: null,
        metadata: undefined,
        count: 0
      };

      sanitizeInput(req, res, next);

      expect(req.body.age).toBe(25);
      expect(req.body.active).toBe(true);
      expect(req.body.balance).toBe(99.99);
      expect(req.body.tags).toBe(null);
      expect(req.body.metadata).toBe(undefined);
      expect(req.body.count).toBe(0);
      expect(next).toHaveBeenCalled();
    });

    it('should handle mixed data types in nested objects', () => {
      req.body = {
        user: {
          name: '<script>alert("xss")</script>John',
          age: 30,
          active: true,
          settings: {
            theme: '<div>dark</div>',
            notifications: false,
            limit: 100
          }
        }
      };

      sanitizeInput(req, res, next);

      expect(req.body.user.name).toBe('John');
      expect(req.body.user.age).toBe(30);
      expect(req.body.user.active).toBe(true);
      expect(req.body.user.settings.theme).toBe('dark');
      expect(req.body.user.settings.notifications).toBe(false);
      expect(req.body.user.settings.limit).toBe(100);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('whitespace handling', () => {
    it('should trim whitespace from sanitized strings', () => {
      req.body = {
        name: '  <script>alert("xss")</script>  John  ',
        email: '\t<div>john@example.com</div>\n',
        bio: '   <p>Hello world!</p>   '
      };

      sanitizeInput(req, res, next);

      expect(req.body.name).toBe('John');
      expect(req.body.email).toBe('john@example.com');
      expect(req.body.bio).toBe('Hello world!');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty request objects', () => {
      req.body = undefined;
      req.query = undefined;
      req.params = undefined;

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle null request objects', () => {
      req.body = null;
      req.query = null;
      req.params = null;

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle empty objects', () => {
      req.body = {};
      req.query = {};
      req.params = {};

      sanitizeInput(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle circular references gracefully', () => {
      const circularObj = { name: '<script>alert("xss")</script>test' };
      circularObj.self = circularObj;
      req.body = circularObj;

      expect(() => sanitizeInput(req, res, next)).not.toThrow();
      expect(next).toHaveBeenCalled();
    });
  });
});
