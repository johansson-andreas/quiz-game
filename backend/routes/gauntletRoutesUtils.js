import { RankQuestion } from "../models/RankQuestion.js";

export const handleRankAnswer = async (question, submittedAnswer) => {
    question = await RankQuestion.findById(question.id);
    let correctAnswer = []

    let correct = false;
    if (!question)
      return false;

    // Check if lifeline has been used in which case remove the options from the correct order which arent part of the submitted answer
    if (submittedAnswer.length < question.correctOrder.length) {
        correctAnswer = question.correctOrder.filter(option => {if(submittedAnswer.includes(option)) return option})
        correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
    }
    else {
        correctAnswer = question.correctOrder;
        correct = JSON.stringify(correctAnswer) === JSON.stringify(submittedAnswer);
    }

    return {correct, correctAnswer};
}