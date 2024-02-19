import { Request, Response, NextFunction, response } from 'express';
import mongoose, { Types } from 'mongoose';
import Order from '../models/order';
import Product from '../models/product';

export const orders_get_all = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docs = await Order.find()
      .select("product quantity _id")
      .populate("product", "name")
      .exec();

    res.status(200).json({
      count: docs.length,
      orders: docs.map(doc => {
        return {
          _id: doc._id,
          product: doc.product,
          quantity: doc.quantity,
          request: {
            type: "GET",
            url: `http://localhost:3000/orders/${doc._id}`
          }
        };
      })
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};

export const orders_create_order = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const order = new Order({
      _id: new Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId
    });
    const result = await order.save();

    res.status(201).json({
      message: "Order stored",
      createdOrder: {
        _id: result._id,
        product: result.product,
        quantity: result.quantity
      },
      request: {
        type: "GET",
        url: `http://localhost:3000/orders/${result._id}`
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err
    });
  }
};

export const orders_get_order = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("product")
      .exec();

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      order: order,
      request: {
        type: "GET",
        url: `http://localhost:3000/orders`
      }
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};

export const orders_delete_order = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Order.deleteOne({ _id: req.params.orderId }).exec();

    res.status(200).json({
      message: "Order deleted",
      request: {
        type: "POST",
        url: "http://localhost:3000/orders",
        body: { productId: "ID", quantity: "Number" }
      }
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};
