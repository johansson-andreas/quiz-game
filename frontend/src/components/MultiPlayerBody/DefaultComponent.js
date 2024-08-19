// DefaultComponent.js
import React from "react";
import styles from "./MultiPlayerLobby.module.css";

const DefaultComponent = ({
  createNewLobby,
  updateLobbyName,
  joinExLobby,
  joinLobbyName,
  updateLobbyPassword

}) => {
  const handleInvalid = (e) => {
    // Set a custom validity message when the input is invalid
    e.target.setCustomValidity('Ett lobby namn krävs.');
  };

  return (
  <div className={styles.defaultDiv}>
    <button onClick={createNewLobby} className={styles.newLobbyButton}>
      Skapa nytt rum
    </button>
      <form className={styles.joinLobbyForm} onSubmit={(e) => joinExLobby(e, joinLobbyName)}>
        <input
          type="text"
          placeholder="Rumsnamn:"
          onChange={updateLobbyName}
          onInvalid={handleInvalid}
          required
        />
        <input
          type="text"
          placeholder="Lösenord:"
          onChange={updateLobbyPassword}
        />
        <button type="submit">Anslut till rum</button>
      </form>
  </div>
)};

export default DefaultComponent;
