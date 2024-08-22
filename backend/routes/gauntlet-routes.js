import { Question } from "../models/Question.js";
import { getAllCategories } from "./questionRouteUtils.js";
import express from 'express';

const router = express.Router();

router.get('/categories', async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json({categories});
    }
    catch(error)
    {

    }

})

export default router;