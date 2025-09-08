// src/controllers/productsController.js
import Product from '../models/Product.js';

const getProducts = async (req, res) => {
  try {
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
    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?limit=${limit}&page=${result.prevPage}${
            sort ? `&sort=${sort}` : ''
          }${query ? `&query=${query}` : ''}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?limit=${limit}&page=${result.nextPage}${
            sort ? `&sort=${sort}` : ''
          }${query ? `&query=${query}` : ''}`
        : null,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product)
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length) {
      return res
        .status(400)
        .json({ status: 'error', message: `Faltan campos obligatorios: ${missingFields.join(', ')}` });
    }
    if (req.body.price < 0 || req.body.stock < 0) {
      return res
        .status(400)
        .json({ status: 'error', message: 'El precio y el stock deben ser mayores o iguales a 0' });
    }

    // Sin owner ni usuario
    const productData = {
      ...req.body,
      owner: null,
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json({ status: 'success', payload: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'El código de producto ya existe' });
    }
    res.status(500).json({ status: 'error', message: error.message || 'Error al crear el producto' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product)
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    res.json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product)
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

    await Product.findByIdAndDelete(req.params.pid);
    res.json({ status: 'success', message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
