import { Question } from "../models/Question.js";
import { getAllCategories, updateQuestionCounts, updateScoreArray } from "./questionRouteUtils.js";
import express from "express";

const router = express.Router();

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
  }
});

router.post("/questions/answer", async (req, res, next) => {
  const { questionID, answer: submittedAnswer } = req.body;

  try {
    const question = await Question.findById(questionID);

    if (!question) {
      return res.status(404).send({ error: "Question not found" });
    }

    const correct = question.correctAnswer === submittedAnswer;

    updateQuestionCounts(questionID, correct);

    res.status(200).json({ correctAnswer: question.correctAnswer, correct });
  } catch (error) {
    console.error("Error processing answer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
