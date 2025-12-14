import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FinancialDataModel, DOCUMENT_ID } from '../models/financialDataModel';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL; 


const initializeData = async (): Promise<void> => {
    const amountInInitial = Number(process.env.INITIAL_AMOUNT_IN) || 0; 
    const amountOutInitial = Number(process.env.INITIAL_AMOUNT_OUT) || 0; 

    const doc = await FinancialDataModel.findById(DOCUMENT_ID);
    
    if (!doc) {
        await FinancialDataModel.create({
            _id: DOCUMENT_ID,
            amountIn: amountInInitial, 
            amountOut: amountOutInitial
        });
        console.log(`Initial document created in MongoDB (starting at ${amountInInitial}).`);
    } else {
        console.log('Existing document found and ready.');
    }
};


export const connectDB = async (): Promise<void> => {
    if (!MONGO_URI) {
        console.error('FATAL ERROR: MongoDB connection URI is missing.');
        console.error('Please ensure MONGO_URI or MONGO_URL is correctly set in your .env file.');
        process.exit(1); 
    }

    try {
        await mongoose.connect(MONGO_URI as string); 
        console.log('MongoDB successfully connected.');
        
        await initializeData();

    } catch (err) {
        console.error('MongoDB connection error:', err, '\nExiting process.');
        process.exit(1);
    }
};

export const db = mongoose.connection;