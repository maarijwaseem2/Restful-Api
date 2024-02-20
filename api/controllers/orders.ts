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
console.log('Connected to MySQL database from orders');
});

connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        product_id INT(11) NOT NULL,
        quantity INT default 1,
        FOREIGN KEY (product_id) REFERENCES products(id)
    )
`, (err, result) => {
    if (err) {
        console.error('Error creating orders table: ', err);
    } else {
        console.log('Orders table created');
    }
});

export const orders_get_all = (req: Request, res: Response, next: NextFunction) => {
  const sql = 'SELECT o._id, o.quantity, p.name AS productName FROM orders o INNER JOIN products p ON o.product = p._id';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders: ', err);
      res.status(500).json({ error: err });
      return;
    }
    if (Array.isArray(results)) {
      res.status(200).json({
        count: results.length,
        orders: results.map((order: any) => {
          return {
            _id: order._id,
            product: order.productName,
            quantity: order.quantity,
            request: {
              type: 'GET',
              url: `http://localhost:3000/orders/${order._id}`
            }
          };
        })
      });
    } else {
      console.error('Unexpected result format: ', results);
      res.status(500).json({ error: 'Unexpected result format' });
    }
  });
};

export const orders_create_order = (req: Request, res: Response, next: NextFunction) => {
  const { productId, quantity } = req.body;
  const sql = 'INSERT INTO orders (product, quantity) VALUES (?, ?)';
  connection.query(sql, [productId, quantity], (err, result:any) => {
    if (err) {
      console.error('Error creating order: ', err);
      res.status(500).json({ error: err });
      return;
    }
    res.status(201).json({
      message: 'Order stored',
      createdOrder: {
        _id: result.insertId,
        product_id: productId,
        quantity: quantity
      },
      request: {
        type: 'GET',
        url: `http://localhost:3000/orders/${result.insertId}`
      }
    });
  });
};

export const orders_get_order = (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;
  const sql = 'SELECT * FROM orders WHERE _id = ?';
  connection.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error fetching order: ', err);
      res.status(500).json({ error: err });
      return;
    }
    if (Array.isArray(results) && results.length > 0) {
      const order = results[0];
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: `http://localhost:3000/orders`
        }
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  });
};

export const orders_delete_order = (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;
  const sql = 'DELETE FROM orders WHERE _id = ?';
  connection.query(sql, [orderId], (err, result) => {
    if (err) {
      console.error('Error deleting order: ', err);
      res.status(500).json({ error: err });
      return;
    }
    res.status(200).json({
      message: 'Order deleted',
      request: {
        type: 'POST',
        url: 'http://localhost:3000/orders',
        body: { productId: 'ID', quantity: 'Number' }
      }
    });
  });
};