import { RankQuestion } from "../models/RankQuestion.js";
import { Question } from "../models/Question.js";
import {
  getAllCategories,
  updateQuestionCounts,
  updateScoreArray,
  obfOoTQuestion as obfOoTQuestion, 
  obfRankQuestion,
  obfConnectQuestion,
  getQuestionByIDAndType
} from "./questionRouteUtils.js";
import express from "express";
import redis from "../redisClient.js";
import { ConnectQuestion } from "../models/ConnectQuestion.js";

const router = express.Router();

router.get("/question/:type/:tag", async (req, res, next) => {
  let questionType = req.params.type;
  const tag = req.params.tag;

  try {
    if (questionType === "random") {
      let questionCounts = JSON.parse(await redis.get("questionCounts"));
      delete questionCounts["newQuestions"];
      delete questionCounts["totalQuestions"];

      const questionTypes = Object.keys(questionCounts);
      const weights = Object.values(questionCounts);

      // Create a cumulative weights array
      const cumulativeWeights = weights.reduce((acc, weight, index) => {
        acc.push(weight + (acc[index - 1] || 0));
        return acc;
      }, []);


      // Function to pick a random index based on weights
      const getRandomQuestionType = () => {
        const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
        const random = Math.random() * totalWeight;

        // Find the index in the cumulative weights array
        const index = cumulativeWeights.findIndex((weight) => random < weight);

        return questionTypes[index];
      };

      // Example usage
      const randomQuestionType = getRandomQuestionType();
      console.log(`Randomly selected question type: ${randomQuestionType}`);
      questionType = randomQuestionType;
    }
    let question = {};
    console.log('questiontype', questionType)
    switch (questionType) {
      case "connectQuestions":
        question = obfConnectQuestion((await ConnectQuestion.aggregate([{ $sample: { size: 1 } }]))[0]);
        break;
      case "rankQuestions":
        question = obfRankQuestion((await RankQuestion.aggregate([{ $match: { tags: tag } }, { $sample: { size: 1 } }]))[0]);
        break;
      case "oneOfThreeQuestions":
        question = obfOoTQuestion((await Question.aggregate([{ $match: { tags: tag } }, { $sample: { size: 1 } }]))[0]);
        break;
    }

    console.log("Question", question);
    res.status(200).json(question)
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.post("/questions/answer", async (req, res, next) => {
  const { questionData, submittedAnswer } = req.body;
  const questionID = questionData.id;

  let question = {};
  let correct = false;
  let correctAnswer = {};

  try {
    switch (questionData.questionType) {
      case "rank":
        question = await RankQuestion.findById(questionID);
        if (!question)
          return res.status(404).send({ error: "Question not found" });

        correct =
          JSON.stringify(question.correctOrder) ===
          JSON.stringify(submittedAnswer);
        correctAnswer = question.correctOrder;
        break;
      case "oneOfThree":
        question = await Question.findById(questionID);
        if (!question)
          return res.status(404).send({ error: "Question not found" });

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

router.get('/lifelines/:type/:id', async (req, res) => {
  const { type: lifelineType, id: questionID } = req.params;
  const { qtype: questionType } = req.query;

  console.log(lifelineType, questionID, questionType)

    const question = await getQuestionByIDAndType(questionID, questionType);

    switch (lifelineType) {
      case "fifty":
        switch (questionType) {
          case "oneOfThree":
            //Fifty - One of three logic
            question.incorrectAnswers = question.incorrectAnswers.splice(0,1);
            res.status(200).json({question: obfOoTQuestion(question)})
            break;
          case "connect":
            //Fifty - connect logic
            break;
          case "rank":
            //Fifty - rank logic
            break;
        }
        break;
      case "pass":
        res.status(200).json({question})
        break;
      default:
        break;
    }
});

export default router;
