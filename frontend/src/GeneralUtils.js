export const randomProperty = (obj) => {
    const keys = Object.keys(obj);
    return keys[keys.length * Math.random() << 0];
};

export const randomizeArrayIndex = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return randomIndex;
};export const shuffleArray = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

