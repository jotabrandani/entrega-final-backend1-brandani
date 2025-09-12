import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  thumbnail: { type: String },
  code: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, min: 0 },
  status: { type: Boolean, default: true },
  category: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('products', productSchema);

export default Product;
