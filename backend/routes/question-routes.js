import express from "express";
import {
  getNewQuestion,
  obfQuestion,
  updateScoreArray,
  getNewQuestionQueueByTags,
  updateCurrentTotals,
  updateScoresInDatabase,
  updateQuestionCounts
} from "./questionRouteUtils.js";
import { createClientData } from "./loginRouteUtils.js";
import { Question } from "../models/Question.js";
import { NewQuestion } from "../models/NewQuestion.js";

const router = express.Router();

const timeLog = async (req, res, next) => {
  if (!req.session.clientData) {
    console.log("Found no data for", req.sessionID, "creating new data");
    await createClientData(req);
    await getNewQuestion(req.session.clientData);
    next();
  } else next();
};
router.use(timeLog);

router.get("/question", async (req, res, next) => {
  const clientData = req.session.clientData;

  if (clientData.currentQuestion)
    res.send(obfQuestion(await getNewQuestion(clientData)));
});

router.get("/question/:tag", async (req, res, next) => {
  const tag = req.params.tag;
  try{
    const tagQuestion = await Question.aggregate([{ $match: { tags: tag } },{ $sample: { size: 1 } }]);  
    console.log(tagQuestion);
    res.send(obfQuestion((tagQuestion)[0]));
  }
  catch (error) 
  {
    console.log(error);
  }
});

router.get("/initial-contact", async (req, res) => {
  // Access session data
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

router.post("/answer/:submittedAnswer", async (req, res) => { 
  const clientData = req.session.clientData;

  if (clientData) {
    const answer = req.params.submittedAnswer;
    let correct = false;
    if (answer === clientData.currentQuestion.correctAnswer) correct = true;

    clientData.scoreArray = updateScoreArray(clientData, correct);
    //clientData.currentTotals = updateCurrentTotals(clientData, correct);
    res.send({
      scoreArray: clientData.scoreArray,
      correctAnswer: clientData.currentQuestion.correctAnswer,
    });

    //Update database if user in logged in
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

router.post("/question", async (req, res) => {
  try {
    const questionToAdd = req.body.newQuestion;

    const newQuestion = new NewQuestion({
      text: questionToAdd.questions,
      correctAnswer: questionToAdd.correctAnswer,
      incorrectAnswers: questionToAdd.answers,
      tags: questionToAdd.categories,
    });

    // Save the new document
    await newQuestion.save();
    res.status(201).send("Question added successfully");
  } catch (error) {
    console.error("Failed to add question to database", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/new-questions", async (req, res) => {
  // Check if user is inlogged and has 'admin' role
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
    res.status(403).json({ message: "Access denied" }); // Forbidden
  }
});
// Route to update a question
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
// Route to accept a question (move from NewQuestion to Question)
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
// Route to delete a question
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

// Hämta aktuella frågor
router.get("/questions", async (req, res) => {
  try {
    // Hämta alla frågor från databasen
    const questions = await Question.find({});
    res.json(questions); // Skicka tillbaka som JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


