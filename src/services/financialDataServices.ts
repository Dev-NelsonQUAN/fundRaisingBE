import { FinancialDataModel, IFinancialData, DOCUMENT_ID } from '../models/financialDataModel';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

interface BroadcastData {
    amountIn: number;
    amountOut: number;
}

export const initSocket = (socketServer: SocketIOServer) => {
    io = socketServer;
};

export const broadcastLatestData = async (): Promise<void> => {
    try {
        const latestData = await FinancialDataModel.findById(DOCUMENT_ID);

        if (latestData && io) {
            const dataToBroadcast: BroadcastData = {
                amountIn: latestData.amountIn,
                amountOut: latestData.amountOut
            };
            io.emit('realtimeDataUpdate', dataToBroadcast);
            console.log('Data broadcasted from DB:', dataToBroadcast);
        }
    } catch (error) {
        console.error('Error broadcasting data:', error);
    }
};


export const getLatestData = async (): Promise<BroadcastData | null> => {
    try {
        const latestDoc = await FinancialDataModel.findById(DOCUMENT_ID);

        if (latestDoc) {
            return {
                amountIn: latestDoc.amountIn,
                amountOut: latestDoc.amountOut
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching latest data:', error);
        return null;
    }
};


export const updateFinancialData = async (field: 'amountIn' | 'amountOut', value: number): Promise<IFinancialData | null> => {
    
    const updateQuery = { $inc: { [field]: value } }; 

    const updatedDoc = await FinancialDataModel.findByIdAndUpdate(
        DOCUMENT_ID,
        updateQuery,
        { new: true, runValidators: true }
    );

    return updatedDoc;
};