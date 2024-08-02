import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/adminPageStyle.css";


const AdminPage = () => {
  const [data, setData] = useState(null); // Storing fetched data
  const [loading, setLoading] = useState(true); // Loading Status??
  const [error, setError] = useState(null); // Error handling ??

  // useEffect to fetch data when the component mounts?
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/question-routes/request-new-questions");
        setData(response.data); // Store fetched data
        console.log(response.data)
      } catch (err) {
        console.log(err)
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Call fetchData function
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No Data available</p>;

  return (
    <div>
      <h1>Admin Page</h1>
      <div className="data-cards">
        {data.map(item => (
          <div className="card" key={item._id}>
            <h3>{item.text}</h3>
            <p><strong>ID:</strong> {item._id}</p>
            <p><strong>Correct Answer:</strong> {item.correctAnswer || 'None'}</p>
            <p><strong>Incorrect Answers:</strong> {item.incorrectAnswers.join(', ')}</p>
            <p><strong>Tags:</strong> {item.tags.join(', ')}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default AdminPage;
