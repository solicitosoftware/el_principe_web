const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.firestore().settings({ ignoreUndefinedProperties: true });
const firebase = admin.firestore();
const auth = admin.auth();
const time = admin.firestore.FieldValue.serverTimestamp();
const timestamp = (date) => {
  return admin.firestore.Timestamp.fromDate(date);
};

module.exports = { firebase, auth, time, timestamp };
