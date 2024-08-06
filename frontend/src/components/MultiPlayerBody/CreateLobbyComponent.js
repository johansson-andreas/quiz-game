import styles from './MultiPlayerLobby.module.css'

const CreateLobbyComponent = ({
    createNewLobby,
    createLobbyName,
    setCreateLobbyName,
    chosenWinCon,
    updateChosenWinCon,
    setState,
    setCorrectWinConNumber,
    setAmountWinConNumber,
    setNewLobbyPassword,
    newLobbyPassword,
    newLobbyTimer,
    setNewLobbyTimer
  }) => (
    <div className={styles.createLobbyDiv}>
      <form onSubmit={createNewLobby}>
        <div className={styles.createRoomName}>
          Rumsnamn: 
          <input
            type="text"
            placeholder="Namn"
            value={createLobbyName}
            onChange={(e) => setCreateLobbyName(e.target.value)}
          />
        </div>
        <div className={styles.createRoomPassword}> 
            Lösenord för rum (frivilligt):
            <input type='text' placeholder='Lösenord' value={newLobbyPassword} onChange={(e) => setNewLobbyPassword(e.target.value)}/>
        </div>
        <div className={styles.createCategoriesDiv}>CategoriesPlaceholder</div>
        <div className={styles.createQuestionTimer}>
          Tid per fråga (sekunder):
          <input type="number" value={newLobbyTimer} onChange={(e) => setNewLobbyTimer(Number(e.target.value))}/>
        </div>
        <div className={styles.winCons}>
          <label>
            <input
              type="radio"
              value="correctCon"
              checked={chosenWinCon === 'correctCon'}
              onChange={updateChosenWinCon}
            />
            Först till 
            <input type="number" defaultValue={10} className={styles.winConText} onChange={(e) => setCorrectWinConNumber(Number(e.target.value))}/> 
            rätt svar
          </label>
          <label>
            <input
              type="radio"
              value="amountCon"
              checked={chosenWinCon === 'amountCon'}
              onChange={updateChosenWinCon}
            />
            Antal frågor: 
            <input type="number" defaultValue={15} className={styles.winConText} onChange={(e) => setAmountWinConNumber(Number(e.target.value))}/>
          </label>
        </div>
        <div className={styles.createButtons}>
          <button type="submit">Skapa</button>
          <button type="button" onClick={() => setState('default')}>Avbryt</button>
        </div>
      </form>
    </div>
  );
  
  export default CreateLobbyComponent;
  