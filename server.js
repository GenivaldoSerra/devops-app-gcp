const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log("SIGTERM recebido");
  server.close(() => process.exit(0));
});
