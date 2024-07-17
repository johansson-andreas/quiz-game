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
        // Create a new document for today's questions
        const newDailyChallengeQuestions = new DailyChallengeQuestions({
            date: new Date(),
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
 