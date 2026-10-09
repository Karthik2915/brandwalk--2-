import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        size: Number,
        qty: Number,
        price: Number, // snapshot of server-side price at purchase time
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    status: { type: String, enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
    itemsTotal: Number,
    shippingFee: Number,
    total: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
