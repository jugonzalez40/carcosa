// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const logger = require("firebase-functions/logger");
const { defineString } = require("firebase-functions/params");
const {
  getFirestore,
  collection,
  writeBatch,
  doc,
} = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: defineString("API_KEY"),
  authDomain: "carco-29604.firebaseapp.com",
  projectId: "carco-29604",
  storageBucket: "carco-29604.firebasestorage.app",
  messagingSenderId: "933837395926",
  appId: "1:933837395926:web:53fd455ec0b4dde797b677",
  measurementId: "G-Z25EVCG7EF",
};

const ATTRIBUTES_MAPPERS = [
  {
    id: "price",
    value: "price",
  },
  {
    id: "title",
    value: "title",
  },
  {
    id: "permalink",
    value: "permalink",
  },
  {
    id: "thumbnail",
    value: "thumbnail",
  },
  {
    id: "year",
    get: (car) => {
      const year = car.attributes.find(({ id }) => id === "VEHICLE_YEAR");
      if (!year) return 0;
      return +year.value_name;
    },
  },
  // {
  //   id: "json",
  //   get: (car) => car,
  // },
  {
    id: "kilometers",
    get: (car) => {
      const kilometers = car.attributes.find(({ id }) => id === "KILOMETERS");
      if (!kilometers) return 0;
      return kilometers.value_struct.number;
    },
  },
  {
    id: "date",
    get: (car) => {
      return new Date();
    },
  },
];

const transformCar = (car) => {
  return ATTRIBUTES_MAPPERS.reduce((base, current) => {
    return {
      ...base,
      [current.id]: current.get ? current.get(car) : car[current.value],
    };
  }, {});
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);
const collectionRef = collection(db, "cars");

const addCars = (cars) => {
  logger.info(`adding cars: `, cars.length);
  const batch = writeBatch(db);

  cars.forEach((car) => {
    logger.info(`adding car: `, car.id);

    const transformedCar = transformCar(car);

    const docRef = doc(collectionRef);
    batch.set(docRef, transformedCar);
  });
  return batch.commit();
};

module.exports = {
  addCars,
};

// addDoc(collectionRef, {
//     price: 12000,
//     kilometers: 10000,
//     title: "monda",
//     year:203
// })
