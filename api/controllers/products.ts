import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ts-restful-api"
});

connection.connect((err) => {
if (err) {
  console.error('Database connection failed: ' + err.stack);
  return;
}
console.log('Connected to MySQL database from products');
});

connection.query(`
  CREATE TABLE IF NOT EXISTS products (
      id INT(11) AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      productImage BLOB NOT NULL
  )
`, (err, result) => {
  if (err) {
      console.error('Error creating products table: ', err);
  } else {
      console.log('Products table created');
  }
});

export const products_get_all = (req: Request, res: Response, next: NextFunction) => {
  const sql = 'SELECT name, price, id as _id, productImage FROM products';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching products: ', err);
      res.status(500).json({ error: err });
      return;
    }
    if (Array.isArray(results)) {
    res.status(200).json({
      count: results.length,
      products: results.map((product: any) => {
        return {
          name: product.name,
          price: product.price,
          productImage: product.productImage,
          _id: product._id,
          request: {
            type: 'GET',
            url: `http://localhost:3000/products/${product._id}`
          }
        };
      })
    });
  }
  else{
    console.error('Unexpected result format: ', results);
    res.status(500).json({ error: 'Unexpected result format' });
  }
});
};

export const products_create_product = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded'
    });
  }
  const { name, price } = req.body;
  const productImage = req.file.path;
  const sql = 'INSERT INTO products (name, price, productImage) VALUES (?, ?, ?)';
  connection.query(sql, [name, price, productImage], (err, result:any) => {
    if (err) {
      console.error('Error creating product: ', err);
      res.status(500).json({ error: err });
      console.log(res.status(500).json({ error: err }))
      return;
    }
    res.status(201).json({
      message: 'Created product successfully',
      createdProduct: {
        name,
        price,
        _id: result.insertId,
        request: {
          type: 'GET',
          url: `http://localhost:3000/products/${result.insertId}`
        }
      }
    });
  });
};

export const products_get_product = (req: Request, res: Response, next: NextFunction) => {
  const productId = req.params.productId;
  console.log(productId);
  const sql = 'SELECT * FROM products WHERE id = ?';
  connection.query(sql, [productId], (err, results:any) => {
      if (err) {
          console.error('Error fetching product: ', err);
          res.status(500).json({ error: err });
          return;
      }
      if (results.length === 0) {
          res.status(404).json({ message: 'No valid entry found for provided ID' });
          return;
      }
      const product = results[0];
      res.status(200).json({
          product: {
              _id: product.id,
              name: product.name,
              price: product.price,
              productImage: product.productImage
          },
          request: {
              type: 'GET',
              url: 'http://localhost:3000/products'
          }
      });
  });
};

export const products_update_product = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  const updateOps: any = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  const sql = 'UPDATE products SET ? WHERE id = ?';
  connection.query(sql, [updateOps, id], (err, result) => {
    if (err) {
      console.error('Error updating product: ', err);
      res.status(500).json({ error: err });
      return;
    }
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'GET',
        url: `http://localhost:3000/products/${id}`
      }
    });
  });
};

export const products_delete = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  const sql = 'DELETE FROM products WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting product: ', err);
      res.status(500).json({ error: err });
      return;
    }
    res.status(200).json({
      message: 'Product deleted',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/products',
        body: { name: 'String', price: 'Number' }
      }
    });
  });
};