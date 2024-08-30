export const randomizeArrayIndex = (array) => {
    const randomIndex = Math.floor(Math.random() * array.length);
    return randomIndex;
  }