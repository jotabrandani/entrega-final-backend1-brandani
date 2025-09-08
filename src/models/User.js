import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
  },
  last_name: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Por favor, ingrese un correo electrónico válido'],
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'premium', 'admin'],
      message: '{VALUE} no es un rol válido',
    },
    default: 'user',
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastConnection: {
    type: Date,
    default: null,
  },
});

// Índice para mejorar búsquedas por email
userSchema.index({ email: 1 });

// Middleware para actualizar lastConnection siempre que se guarde el usuario
userSchema.pre('save', function (next) {
  this.lastConnection = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
