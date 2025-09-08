import { Router } from 'express';
import * as viewsController from '../controllers/viewsController.js';
import Product from '../models/Product.js'; // Importar el modelo Product

const router = Router();

// Ruta raíz que muestra la lista de productos
router.get('/', viewsController.renderProducts);

router.get('/products', viewsController.renderProducts);
router.get('/products/:pid', viewsController.renderProduct);
router.get('/carts/:cid', viewsController.renderCart);

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await Product.find();
    const cartId = req.session.cartId || null;
    res.render('realTimeProducts', { products, cartId });
  } catch (error) {
    res.status(500).send('Error al renderizar gestión de productos');
  }
});

export default router;