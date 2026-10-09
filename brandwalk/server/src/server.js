import mongoose from 'mongoose';
import { env } from './config/env.js';
import app from './app.js';

mongoose.set('strictQuery', true);

try {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
} catch (err) {
  console.error('\n❌ Could not connect to MongoDB.');
  console.error(`   Reason: ${err.message}`);
  console.error('   Fix MONGO_URI in server/.env, then restart. Common causes:');
  console.error('   • Atlas: your IP is not allowed (Network Access → Add IP Address → Allow access from anywhere for testing)');
  console.error('   • Atlas: wrong database-user password (special characters must be URL-encoded)');
  console.error('   • Local: MongoDB is not installed/running (use mongodb://127.0.0.1:27017/brandwalk)\n');
  process.exit(1);
}
console.log('✅ MongoDB connected');

const server = app.listen(env.port, () => console.log(`✅ Brand Walk API running on http://localhost:${env.port}`));
server.on('error', (err) => {
  console.error(err.code === 'EADDRINUSE' ? `❌ Port ${env.port} is already in use. Change PORT in server/.env` : err);
  process.exit(1);
});

const shutdown = () => server.close(() => mongoose.connection.close().then(() => process.exit(0)));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
