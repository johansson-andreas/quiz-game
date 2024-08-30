import { RankQuestion } from "../models/RankQuestion.js";
import { Question } from "../models/Question.js";
import {
  getAllCategories,
  updateQuestionCounts,
  updateScoreArray,
} from "./questionRouteUtils.js";
import express from "express";
import redis from "../redisClient.js";

const router = express.Router();

router.post("/questions/answer", async (req, res, next) => {
  const { questionData, submittedAnswer: submittedAnswer } = req.body;
  console.log(req.body);
  console.log(questionData);
  const questionID = questionData.id;

  let question = {};
  let correct = false;
  let correctAnswer = {};

  try {
    switch (questionData.questionType) {
      case "rank":
        question = await RankQuestion.findById(questionID);
        if (!question) return res.status(404).send({ error: "Question not found" });
        
        correct = JSON.stringify(question.correctOrder) === JSON.stringify(submittedAnswer);
        correctAnswer = question.correctOrder;
        break;
      case "oneOfThree":
        question = await Question.findById(questionID);
        if (!question) return res.status(404).send({ error: "Question not found" });
        
        correct = question.correctAnswer === submittedAnswer;
        correctAnswer = question.correctAnswer;

        break;
      default:
        return res.status(400).send({ error: "Invalid question type" });
    }

    updateQuestionCounts(questionID, correct);

    res.status(200).json({ correctAnswer, correct });
     } catch (error) {
    console.error("Error processing answer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
