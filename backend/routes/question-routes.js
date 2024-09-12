import express from "express";
import {
  getNewQuestion,
  obfQuestion,
  updateScoreArray,
  getNewQuestionQueueByTags,
  updateCurrentTotals,
  updateScoresInDatabase,
  updateQuestionCounts,
  calculateDifficulty
} from "./questionRouteUtils.js";
import { createClientData } from "./loginRouteUtils.js";
import { Question, TimeLineQuestion } from "../models/Question.js";
import { NewQuestion } from "../models/NewQuestion.js";
import { RankQuestion } from "../models/Question.js";
import redis from '../redisClient.js'
import { ConnectQuestion } from "../models/Question.js";
import { checkAnswer } from "./questionRouteUtils.js";

const router = express.Router();

/**
 * @route GET /initial-contact
 * @description Initializes client session with a new question and session data.
 * @returns {Object} JSON object containing the obfuscated question, categories, score array, and current totals.
 */
router.get("/initial-contact", async (req, res) => {
  await createClientData(req);
  const newQuestion = await getNewQuestion(req.session.clientData);
  console.log(req.session.clientData.unusedQuestions.length);
  res.send({
    question: obfQuestion(newQuestion),
    categories: req.session.clientData.categories,
    scoreArray: req.session.clientData.scoreArray,
    currentTotals: req.session.clientData.currentTotals,
  });
});

/**
 * @route GET /question
 * @description Retrieves the current question for the client session.
 * @returns {Object} Obfuscated question object.
 */
router.get("/question", async (req, res) => {
  const clientData = req.session.clientData;
  if (clientData.currentQuestion) {
    res.send(obfQuestion(await getNewQuestion(clientData)));
  }
});

/**
 * @route GET /question/rank
 * @description Retrieves a random rank question.
 * @returns {Object} Obfuscated rank question object.
 */
router.get("/question/rank", async (req, res) => {
  const rankQuestion = await RankQuestion.aggregate([{ $sample: { size: 1 } }]);
  res.send(obfQuestion(rankQuestion[0]));
});
/**
 * @route GET /question/connect
 * @description Retrieves a random connect question.
 * @returns {Object} Obfuscated rank connect object.
 */
router.get("/question/connect", async (req, res) => {
  const connectQuestion = await ConnectQuestion.aggregate([{ $sample: { size: 1 } }]);
  res.send((obfQuestion(connectQuestion[0])));
});

router.get("/question/timeLine", async (req, res) => {
  const timeLineQuestion = await TimeLineQuestion.aggregate([{ $sample: { size: 1 } }]);
  res.send(((timeLineQuestion[0])));
});

/**
 * @route GET /question/:tag
 * @description Retrieves a random question filtered by a specific tag.
 * @param {String} tag - The tag to filter questions by.
 * @returns {Object} Obfuscated question object.
 */
router.get("/question/:tag", async (req, res) => {
  const tag = req.params.tag;
  try {
    const tagQuestion = await Question.aggregate([
      { $match: { tags: tag } },
      { $sample: { size: 1 } }
    ]);
    console.log(tagQuestion);
    res.send(obfQuestion(tagQuestion[0]));
  } catch (error) {
    console.log(error);
  }
});

/**
 * @route GET /question/:type/:tag
 * @description Retrieves a question of a question type filtered by a specific tag.
 * @param {String} tag - The tag to filter questions by. 
 * @param {String} type - Question type to get or random to get a random but weighted type
 * @returns {Object} Obfuscated question object.
 */
router.get("/question/:type/:tag", async (req, res, next) => {
  let questionType = req.params.type;
  const tag = req.params.tag;

  try {
    if (questionType === "random") {
      let questionCounts = JSON.parse(await redis.get("questionCounts"));
      delete questionCounts["newQuestions"];
      delete questionCounts["totalQuestions"];

      console.log(questionCounts);
      const questionTypes = Object.keys(questionCounts);
      console.log(questionTypes);
      const weights = Object.values(questionCounts);

      // Create a cumulative weights array
      const cumulativeWeights = weights.reduce((acc, weight, index) => {
        acc.push(weight + (acc[index - 1] || 0));
        return acc;
      }, []);

      console.log("weight", cumulativeWeights);

      // Function to pick a random index based on weights
      const getRandomQuestionType = () => {
        const totalWeight = cumulativeWeights[cumulativeWeights.length - 1];
        const random = Math.random() * totalWeight;

        console.log("random number", random);

        // Find the index in the cumulative weights array
        const index = cumulativeWeights.findIndex((weight) => random < weight);
        console.log("index", index);

        return questionTypes[index];
      };

      const randomQuestionType = getRandomQuestionType();
      console.log(`Randomly selected question type: ${randomQuestionType}`);
      questionType = randomQuestionType;
    }
    let question = {};
    switch (questionType) {
      case "connectQuestions":
        question = obfQuestion((await ConnectQuestion.aggregate([{ $match: { tags: tag } }, { $sample: { size: 1 } }]))[0]);
        break;
      case "rankQuestions":
        question = obfQuestion((await RankQuestion.aggregate([{ $match: { tags: tag } }, { $sample: { size: 1 } }]))[0]);
        break;
      case "oneOfThreeQuestions":
        question = obfQuestion((await Question.aggregate([{ $match: { tags: tag } }, { $sample: { size: 1 } }]))[0]);
        break;
    }

    res.status(200).json(question)
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

/**
 * @route POST /question/answers
 * @description Submits an answer and updates the client's score array and database records.
 * @param {Object} req.body - The submitted answer object.
 * @returns {Object} JSON object containing the updated score array and the correct answer.
 */
router.post("/question/answers", async (req, res) => {
  const clientData = req.session.clientData;

  if (clientData) {
    const answer = req.body.answer;
    const {correct, correctAnswer} = await checkAnswer(clientData.currentQuestion, answer)
    console.log({correct, correctAnswer} )
    clientData.scoreArray = updateScoreArray(clientData, correct);
    res.send({
      scoreArray: clientData.scoreArray,
      correctAnswer: correctAnswer,
    });

    if (req.user && req.user._id) {
      console.log(clientData.currentQuestion);

      updateScoresInDatabase(
        req.user._id,
        clientData.currentQuestion.tags,
        correct
      ).catch((error) => {
        console.error("Failed to update scores in database:", error);
      });
    }
    await updateQuestionCounts(clientData.currentQuestion._id, correct);

  }
});

/**
 * @route POST /question
 * @description Adds a new question to the database.
 * @param {Object} req.body.newQuestion - The question data to add.
 * @returns {String} Success message.
 */
router.post("/question", async (req, res) => {
  try {
    const questionToAdd = req.body.newQuestion;

    const newQuestion = new NewQuestion({
      questionType: questionToAdd.questionType,
      text: questionToAdd.questions,
      correctAnswer: questionToAdd.correctAnswer,
      incorrectAnswers: questionToAdd.answers,
      tags: questionToAdd.categories,
    });

    await newQuestion.save();
    res.status(201).send("Question added successfully");
  } catch (error) {
    console.error("Failed to add question to database", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route GET /new-questions
 * @description Retrieves all new questions. Only accessible by admin users.
 * @returns {Array} Array of new questions.
 */
router.get("/new-questions", async (req, res) => {
  if (req.user && req.user.role === "admin") {
    try {
      const newQuestions = await NewQuestion.find().exec();
      console.log(newQuestions);
      res.send(newQuestions);
    } catch (error) {
      console.error("Failed to fetch new question", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(403).json({ message: "Access denied" });
  }
});

/**
 * @route PUT /new-question/:id
 * @description Updates a specific new question.
 * @param {String} id - The ID of the question to update.
 * @param {Object} req.body - The new data to update the question with.
 * @returns {Object} The updated question object.
 */
router.put("/new-question/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedQuestion = await NewQuestion.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).send("Question not found");
    }

    res.send(updatedQuestion);
  } catch (error) {
    console.error("Failed to update question", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/question/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
    if (!updatedQuestion) {
      return res.status(404).send("Question not found");
    }

    res.send(updatedQuestion);
  } catch (error) {
    console.error("Failed to update question", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route PATCH /new-question/:id
 * @description Accepts a new question, moving it from NewQuestion to Question collection.
 * @param {String} id - The ID of the new question to accept.
 * @returns {Object} The accepted question object.
 */
router.patch("/new-question/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const question = await NewQuestion.findById(id);

    if (!question) {
      return res.status(404).send("Question not found");
    }

    const newQuestion = new Question({
      text: question.text,
      correctAnswer: question.correctAnswer,
      incorrectAnswers: question.incorrectAnswers,
      tags: question.tags,
    });

    await newQuestion.save();
    await NewQuestion.findByIdAndDelete(id);

    res.send(newQuestion);
  } catch (error) {
    console.error("Failed to accept question", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route DELETE /new-question/:id
 * @description Deletes a specific new question.
 * @param {String} id - The ID of the question to delete.
 * @returns {Object} The deleted question object.
 */
router.delete("/new-question/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await NewQuestion.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).send("Question not found");
    }

    res.send(deletedQuestion);
  } catch (error) {
    console.error("Failed to delete question", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @route PATCH /question-queue/
 * @description Updates the client's question queue based on selected categories.
 * @param {Array} req.body.newQuestionCategories - The new question categories.
 * @returns {Object} Response object with a success message and the length of the new question queue.
 */
router.patch("/question-queue/", async (req, res) => {
  const clientData = req.session.clientData;

  clientData.categories = req.body.newQuestionCategories;

  const enabledTags = clientData.categories
    .filter((category) => category.enabled)
    .map((category) => category._id);

  try {
    clientData.cachedQuestions = await getNewQuestionQueueByTags(enabledTags);
    clientData.unusedQuestions = [...clientData.cachedQuestions];
    req.session.save();

    res.status(200).json({
      response: "Ok",
      text: "New question length: ",
      amount: clientData.unusedQuestions.length,
    });
  } catch (err) {
    console.error("Failed to fetch questions by tags:", err);
    res
      .status(500)
      .json({ errorMessage: "Failed to get new question queue", error: err });
  }
});

/**
 * @route GET /questions
 * @description Retrieves all current questions.
 * @returns {Array} Array of question objects.
 */
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /categories
 * @description Retrieves all question categories.
 * @returns {Object} JSON object containing an array of categories.
 */
router.get("/categories", async (req, res) => {
  try {
    const cachedCategories = await redis.get('categories');
    console.log(JSON.parse(await redis.get('questionCounts')));

    if (cachedCategories) {
      res.status(200).json(JSON.parse(cachedCategories));
    } else {
      const categories = await getAllCategories();

      await redis.set('categories', JSON.stringify(categories));

      res.status(200).json(categories);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update the difficulty manually
/*
router.post('/difficulty/:id', async (req, res) => {
  try {
    const questionId = req.params.id;
  
    // Find the question by ID
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Calculate difficult base on correct and incorrect answers counts
    const difficulty = calculateDifficulty(
      question.correctAnswerCount,
      question.incorrectAnswerCount
    );

    // Update the question's difficulty
    await Question.findByIdAndUpdate(questionId, { difficulty });

    return res.status(200).json({ message: 'Difficulty updated', difficulty });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});
*/

router.patch('/difficulty', async (req, res) => {
  try {
    const { questionIds } = req.body;

    // Find all questions by the array of IDs
    const questions = await Question.find({ _id: { $in: questionIds } });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found' });
    }

    // Prepare the update operations
    const bulkOperations = questions.map((question) => {
      const difficulty = calculateDifficulty(
        question.correctAnswerCount,
        question.incorrectAnswerCount
      );

      return {
        updateOne: {
          filter: { _id: question._id },
          update: { $set: { difficulty } }
        }
      };
    });

    // Perform all updates at once
    await Question.bulkWrite(bulkOperations);

    return res.status(200).json({ message: 'Difficulties updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});


export default router;
