import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPage = () => {
  const [data, setData] = useState(null); // Storing fetched data
  const [loading, setLoading] = useState(true); // Loading Status??
  const [error, setError] = useState(null); // Error handling ??

  // useEffect to fetch data when the component mounts?
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/question-routes/request-new-questions");
        setData(response.data.message); // Store fetched data
      } catch (err) {
        console.log(err)
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Call fetchData function
  }, []); // Empty dependency array means this runs once on mount? Why?
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No Data available</p>;

  return (
    <div>
      <h1>Admin Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre> {/* Render fetched data */}
    </div>
  );
};

export default AdminPage;
