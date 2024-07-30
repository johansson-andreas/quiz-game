import { Account } from "../models/Account.js";

export const getTotalScoreArray = async (req) => {
    try{
        const totalScoreArray = await Account.findById(req.user._id).select('categoryStats');
        return {statusCode:200, data:totalScoreArray}
    }
    catch (error)
    {
        throw error;
    }


};