import mongoose, { Document } from 'mongoose';

export interface Order extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    product: mongoose.Schema.Types.ObjectId;
    quantity: number;
}

const orderSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 }
});

export default mongoose.model<Order>('Order', orderSchema);
