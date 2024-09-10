import { OoTQuestion, RankQuestion, Question } from "../models/Question.js";

import {
  getAllCategories,
  updateQuestionCounts,
  updateScoreArray,
  obfQuestion,
  getQuestionByIDAndType,
} from "./questionRouteUtils.js";
import express from "express";
import redis from "../redisClient.js";
import { ConnectQuestion } from "../models/Question.js";
import { handleRankAnswer, handleConnectAnswer } from "./gauntletRoutesUtils.js";
import { addNewScoreToGauntletHistory } from "./gauntletRoutesUtils.js";
import { Account } from "../models/Account.js";
import { halfObjectProperties } from "../utils/generalUtils.js";

const router = express.Router();

router.get("/question", async (req, res) => {
  const { type, tag, difficulty } = req.query;
  let questionType = type;

  try {
    // Function to get a random question type based on weights
    const getRandomQuestionType = (questionCounts) => {
      const questionTypes = Object.keys(questionCounts);
      const weights = Object.values(questionCounts);
      
      // Create cumulative weights array
      const cumulativeWeights = weights.reduce((acc, weight, index) => {
        acc.push(weight + (acc[index - 1] || 0));
        return acc;
      }, []);

      const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
      const random = Math.random() * totalWeight;
      
      return questionTypes[cumulativeWeights.findIndex(weight => random < weight)];
    };

    if (questionType === "random") {
      const questionCounts = JSON.parse(await redis.get("questionCounts"));
      delete questionCounts["newQuestions"];
      delete questionCounts["totalQuestions"];

      questionType = getRandomQuestionType(questionCounts);
      console.log(`Randomly selected question type: ${questionType}`);
    }

    // Define aggregation queries for each question type
    const aggregationQueries = {
      connect: [{ $sample: { size: 1 } }],
      rank: [
        { $match: { tags: tag } },
        { $sample: { size: 1 } }
      ],
      oot: [
        { $match: { tags: tag } },
        { $sample: { size: 1 } }
      ]
    };

    if (!aggregationQueries[questionType]) {
      throw new Error(`Unknown question type: ${questionType}`);
    }

    // Fetch question based on the selected type
    const [question] = await {
      connect: ConnectQuestion.aggregate(aggregationQueries.connect),
      rank: RankQuestion.aggregate(aggregationQueries.rank),
      oot: OoTQuestion.aggregate(aggregationQueries.oot)
    }[questionType];

    const obfuscatedQuestion = obfQuestion(question);
    console.log("Question", obfuscatedQuestion);
    res.status(200).json(obfuscatedQuestion);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/question/:id", async (req, res) => {
  const  id  = req.params.id;
  
  try {
    const question = await Question.findById(id).lean().exec();

    res.status(200).json(obfQuestion(question))
  }
  catch (error)
  {
    console.log(error);
    res.status(500).json(error);
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
        ({correct, correctAnswer} = await handleRankAnswer(questionData, submittedAnswer))
        break;
      case "oneOfThree":
        question = await OoTQuestion.findById(questionID);
        if (!question)
          return res.status(404).send({ error: "Question not found" });

        correct = question.correctAnswer === submittedAnswer;
        correctAnswer = question.correctAnswer;
        break;
        case "connect":
          ({correct, correctAnswer} = await handleConnectAnswer(questionData, submittedAnswer))
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

router.get("/lifelines/:type/:id", async (req, res) => {
  const { type: lifelineType, id: questionID } = req.params;
  const { qtype: questionType } = req.query;

  console.log(lifelineType, questionID, questionType);

  const question = await getQuestionByIDAndType(questionID, questionType);

  switch (lifelineType) {
    case "fifty":
      switch (questionType) {
        case "oneOfThree":
          //Fifty - One of three logic
          question.incorrectAnswers = question.incorrectAnswers.splice(0, 1);
          res.status(200).json({ question: obfQuestion(question) });
          break;
        case "connect":
          question.connectedPairs = halfObjectProperties(question.connectedPairs)
          res.status(200).json({ question: obfQuestion(question) });

          break;
        case "rank":
          question.correctOrder.splice(
            0,
            Math.floor(question.correctOrder.length / 2)
          );
          res.status(200).json({ question: obfQuestion(question) });
          break;
      }
      break;
    case "pass":
      res.status(200).json({ question });
      {
      
      
      }
  }
});

router.get("/categories", async (req, res) => {
  try {
    const cachedCategories = JSON.parse(await redis.get("categories"));
    console.log(JSON.parse(await redis.get("questionCounts")));

    if (cachedCategories) {
      res.status(200).json((cachedCategories));
    } else {
      const categories = await getAllCategories();

      await redis.set("categories", JSON.stringify(categories));

      res.status(200).json(categories);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/questions", async (req,res) => {
  const questions = JSON.parse(await redis.get('questionsByTag'));
  console.log(questions)

  res.status(200).json(questions);
})

router.post("/score", async (req,res, next) => {
  const user = req.user.id;
  const updatedData = await addNewScoreToGauntletHistory(user, req.body.newScore)
  console.log('updated data', updatedData)
  res.send(updatedData)

})
router.get("/score", async (req, res, next) => {
  const user = req.user.id;
  const gauntletHistory = await Account.findById(user, 'gauntletHistory').lean().exec();
  console.log(gauntletHistory)
  res.send(gauntletHistory)
})



export default router;
