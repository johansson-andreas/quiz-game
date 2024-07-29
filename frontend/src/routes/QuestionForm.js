import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";

const QuestionForm = () => {
  // State variables for form data
  const [questions, setQuestions] = useState("");
  const [answers, setAnswers] = useState({ svar1: "", svar2: "" });
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [categories, setCategories] = useState("");
  const [quizData, setQuizData] = useState([]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Process categories and create new question object
    const kategorierArray = categories
      .split(",")
      .map((kategori) => kategori.trim());
    const newQuestion = {
      questions: questions,
      answers: Object.values(answers),
      correctAnswer: correctAnswer,
      categories: kategorierArray,
    };

    axios.post('/api/question-routes/add-question-to-db', { newQuestion })

    // Update quiz data and reset form
    setQuizData([...quizData, newQuestion]);
    console.log("Quiz Data Submitted", newQuestion);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setQuestions("");
    setAnswers({ svar1: "", svar2: "" });
    setCorrectAnswer("");
    setCategories("");
  };

  return (
    <div style={{ display: "block", width: 700, padding: 30 }}>
      <h4>Quiz Game Form</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Fråga:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter the question"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
          />
        </Form.Group>

        {["svar1", "svar2"].map((key, index) => (
          <Form.Group key={key} className="mb-3">
            <Form.Label>{`Fel svar ${index + 1}:`}</Form.Label>
            <Form.Control
              type="text"
              placeholder={`Enter answer ${index + 1}`}
              value={answers[key]}
              onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
            />
          </Form.Group>
        ))}

        <Form.Label>{`Korrekt Svar:`}</Form.Label>
        <Form.Control
          type="text"
          placeholder={`Enter answer:`}
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />

        <Form.Group className="mb-3">
          <Form.Label>Kategorier:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter categories separated by commas"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Skicka
        </Button>
      </Form>

      {quizData.length > 0 && (
        <div className="mt-4">
          <h5>Quiz Data</h5>
          <ul>
            {quizData.map((item, index) => (
              <li key={index}>
                <strong>Fråga:</strong> {item.questions}
                <br />
                <strong>Fel svar:</strong> {item.answers.join(", ")}
                <br />
                <strong>Rätt Svar:</strong> {item.correctAnswer}
                <br />
                <strong>Kategorier:</strong> {item.categories.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuestionForm;
