// const functions = require("firebase-functions/v2"); // Use v2 for 2nd Gen functions
// const logger = require("firebase-functions/logger");
// const admin = require("firebase-admin");
// const { start } = require("./task");

// admin.initializeApp();

// exports.scheduledFunction = functions.tasks
//   .schedule({
//     schedule: "22 0 * * *", // Runs every day at 12 AM UTC
//     timeZone: "America/Bogota", // Adjust timezone if needed
//   })
//   .onDispatch(async () => {
//     logger.info("Running scheduled task at 12 AM!");
//     // Your cron job logic here
//     start();
//   });

// The Cloud Functions for Firebase SDK to set up triggers and logging.
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const { start } = require("./task");

// The Firebase Admin SDK to delete inactive users.
const admin = require("firebase-admin");
admin.initializeApp();

exports.scheduledFunctionCrontab = onSchedule(
  {
    schedule: "46 0 * * *",
    timeZone: "America/Bogota",
  },
  async (event) => {
    // ...

    logger.info("Running scheduled task at 12 AM!");
    start();
  }
);
