const socket = io();
const form = document.getElementById('addProductForm');
const productList = document.getElementById('productList');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const product = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      code: 'CODE-' + Date.now(),
      stock: 10,
      category: 'general',
      status: true,
    };
    socket.emit('addProduct', product);
    form.reset();
  });
}

socket.on('updateProducts', (products) => {
  if (productList) {
    productList.innerHTML = '';
    products.forEach(product => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `${product.title} - $${product.price}`;
      productList.appendChild(li);
    });
  }
});