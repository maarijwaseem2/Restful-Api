import mongoose, { Document } from 'mongoose';

export interface Product extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
    price: number;
    productImage: string;
}

const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    productImage: { type: String, required: true }
});

export default mongoose.model<Product>('Product', productSchema);
