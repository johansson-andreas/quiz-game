import React, { useState } from "react";
import axios from "axios";
import "./styles/questionFormStyle.css";

const QuestionForm = () => {
  const [questions, setQuestions] = useState("");
  const [answers, setAnswers] = useState({ svar1: "", svar2: "" });
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [categories, setCategories] = useState("");
  const [quizData, setQuizData] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");
    console.log("Submit button clicked");

    const kategorierArray = categories
      .split(",")
      .map((kategori) => kategori.trim());
    const newQuestion = {
      questions,
      answers: Object.values(answers),
      correctAnswer,
      categories: kategorierArray,
    };

    try {
      const response = await axios.post(
        "/api/question-routes/add-question-to-db",
        { newQuestion }
      );
      console.log(response.data);

      setQuizData([...quizData, newQuestion]);
      setSubmissionStatus("success");
      resetForm();
    } catch (error) {
      console.error("Failed to submit question:", error);
      setSubmissionStatus("error");
    }
  };

  const resetForm = () => {
    setQuestions("");
    setAnswers({ svar1: "", svar2: "" });
    setCorrectAnswer("");
    setCategories("");
  };

  return (
    <section className="questionForm">
      <form onSubmit={handleSubmit} className="main-form">
        <h2>Quiz Game Form</h2>
        <div className="input-box">
          <label htmlFor="question">Question:</label>
          <input
            className="field"
            id="question"
            type="text"
            placeholder="Enter the question"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </div>

        {["svar1", "svar2"].map((key, index) => (
          <div className="input-box" key={key}>
            <label htmlFor={key}>{`Incorrect Answer ${index + 1}:`}</label>
            <input
              className="field"
              id={key}
              type="text"
              placeholder={`Enter answer ${index + 1}`}
              value={answers[key]}
              onChange={(e) =>
                setAnswers({ ...answers, [key]: e.target.value })
              }
            />
          </div>
        ))}

        <div className="input-box">
          <label htmlFor="correctAnswer">Correct Answer:</label>
          <input
            className="field"
            id="correctAnswer"
            type="text"
            placeholder="Enter the correct answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        </div>

        <div className="input-box">
          <label htmlFor="categories">Categories:</label>
          <input
            className="field"
            id="categories"
            type="text"
            placeholder="Enter categories separated by commas"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
          />
        </div>

        <button type="submit">Submit</button>
        
        {submissionStatus === "success" && (
        <p className="success-message">Question submitted successfully!</p>
      )}
      {submissionStatus === "error" && (
        <p className="error-message">Failed to submit question. Please try again.</p>
      )}
      {submissionStatus === "submitting" && (
        <p className="submitting-message">Submitting your question...</p>
      )}
      </form>


    </section>
  );
};

export default QuestionForm;
