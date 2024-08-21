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
          <label  style={{display:'contents'}} >
            <input
              type="radio"
              value="correctCon"
              checked={chosenWinCon === 'correctCon'}
              onChange={updateChosenWinCon}
              style={{gridColumn: 1, gridRow: 1}} 
              />
            <div style={{gridColumn: 2, gridRow: 1}}>Först till # rätta svar:</div>
            <input   style={{gridColumn: 3, gridRow: 1}} type="number" defaultValue={10} className={styles.winConText} onChange={(e) => setCorrectWinConNumber(Number(e.target.value))}/> 
            </label>
            <label  style={{display:'contents'}} >
            <input
              type="radio"
              value="amountCon"
              checked={chosenWinCon === 'amountCon'}
              onChange={updateChosenWinCon}
              style={{gridColumn: 1, gridRow: 2}} 
            />
            <div style={{gridColumn: 2, gridRow: 2}}>Antal frågor: </div>
            <input   style={{gridColumn: 3, gridRow: 2}} 
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
  