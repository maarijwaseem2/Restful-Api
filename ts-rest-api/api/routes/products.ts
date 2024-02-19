import { Router , Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import checkAuth from "../middleware/check-auth";
import * as ProductsController from "../controllers/products";

const router = Router();

const storage = multer.diskStorage({
  
  destination: function (req: Request, file: any, cb: any) {
    cb(null, './uploads/');
  },
  filename: function (req: Request, file: any, cb: any) {
    const timestamp = new Date().toISOString().replace(/:/g, '_');
    cb(null, timestamp + '_' + file.originalname);
  }
});

const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", ProductsController.products_get_all);

router.post("/", checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get("/:productId", ProductsController.products_get_product);

router.patch("/:productId", checkAuth, ProductsController.products_update_product);

router.delete("/:productId", checkAuth, ProductsController.products_delete);

export default router;
