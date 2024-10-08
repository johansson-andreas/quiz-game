import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/questionFormStyle.css";
import { Tab, Tabs } from "react-bootstrap";

const QuestionForm = () => {
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState({ svar1: "", svar2: "" });
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [categories, setCategories] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [allCategories, setAllCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("");



  const resetForm = () => {
    setQuestionText("");
    setAnswers({ svar1: "", svar2: "" });
    setCorrectAnswer("");
    setCategories("");
  };

  const getCategories = async () => {
    try {
      const catagoriesRes = await axios.get("/api/question-routes/categories");
      console.log(catagoriesRes.data);
      setAllCategories(catagoriesRes.data);
    } catch (error) {
      console.log(error);
    }
  };
 
  useEffect(() => {
    getCategories();
  }, []);

  const handleUpdateCategory = (category) => {
    setCategories((currentcategories) => {
      const newCategories = [...currentcategories];
      if (newCategories.includes(category)) {
        const index = newCategories.indexOf(category);
        newCategories.splice(index, 1);
      } else {
        newCategories.push(category);
      }
      console.log(newCategories);
      return newCategories;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");
    console.log("Submit button clicked");

    const newQuestion = {
      questionType: "newOneOfThree",
      questions: questionText,
      answers: Object.values(answers),
      correctAnswer,
      categories: categories,
    };

    try {
      const response = await axios.post("/api/question-routes/question", {
        newQuestion,
      });
      console.log(response.data);

      setQuizData([...quizData, newQuestion]);
      setSubmissionStatus("success");
      resetForm();
    } catch (error) {
      console.error("Failed to submit question:", error);
      setSubmissionStatus("error");
    }
  };

  /* 
    Created a function for each tab that returns the HTML for that tab to make the file more readable. 
  */
  const renderOoTForm = () => {
    return (
      <section className="questionForm">
        <form onSubmit={handleSubmit} className="main-form">
          <h2>Rätt eller fel</h2>
          <div className="input-box">
            <label htmlFor="question">Question:</label>
            <input
              className="field"
              id="question"
              type="text"
              placeholder="Enter the question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
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
          <label htmlFor="categories">Categories:</label>

          <div className="qfCategoriesDiv">
            {allCategories.map((category) => (
              <label className="qfCategoryLabel">
                {category}
                <input
                  type="checkbox"
                  onChange={() => handleUpdateCategory(category)}
                />
              </label>
            ))}
          </div>

          <button type="submit">Submit</button>

          {submissionStatus === "success" && (
            <p className="success-message">Question submitted successfully!</p>
          )}
          {submissionStatus === "error" && (
            <p className="error-message">
              Failed to submit question. Please try again.
            </p>
          )}
          {submissionStatus === "submitting" && (
            <p className="submitting-message">Submitting your question...</p>
          )}
        </form>
      </section>
    );
  };

  const renderConnectForm = () => {

    return (
      <>
      
      </>
    )
  }

  return (
    <div className="main-div">
      <h1>Questionform</h1>
      <div>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          id="question-tabs"
          className="mb-3"
        >
          <Tab eventKey="newQuestions" title="Rätt eller fel">
            {renderOoTForm()}
          </Tab>
          <Tab eventKey="connectedPairs" title="Connect the pairs">
            {renderConnectForm()}
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestionForm;
