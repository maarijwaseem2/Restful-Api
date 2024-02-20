import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ts-restful-api"
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL from User');
});

connection.query(`
  CREATE TABLE IF NOT EXISTS users (
      id INT(11) AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
  )
`, (err, result) => {
  if (err) {
      console.error('Error creating users table: ', err);
  } else {
      console.log('Users table created');
  }
});

export const user_signup = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results:any) => {
    if (err) {
      console.error('Error finding user: ', err);
      res.status(500).json({ error: err });
      return;
    }
    if (results.length >= 1) {
      return res.status(409).json({ message: "Mail exists" });
    } else {
      bcrypt.hash(password, 10, (err, hash: string) => {
        if (err) {
          return res.status(500).json({ error: err });
        } else {
          const sqlInsert = 'INSERT INTO users (email, password) VALUES (?, ?)';
          connection.query(sqlInsert, [email, hash], (err, result) => {
            if (err) {
              console.error('Error creating user: ', err);
              res.status(500).json({ error: err });
              return;
            }
            console.log(result);
            res.status(201).json({ message: "User created" });
          });
        }
      });
    }
  });
};

export const user_login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  connection.query(sql, [email], (err, results:any) => {
    if (err) {
      console.error('Error finding user: ', err);
      res.status(500).json({ error: err });
      return;
    }
    if (results.length < 1) {
      return res.status(401).json({ message: "User not found" });
    }
    bcrypt.compare(password, results[0].password, (err, result: boolean) => {
      if (err) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      if (result) {
        if (!process.env.JWT_KEY) {
          return res.status(500).json({ message: "JWT secret key is not defined" });
        }
        const token = jwt.sign(
          { email: results[0].email, userId: results[0].id },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );
        return res.status(200).json({ message: "Auth successful", token });
      }
      res.status(401).json({ message: "Incorrect password" });
    });
  });
};

export const user_delete = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;
  const sql = 'DELETE FROM users WHERE id = ?';
  connection.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user: ', err);
      res.status(500).json({ error: err });
      return;
    }
    res.status(200).json({ message: "User deleted" });
  });
};