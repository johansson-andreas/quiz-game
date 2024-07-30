import express from 'express';
import { getTotalScoreArray } from './profileRouteUtils.js';

const router = express.Router();


router.get('/get-total-score-array', async (req,res) => {
    try {
        const { statusCode, data } = await getTotalScoreArray(req);
        res.status(statusCode).json(data);
      } catch (error) {
        console.error('Error in request-question:', error);
        res.status(500).json({ status: "error", message: error.message });
      }
});

export default router;