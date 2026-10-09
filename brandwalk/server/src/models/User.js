import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // bcrypt hash only — plaintext is never stored or logged
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    address: addressSchema,
    // SHA-256 hashes of active refresh tokens (rotation + reuse detection)
    refreshTokens: { type: [String], select: false, default: [] },
    failedLogins: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    // consent records (DPDP Act / GDPR style proof of consent)
    consent: {
      termsAcceptedAt: Date,
      privacyAcceptedAt: Date,
      marketing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafe = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    address: this.address,
    consent: this.consent,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);
