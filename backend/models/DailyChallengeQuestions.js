import mongoose from 'mongoose';
import { uniqueIndexes } from '../routes/dailyChallengeRouteUtils.js';
import { Question } from "../models/Question.js";


const Schema = mongoose.Schema;

const dailyChallengeQuestionsSchema = new Schema({
    date: { type: Date, index: true },
    questionIDs: [String],
});

export const DailyChallengeQuestions = mongoose.model('DailyChallengeQuestions', dailyChallengeQuestionsSchema);

export const generateNewQuestions = async () => {
    try {
        const possibleQuestions = await Question.find().distinct('_id').lean().exec();
        console.log(possibleQuestions.length)

        // Shuffle and select random questions
        let questionIds = [];
        let randomIds = uniqueIndexes(10, possibleQuestions.length)
        console.log(randomIds);

        randomIds.forEach((index) => {
            questionIds.push(possibleQuestions[index]._id.toString());
        });

        // Create a new Date object for the start of the day
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day (00:00:00.000)

        // Create a new document for today's questions
        const newDailyChallengeQuestions = new DailyChallengeQuestions({
            date: today,
            questionIDs: questionIds,
        });

        // Save the new document
        await newDailyChallengeQuestions.save();

        return questionIds;
    } catch (error) {
        console.error('Failed to generate new daily challenge questions:', error);
        throw error;
    }
};
 