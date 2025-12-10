import mongoose, { Document, Schema, Model } from 'mongoose';

interface FinancialDataAttrs {
    _id: string;
    amountIn: number;
    amountOut: number;
}

export interface IFinancialData extends Omit<Document, '_id'>, FinancialDataAttrs {}

export const DOCUMENT_ID: string = 'fundraising_data_id';

const FinancialDataSchema: Schema = new Schema({
    _id: { type: String, required: true },
    amountIn: { type: Number, required: true, default: 0 },
    amountOut: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const FinancialDataModel: Model<IFinancialData> = mongoose.model<IFinancialData>('FinancialData', FinancialDataSchema);