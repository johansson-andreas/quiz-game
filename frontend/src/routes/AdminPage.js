import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useTable, usePagination, useSortBy } from "react-table";
import { Tab, Tabs } from "react-bootstrap";
import "./styles/adminPageStyle.css";
import { UserContext } from "../contexts/UserContext";
import LoginPanel from "../components/LoginPanel/LoginPanel";

const AdminPage = () => {
  const [newQuestions, setNewQuestions] = useState([]); // Storing new questions
  const [currentQuestions, setCurrentQuestions] = useState([]); // Storing current questions
  const [loading, setLoading] = useState(true); // Loading Status
  const [error, setError] = useState(null); // Error handling
  const [editingIdNew, setEditingIdNew] = useState(null); // Track the ID of the row being edited
  const [editingIdCurrent, setEditingIdCurrent] = useState(null);
  const [activeTab, setActiveTab] = useState("newQuestion"); // Track the active tab
  const { user } = useContext(UserContext);

  // Fetch new questions
  useEffect(() => {
    const fetchNewQuestions = async () => {
      try {
        const response = await axios.get("/api/question-routes/new-questions");
        setNewQuestions(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewQuestions(); // Call fetchNewQuestions function
  }, []);

  // Fetch current questions only when the "currentQuestion" tab is clicked
  useEffect(() => {
    if (activeTab === "currentQuestions" && !currentQuestions.length) {
      const fetchCurrentQuestions = async () => {
        setLoading(true);
        try {
          const response = await axios.get("/api/question-routes/questions");
          setCurrentQuestions(response.data);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchCurrentQuestions(); // Call fetchCurrentQuestions function
    }
  }, [activeTab]); // Run useEffect when activeTab changes

  const columns = React.useMemo(
    () => [
      { Header: "Text", accessor: "text" },
      { Header: "Correct Answer", accessor: "correctAnswer" },
      {
        Header: "Incorrect Answers",
        accessor: "incorrectAnswers",
        Cell: ({ value }) => value.join(", "),
      },
      {
        Header: "Tags",
        accessor: "tags",
        Cell: ({ value }) => value.join(", "),
      },
      { Header: "Correct #", accessor: "correctAnswerCount" },
      { Header: "Incorrect #", accessor: "incorrectAnswerCount" },
      { Header: "Actions", accessor: "actions" },
    ],
    []
  );

  const tableInstanceNew = useTable(
    { columns, data: newQuestions },
    useSortBy,
    usePagination
  );
  const tableInstanceCurrent = useTable(
    { columns, data: currentQuestions },
    useSortBy,
    usePagination
  );

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

  const handleEditChangeCurrent = (id, field, value) => {
    const updatedData = currentQuestions.map((item) =>
      item._id === id ? { ...item, [field]: value } : item
    );

    setCurrentQuestions(updatedData);
  };

  const saveEdits = async (id) => {
    const editedItem = newQuestions.find((item) => item._id === id);
    try {
      const response = await axios.put(
        `/api/question-routes/new-question/${id}`,
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
    setEditingIdNew(null);
  };

  const saveEditsCurrent = async (id) => {
    const editedItem = currentQuestions.find((item) => item._id === id);
    try {
      const response = await axios.put(
        `/api/question-routes/question/${id}`,
        editedItem
      );
      const updatedItem = response.data;
      const updatedData = currentQuestions.map((item) =>
        item._id === id ? updatedItem : item
      );
      setCurrentQuestions(updatedData);
    } catch (error) {
      console.error("Failed to update question:", error);
    }
    setEditingIdCurrent(null);
  };

  const acceptQuestion = async (id) => {
    try {
      await axios.patch(`/api/question-routes/new-question/${id}`);
      setNewQuestions((prevData) => prevData.filter((item) => item._id !== id));
      console.log(`Accepted question: ${id}`);
    } catch (error) {
      console.error("Failed to accept question:", error);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/question-routes/new-question/${id}`);
      setNewQuestions((prevData) => prevData.filter((item) => item._id !== id));
      console.log(`Deleted question: ${id}`);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  if (!user) return <LoginPanel />;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!newQuestions.length && !currentQuestions.length)
    return <p>No Data available</p>;

  return (
    <div className="main-div">
      <h1>Administrationspanel</h1>
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        id="admin-tabs"
        className="mb-3"
      >
        <Tab eventKey="newQuestions" title="Nya Frågor">
          <table {...getTablePropsNew()}>
            <thead>
              {headerGroupsNew.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
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
                              {editingIdNew === row.original._id ? (
                                <button
                                  onClick={() => saveEdits(row.original._id)}
                                  className="save"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setEditingIdNew(row.original._id)
                                  }
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (
                        editingIdNew === row.original._id &&
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
            <button
              onClick={() => previousPageNew()}
              disabled={!canPreviousPageNew}
            >
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
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyPropsCurrent()}>
              {pageCurrent.map((row) => {
                prepareRowCurrent(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      if (cell.column.id === "actions") {
                        return (
                          <td {...cell.getCellProps()}>
                            <div className="main-button-container">
                              {editingIdCurrent === row.original._id ? (
                                <button
                                  onClick={() =>
                                    saveEditsCurrent(row.original._id)
                                  }
                                  className="save"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    setEditingIdCurrent(row.original._id)
                                  }
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (
                        editingIdCurrent === row.original._id &&
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
                                handleEditChangeCurrent(
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
            <button
              onClick={() => previousPageCurrent()}
              disabled={!canPreviousPageCurrent}
            >
              Previous
            </button>
            <button
              onClick={() => nextPageCurrent()}
              disabled={!canNextPageCurrent}
            >
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
