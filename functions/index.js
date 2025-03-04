/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const logger = require("firebase-functions/logger");
const { start } = require("./task");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

logger.info("Carcosa is alive!");

exports.scheduledFunction = functions.pubsub
  .schedule("14 0 * * *") // Every day at 11 PM UTC
  .timeZone("America/Bogota") // Adjust to your timezone if needed
  .onRun((context) => {
    start();
    // Your cron job logic here
    return null;
  });
