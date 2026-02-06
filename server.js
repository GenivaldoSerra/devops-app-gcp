const app = require('./app');
const PORT = process.env.PORT || 3000;

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