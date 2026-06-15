require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const getBaseUrl = require('./src/utils/getBaseUrl');

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
    const baseUrl = getBaseUrl();

    console.log('Server started successfully');
    console.log(`API URL: ${baseUrl}`);
    console.log(`Swagger docs: ${baseUrl}/api-docs`);
  });
};

startServer();
