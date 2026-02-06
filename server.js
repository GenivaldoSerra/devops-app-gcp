const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Middlewares
app.use(express.json());

app.use(express.static('public'));

// Métricas customizadas
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status_code'],
  registers: [register]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status_code'],
  registers: [register]
});

// Middleware para métricas
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, res.statusCode)
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, res.statusCode)
      .inc();
  });
  
  next();
});

// Rotas
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    app: 'DevOps App GCP Aula 4',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Middleware de erro
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Exportar app para testes
module.exports = app;

// Inicialização do Servidor
const server = app.listen(PORT, () => {
  console.log(JSON.stringify({ 
    severity: 'INFO', 
    message: `Servidor em produção na porta ${PORT}`,
    node_version: process.version
  }));
});

// GRACEFUL SHUTDOWN: O "Pulo do Gato" para Produção
process.on('SIGTERM', () => {
  console.log(JSON.stringify({ severity: 'WARNING', message: 'SIGTERM recebido. Encerrando conexões...' }));
  
  server.close(() => {
    console.log(JSON.stringify({ severity: 'INFO', message: 'Servidor encerrado com sucesso.' }));
    process.exit(0);
  });

  // Força saída se não fechar em 15s (evita container zumbi)
  setTimeout(() => process.exit(1), 15000);
});