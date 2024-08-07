import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTable, usePagination } from "react-table";
import "./styles/adminPageStyle.css";

const AdminPage = () => {
  const [data, setData] = useState([]); // Storing fetched data
  const [loading, setLoading] = useState(true); // Loading Status
  const [error, setError] = useState(null); // Error handling
  const [editingId, setEditingId] = useState(null); // Track the ID of the row being edited

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/question-routes/request-new-questions");
        setData(response.data); // Store fetched data
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Call fetchData function
  }, []);

  const columns = React.useMemo(
    () => [
      { Header: "ID", accessor: "_id" },
      { Header: "Text", accessor: "text" },
      { Header: "Correct Answer", accessor: "correctAnswer" },
      { Header: "Incorrect Answers", accessor: "incorrectAnswers" },
      { Header: "Tags", accessor: "tags" },
      { Header: "Actions", accessor: "actions"},
    ],
    []
  );

  const tableInstance = useTable({ columns, data }, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we use 'page'
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = tableInstance;

  const handleEditChange = (id, field, value) => {
    const updatedData = data.map((item) =>
      item._id === id ? { ...item, [field]: value } : item
    );

    setData(updatedData);
  };

  const saveEdits = async (id) => {
    const editedItem = data.find((item) => item._id === id);
    try {
      const response = await axios.put(`/api/question-routes/update-question/${id}`, editedItem);
      const updatedItem = response.data;
      const updatedData = data.map((item) =>
        item._id === id ? updatedItem : item
      );
      setData(updatedData);
    } catch (error) {
      console.error("Failed to update question:", error);
    }
    setEditingId(null);
  };

  const acceptQuestion = async (id) => {
    try {
      await axios.post(`/api/question-routes/accept-question/${id}`);
      setData(prevData => prevData.filter((item) => item._id !== id));
      console.log(`Accepted question: ${id}`);
    } catch (error) {
      console.error("Failed to accept question:", error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/question-routes/delete-question/${id}`);
      setData(prevData => prevData.filter((item) => item._id !== id));
      console.log(`Deleted question: ${id}`);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data.length) return <p>No Data available</p>;

  return (
    <div className="container">
      <h1>Admin Page</h1>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (cell.column.id === "actions") {
                    return (
                      <td {...cell.getCellProps()}>
                        <button onClick={() => acceptQuestion(row.original._id)}>
                          Accept
                        </button>
                        <button onClick={() => deleteQuestion(row.original._id)} className="delete">
                          Delete
                        </button>
                        {editingId === row.original._id ? (
                          <button onClick={() => saveEdits(row.original._id)} className="save">
                            Save
                          </button>
                        ) : (
                          <button onClick={() => setEditingId(row.original._id)}>
                            Edit
                          </button>
                        )}
                      </td>
                    );
                  }

                  if (
                    editingId === row.original._id &&
                    ["text", "correctAnswer", "incorrectAnswers", "tags"].includes(cell.column.id)
                  ) {
                    return (
                      <td {...cell.getCellProps()}>
                        <input
                          value={cell.value}
                          onChange={(e) =>
                            handleEditChange(
                              row.original._id,
                              cell.column.id,
                              e.target.value
                            )
                          }
                        />
                      </td>
                    );
                  }
                  return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          Previous
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          Next
        </button>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
      </div>
    </div>
  );
};

export default AdminPage;
