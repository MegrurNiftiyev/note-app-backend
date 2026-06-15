require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

let server;

const shutdown = (reason, error) => {
  console.error(reason, error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  shutdown('Uncaught exception', error);
});

process.on('unhandledRejection', (error) => {
  shutdown('Unhandled rejection', error);
});

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log('Server started successfully');
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer();
