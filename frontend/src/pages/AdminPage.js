import React, { useState, useEffect } from 'react';
import socket from '../components/Socket';
import './style.css';

const AdminPage = () => {
    const [questionData, setQuestionData] = useState({
      text: '',
      correctAnswer: '',
      incorrectAnswers: '',
      tags: ''
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setQuestionData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('addQuestion', questionData); 
        setQuestionData({
          text: '',
          correctAnswer: '',
          incorrectAnswers: '',
          tags: ''
        });
      };
  
    return (
      <div>
        <h2>Add New Question</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Question:
            <input
              type="text"
              name="text"
              value={questionData.text}
              onChange={handleChange}
              required
              style={{ width: '600px' }}
            />
          </label>
          <br />
          <label>
            Correct Answer:
            <input
              type="text"
              name="correctAnswer"
              value={questionData.correctAnswer}
              onChange={handleChange}
              required
              style={{ width: '600px' }}
            />
          </label>
          <br />
          <label>
            Incorrect Answers (comma-separated):
            <input
              type="text"
              name="incorrectAnswers"
              value={questionData.incorrectAnswers}
              onChange={handleChange}
              required
              style={{ width: '600px' }}
            />
          </label>
          <br />
          <label>
            Tags (comma-separated):
            <input
              type="text"
              name="tags"
              value={questionData.tags}
              onChange={handleChange}
              required
              style={{ width: '600px' }}
            />
          </label>
          <br />
          <button type="submit">Add Question</button>
        </form>
      </div>
    );
  };
  
  export default AdminPage;