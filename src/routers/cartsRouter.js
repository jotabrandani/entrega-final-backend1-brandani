import express from 'express';
import cartsController from '../controllers/cartsController.js';

const router = express.Router();

// Crear un nuevo carrito
router.post('/', cartsController.createCart);

// Obtener un carrito por ID con populate
router.get('/:cid', cartsController.getCartById);

// Agregar un producto al carrito
router.post('/:cid/product/:pid', cartsController.addProductToCart);

// Actualizar todos los productos del carrito
router.put('/:cid', cartsController.updateCart);

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', cartsController.updateProductQuantity);

// Eliminar todos los productos del carrito
router.delete('/:cid', cartsController.deleteAllProductsFromCart);

// DELETE /api/carts/:cid/products/:pid - eliminar un producto del carrito
router.delete('/:cid/products/:pid', cartsController.deleteProductFromCart);


// Finalizar compra
router.post('/:cid/purchase', cartsController.purchaseCart);

export default router;