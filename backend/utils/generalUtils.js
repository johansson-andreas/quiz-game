export const randomizeArrayIndex = (array) => {
    console.log('array length', array.length);
    const randomIndex = Math.floor(Math.random() * array.length);
    console.log('index', randomIndex);
    return randomIndex;
  }