import { useState } from "react";
import "./styles/newPageStyle.css";
const NewPage = () => {
const [buttonValue, setButtonValue] = useState(0);

function buttonPlusOne() {
    setButtonValue(buttonValue + 1)
    console.log("increased button value by 1")
}
    return (
    <div class="center">
        <button type="button" class="button" value="{buttonValue}" onClick={buttonPlusOne}>{buttonValue}</button>
        <h1>Click the button!</h1>
    </div>
    )
}
export default NewPage;