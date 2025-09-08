// src/controllers/viewsController.js
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

export const renderProducts = async (req, res) => {
  try {
    // Parámetros de paginación, filtro y orden
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = query
      ? query === 'available'
        ? { status: true, stock: { $gt: 0 } }
        : { category: query }
      : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
    };

    const result = await Product.paginate(filter, options);

    // 1. Buscar carrito en sesión
    let cartId = req.session.cartId;

    // 2. Si no existe carrito, crear uno vacío y guardar su id en sesión
    if (!cartId) {
      const newCart = await Cart.create({ products: [] });
      cartId = newCart._id.toString();
      req.session.cartId = cartId;
    }

    // 3. Renderizar vista pasando el cartId correcto
    res.render('index', {
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${
            query ? `&query=${query}` : ''
          }`
        : null,
      nextLink: result.hasNextPage
        ? `/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${
            query ? `&query=${query}` : ''
          }`
        : null,
      cartId,
    });
  } catch (error) {
    res.status(500).send('Error al renderizar productos');
  }
};

export const renderProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');

    // Sin carrito en session ni creación automática
    const cartId = null;

    res.render('product', { product, cartId });
  } catch (error) {
    res.status(500).send('Error al renderizar producto');
  }
};

export const renderCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).send('Error al renderizar carrito');
  }
};
