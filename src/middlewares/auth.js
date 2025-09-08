// Middleware para restringir la gestión de productos a admin o premium (sin restricciones)
export const restrictProductManagement = async (req, res, next) => {
  next();
};

// Middleware para restringir el acceso al carrito (sin restricciones)
export const restrictCartAccess = async (req, res, next) => {
  next();
};

// Middleware para restringir compras según roles (sin restricciones)
export const restrictPurchase = async (req, res, next) => {
  next();
};
