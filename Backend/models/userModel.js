import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  avatar: {
    type: String,
    default: '',
    match: [/^https?:\/\/.+$/, 'Avatar must be a valid URL'],
  },
  status: {
    type: String,
    default: 'Hey there! I am using the chat app.',
    maxlength: [100, 'Status cannot exceed 100 characters'],
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pushSubscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);