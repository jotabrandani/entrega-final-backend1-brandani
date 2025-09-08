import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Ticket from '../models/Ticket.js';

const createCart = async (req, res) => {
  try {
    // Sin usuario, creamos carrito vacío sin userId (o userId opcional)
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

    // Buscar si el producto ya está en el carrito
    const productInCart = cart.products.find(p => p.product.toString() === pid);

    if (productInCart) {
      // Sumar cantidad sin importar stock
      productInCart.quantity += 1;
    } else {
      // Agregar nuevo producto con cantidad 1
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error en addProductToCart:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteProductFromCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity,
    }));
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateProductQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ status: 'error', message: 'Cantidad inválida' });
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    const productInCart = cart.products.find(p => p.product.toString() === pid);
    if (!productInCart) return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
    productInCart.quantity = quantity;
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteAllProductsFromCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    if (!cart.products.length) return res.status(400).json({ status: 'error', message: 'El carrito está vacío' });

    let totalAmount = 0;
    const productsToUpdate = [];
    const failedProducts = [];

    for (const item of cart.products) {
      const product = item.product;
      if (product.stock < item.quantity) {
        failedProducts.push({ product: product.title, requested: item.quantity, available: product.stock });
      } else {
        totalAmount += product.price * item.quantity;
        productsToUpdate.push({ productId: product._id, quantity: item.quantity });
      }
    }

    if (failedProducts.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Algunos productos no tienen stock suficiente',
        failedProducts,
      });
    }

    for (const { productId, quantity } of productsToUpdate) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
    }

    // Como no hay usuario, no ponemos purchaser. Podés pasar purchaser en req.body si querés
    const purchaser = req.body.purchaser || 'cliente_desconocido';

    const ticket = await Ticket.create({
      code: `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      amount: totalAmount,
      purchaser,
    });

    cart.products = [];
    await cart.save();

    res.json({ status: 'success', payload: ticket });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const cartsController = {
  createCart,
  getCartById,
  addProductToCart,
  deleteProductFromCart,
  updateCart,
  updateProductQuantity,
  deleteAllProductsFromCart,
  purchaseCart,
};

export default cartsController;
