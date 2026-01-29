const request = require('supertest');
const app = require('../server');

describe('DevOps App', () => {
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy'
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/info', () => {
    it('should return application info', async () => {
      const response = await request(app).get('/api/info');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        app: 'DevOps App GCP Aula 4',
        version: '2.0.0'
      });
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /metrics', () => {
    it('should return prometheus metrics', async () => {
      const response = await request(app).get('/metrics');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_request_duration_seconds');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: 'Not Found'
      });
    });
  });
});