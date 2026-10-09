import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import Product from './models/Product.js';
import User from './models/User.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// same catalog the website uses for its offline demo mode
const products = JSON.parse(fs.readFileSync(path.join(here, '../../shared/products.json'), 'utf8'));

await mongoose.connect(env.mongoUri);
await Product.deleteMany({});
await Product.insertMany(products);
console.log(`Seeded ${products.length} products`);

const adminEmail = process.env.ADMIN_EMAIL;
const adminPass = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPass) {
  await User.deleteOne({ email: adminEmail.toLowerCase() });
  await User.create({ name: 'Store Admin', email: adminEmail, password: await bcrypt.hash(adminPass, 12), role: 'admin' });
  console.log(`Admin ${adminEmail} created`);
} else {
  console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to also create an admin user');
}
await mongoose.disconnect();
