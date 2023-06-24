import app from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import FirebaseConfig from "./serviceAccountKey";

class Firebase {
  constructor() {
    if (!app.apps.length) {
      app.initializeApp(FirebaseConfig);
    }
    app.firestore().enablePersistence({ synchronizeTabs: true });
    this.auth = app.auth();
  }
}

const firebase = new Firebase();
export default firebase;
