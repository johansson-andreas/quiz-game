// DefaultComponent.js
import React from "react";
import styles from "./MultiPlayerLobby.module.css";

const DefaultComponent = ({
  createNewLobby,
  updateLobbyName,
  joinExLobby,
  joinLobbyName,
  updateLobbyPassword
}) => (
  <div className={styles.defaultDiv}>
    <button onClick={createNewLobby} className={styles.newLobbyButton}>
      Skapa nytt rum
    </button>
    <div className={styles.joinLobbyDiv}>
      <form onSubmit={(e) => joinExLobby(e, joinLobbyName)}>
        <input
          type="text"
          placeholder="Rumsnamn:"
          onChange={updateLobbyName}
          required
        />
        <input
          type="text"
          placeholder="Lösenord:"
          onChange={updateLobbyPassword}
          required
        />
        <button type="submit">Anslut till rum</button>
      </form>
    </div>
  </div>
);

export default DefaultComponent;
