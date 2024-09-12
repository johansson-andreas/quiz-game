


export const randomizeArrayIndex = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return randomIndex;
};

export const halfObjectProperties = (obj) => {
  console.log("obj", obj);
  const keys = Object.keys(obj);
  const halfLength = Math.floor(keys.length / 2);

  keys.slice(0, halfLength).forEach((key) => delete obj[key]);

  return obj;
};

