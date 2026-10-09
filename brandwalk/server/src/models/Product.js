import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, enum: ['Sneakers', 'Running', 'Formal', 'Casual', 'Sandals', 'Boots'], required: true },
    gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // INR
    mrp: { type: Number, min: 0 },
    shape: { type: String, enum: ['sneaker', 'runner', 'high', 'oxford', 'loafer', 'boot', 'sandal'], default: 'sneaker' },
    color: { type: String, default: '#222222' }, // used for the built-in shoe illustration
    color2: { type: String, default: '#f4f1ea' },
    tag: { type: String, default: '' }, // New / Bestseller / Sale
    highlights: [String],
    images: [String],
    sizes: [{ size: Number, stock: { type: Number, default: 0, min: 0 } }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
