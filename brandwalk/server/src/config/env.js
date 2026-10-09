import 'dotenv/config';

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_ORIGIN'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`Missing required env var ${k}`);
    process.exit(1);
  }
}
const isProd = process.env.NODE_ENV === 'production';
if (isProd && /change-me/.test(process.env.JWT_ACCESS_SECRET + process.env.JWT_REFRESH_SECRET)) {
  console.error('Refusing to start in production with placeholder JWT secrets');
  process.exit(1);
}

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  clientOrigin: process.env.CLIENT_ORIGIN,
};
