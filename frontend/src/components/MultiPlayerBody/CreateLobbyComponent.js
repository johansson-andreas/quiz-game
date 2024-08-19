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
    setNewLobbyTimer,
    lobbyCreateErrorText
  }) => (
      <form className={styles.createLobbyForm} onSubmit={createNewLobby}>
          {lobbyCreateErrorText ?
          ( 
            <div>{lobbyCreateErrorText}</div>
          ) : (
            <div></div>
          )}
          Rumsnamn: 
          <input
            type="text"
            placeholder="Namn"
            value={createLobbyName}
            onChange={(e) => setCreateLobbyName(e.target.value)}
          />
            Lösenord för rum (frivilligt):
            <input type='text' placeholder='Lösenord' value={newLobbyPassword} onChange={(e) => setNewLobbyPassword(e.target.value)}/>
          Tid per fråga (sekunder):
          <input type="number" value={newLobbyTimer} onChange={(e) => setNewLobbyTimer(Number(e.target.value))}/>
          Vinstvillkor:
          <div className={styles.winConDiv}>
          <label>
            <input
              type="radio"
              value="correctCon"
              checked={chosenWinCon === 'correctCon'}
              onChange={updateChosenWinCon}
              style={{gridArea: "text1"}} 
              />
            Först till # rätta svar:
            <input   style={{gridArea: "number1"}} type="number" defaultValue={10} className={styles.winConText} onChange={(e) => setCorrectWinConNumber(Number(e.target.value))}/> 
          </label>
          <label>
            <input
              type="radio"
              value="amountCon"
              checked={chosenWinCon === 'amountCon'}
              onChange={updateChosenWinCon}
              style={{gridArea: "text2"}} 
            />
            Antal frågor: 
            <input   style={{gridArea: "number2"}} 
            type="number" defaultValue={15} className={styles.winConText} onChange={(e) => setAmountWinConNumber(Number(e.target.value))}/>
          </label>
          </div>
        <div className={styles.createButtons}>
          <button type="submit">Skapa</button>
          <button type="button" onClick={() => setState('default')}>Avbryt</button>
        </div>
      </form>
  );
  
  export default CreateLobbyComponent;
  