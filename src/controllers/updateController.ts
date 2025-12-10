import { Request, Response } from 'express';
import { updateFinancialData, broadcastLatestData, getLatestData } from '../services/financialDataServices'

interface IncrementBody { 
    changeAmount: number; 
}

interface LatestDataResponse {
    amountIn: number;
    amountOut: number;
}

export const getLatestDataState = async (req: Request, res: Response<LatestDataResponse | { error: string }>) => {
    try {
        const data = await getLatestData();
        
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(404).json({ error: 'Latest data document not found. Check database initialization.' });
        }
    } catch (error) {
        console.error('Error handling GET request:', error);
        return res.status(500).json({ error: 'Failed to retrieve data.' });
    }
};


export const updateAmountIn = async (req: Request<{}, {}, IncrementBody>, res: Response) => {
    const { changeAmount } = req.body;

    if (changeAmount === undefined || typeof changeAmount !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid changeAmount in request body. Must be a number.' });
    }

    try {
        const updatedDoc = await updateFinancialData('amountIn', changeAmount);
        
        if (updatedDoc) {
            await broadcastLatestData();
            return res.status(200).json({ 
                message: `Amount In successfully increased by ${changeAmount}.`, 
                newData: updatedDoc 
            });
        } else {
            return res.status(404).json({ error: 'Data document not found.' });
        }
    } catch (error) {
        console.error('Error updating amount in:', error);
        return res.status(500).json({ error: 'Database update failed.' });
    }
};

export const updateAmountOut = async (req: Request<{}, {}, IncrementBody>, res: Response) => {
    const { changeAmount } = req.body;

    if (changeAmount === undefined || typeof changeAmount !== 'number' || changeAmount <= 0) {
        return res.status(400).json({ error: 'Missing or invalid changeAmount. Must be a positive number for increment.' });
    }

    try {
        const currentData = await getLatestData();

        if (!currentData) {
            return res.status(404).json({ error: 'Data document not found for balance check.' });
        }

        const { amountIn, amountOut } = currentData;
        const potentialNewAmountOut = amountOut + changeAmount;
        
        if (potentialNewAmountOut > amountIn) {
            console.warn(`Blocked withdrawal attempt: ${potentialNewAmountOut} exceeds funds in: ${amountIn}`);
            
            const maxAllowed = amountIn - amountOut;

            return res.status(403).json({ 
                error: 'Insufficient Funds', 
                message: `Withdrawal of ₦${changeAmount.toLocaleString()} is not allowed. Max available funds are ₦${maxAllowed.toLocaleString()}.`,
                currentAmountIn: amountIn,
                currentAmountOut: amountOut
            });
        }
        
        const updatedDoc = await updateFinancialData('amountOut', changeAmount);

        if (updatedDoc) {
            await broadcastLatestData();
            return res.status(200).json({ 
                message: `Amount Out successfully increased by ${changeAmount.toLocaleString()}. Funds are sufficient.`, 
                newData: updatedDoc 
            });
        } else {
             return res.status(404).json({ error: 'Data document not found for atomic update.' });
        }

    } catch (error) {
        console.error('Error processing updateAmountOut:', error);
        return res.status(500).json({ error: 'Database operation failed during fund check.' });
    }
};
//     const { changeAmount } = req.body;

//     if (changeAmount === undefined || typeof changeAmount !== 'number') {
//         return res.status(400).json({ error: 'Missing or invalid changeAmount in request body. Must be a number.' });
//     }

//     try {
//         const updatedDoc = await updateFinancialData('amountOut', changeAmount);

//         if (updatedDoc) {
//             await broadcastLatestData();
//             return res.status(200).json({ 
//                 message: `Amount Out successfully increased by ${changeAmount}.`, 
//                 newData: updatedDoc 
//             });
//         } else {
//             return res.status(404).json({ error: 'Data document not found.' });
//         }
//     } catch (error) {
//         console.error('Error updating amount out:', error);
//         return res.status(500).json({ error: 'Database update failed.' });
//     }
// };
