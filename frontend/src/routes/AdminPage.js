import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useTable, usePagination } from "react-table";
import { Tab, Tabs } from 'react-bootstrap';
import "./styles/adminPageStyle.css";
import { UserContext } from "../contexts/UserContext";
import LoginPanel from "../components/LoginPanel/LoginPanel";

const AdminPage = () => {
  const [newQuestions, setNewQuestions] = useState([]); // Storing new questions
  const [currentQuestions, setCurrentQuestions] = useState([]); // Storing current questions
  const [loading, setLoading] = useState(true); // Loading Status
  const [error, setError] = useState(null); // Error handling
  const [editingId, setEditingId] = useState(null); // Track the ID of the row being edited
  const { user, setUser } = useContext(UserContext);

  // Fetch new questions
  useEffect(() => {
    const fetchNewQuestions = async () => {
      try {
        const response = await axios.get(
          "/api/question-routes/new-questions"
        );
        setNewQuestions(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewQuestions(); // Call fetchNewQuestions function
  }, []);

  // Fetch current questions
  useEffect(() => {
    const fetchCurrentQuestions = async () => {
      try {
        const response = await axios.get(
          "/api/question-routes/questions"
        );
        setCurrentQuestions(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentQuestions(); // Call fetchCurrentQuestions function
  }, [user]);

  const columns = React.useMemo(
    () => [
      { Header: "ID", accessor: "_id" },
      { Header: "Text", accessor: "text" },
      { Header: "Correct Answer", accessor: "correctAnswer" },
      { Header: "Incorrect Answers", accessor: "incorrectAnswers", Cell: ({ value }) => value.join(", ") },
      { Header: "Tags", accessor: "tags", Cell: ({ value }) => value.join(", ") },
      { Header: "Actions", accessor: "actions" },
    ],
    []
  );

  const tableInstanceNew = useTable({ columns, data: newQuestions }, usePagination);
  const tableInstanceCurrent = useTable({ columns, data: currentQuestions }, usePagination);

  const {
    getTableProps: getTablePropsNew,
    getTableBodyProps: getTableBodyPropsNew,
    headerGroups: headerGroupsNew,
    prepareRow: prepareRowNew,
    page: pageNew, // Instead of using 'rows', we use 'page'
    nextPage: nextPageNew,
    previousPage: previousPageNew,
    canNextPage: canNextPageNew,
    canPreviousPage: canPreviousPageNew,
    pageOptions: pageOptionsNew,
    state: { pageIndex: pageIndexNew },
  } = tableInstanceNew;

  const {
    getTableProps: getTablePropsCurrent,
    getTableBodyProps: getTableBodyPropsCurrent,
    headerGroups: headerGroupsCurrent,
    prepareRow: prepareRowCurrent,
    page: pageCurrent,
    nextPage: nextPageCurrent,
    previousPage: previousPageCurrent,
    canNextPage: canNextPageCurrent,
    canPreviousPage: canPreviousPageCurrent,
    pageOptions: pageOptionsCurrent,
    state: { pageIndex: pageIndexCurrent },
  } = tableInstanceCurrent;

  const handleEditChange = (id, field, value) => {
    const updatedData = newQuestions.map((item) =>
      item._id === id ? { ...item, [field]: value } : item
    );

    setNewQuestions(updatedData);
  };

  const saveEdits = async (id) => {
    const editedItem = newQuestions.find((item) => item._id === id);
    try {
      const response = await axios.put(
        `/api/question-routes/question/${id}`,
        editedItem
      );
      const updatedItem = response.data;
      const updatedData = newQuestions.map((item) =>
        item._id === id ? updatedItem : item
      );
      setNewQuestions(updatedData);
    } catch (error) {
      console.error("Failed to update question:", error);
    }
    setEditingId(null);
  };

  const acceptQuestion = async (id) => {
    try {
      await axios.post(`/api/question-routes/question/${id}`);
      setNewQuestions((prevData) => prevData.filter((item) => item._id !== id));
      console.log(`Accepted question: ${id}`);
    } catch (error) {
      console.error("Failed to accept question:", error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/question-routes/question/${id}`);
      setCurrentQuestions((prevData) => prevData.filter((item) => item._id !== id));
      console.log(`Deleted question: ${id}`);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (!user) return <LoginPanel />;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!newQuestions.length && !currentQuestions.length) return <p>No Data available</p>;

  return (
    <div className="main-div">
      <h1>Administrationspanel</h1>
      <Tabs defaultActiveKey="newQuestions" id="admin-tabs" className="mb-3">
        <Tab eventKey="newQuestions" title="Nya Frågor">
          <table {...getTablePropsNew()}>
            <thead>
              {headerGroupsNew.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyPropsNew()}>
              {pageNew.map((row) => {
                prepareRowNew(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      if (cell.column.id === "actions") {
                        return (
                          <td {...cell.getCellProps()}>
                            <div className="main-button-container">
                              <button
                                onClick={() => acceptQuestion(row.original._id)}
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => deleteQuestion(row.original._id)}
                                className="delete"
                              >
                                Delete
                              </button>
                              {editingId === row.original._id ? (
                                <button
                                  onClick={() => saveEdits(row.original._id)}
                                  className="save"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingId(row.original._id)}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (
                        editingId === row.original._id &&
                        [
                          "text",
                          "correctAnswer",
                          "incorrectAnswers",
                          "tags",
                        ].includes(cell.column.id)
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
                      return (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => previousPageNew()} disabled={!canPreviousPageNew}>
              Previous
            </button>
            <button onClick={() => nextPageNew()} disabled={!canNextPageNew}>
              Next
            </button>
            <span>
              Page{" "}
              <strong>
                {pageIndexNew + 1} of {pageOptionsNew.length}
              </strong>{" "}
            </span>
          </div>
        </Tab>
        <Tab eventKey="currentQuestions" title="Befintliga Frågor">
          <table {...getTablePropsCurrent()}>
            <thead>
              {headerGroupsCurrent.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyPropsCurrent()}>
              {pageCurrent.map((row) => {
                prepareRowCurrent(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => previousPageCurrent()} disabled={!canPreviousPageCurrent}>
              Previous
            </button>
            <button onClick={() => nextPageCurrent()} disabled={!canNextPageCurrent}>
              Next
            </button>
            <span>
              Page{" "}
              <strong>
                {pageIndexCurrent + 1} of {pageOptionsCurrent.length}
              </strong>{" "}
            </span>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminPage;
