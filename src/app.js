import express from 'express';
import { Server } from 'socket.io';
import { engine as handlebarsEngine } from 'express-handlebars';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override'; // Importar method-override
import mongoose from 'mongoose';
import Product from './models/Product.js'; // Importar modelo Product
import viewsRouter from './routers/viewsRouter.js';
import productsRouter from './routers/productsRouter.js';
import cartsRouter from './routers/cartsRouter.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import "dotenv/config";

//dotenv.config();


const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 8080;

// Conexión a MongoDB
export const initMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    // await mongoose.connect(process.env.MONGO_ATLAS_URL);
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error}`);
  }
};

initMongoDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Configurar method-override
app.use(express.static(__dirname + '/public'));

// Configuración de sesiones
app.use(session({
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60, // 14 días en segundos
  }),
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));

// Configuración de Handlebars
app.engine('handlebars', handlebarsEngine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    multiply: (a, b) => a * b, // Registrar helper multiply
  },
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Configuración de Socket.IO
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('addProduct', async (product) => {
    try {
      await Product.create(product);
      const products = await Product.find();
      io.emit('updateProducts', products);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});