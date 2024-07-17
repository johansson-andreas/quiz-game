import React, { useState } from 'react';


const Test = () => {

    const [counter, addCounter] = useState(0);


    const increaseCounter = () => {
        addCounter(prevCount => prevCount + 1)
    }

    const decreaseCounter = () => {
        addCounter(prevCount => prevCount - 1)


    }


    return (<div>
        {counter}
        <button onClick={increaseCounter}>Öka </button>
        <button onClick={decreaseCounter}>Minska </button>

    </div>



    )

}
export default Test
