import app from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";
import FirebaseConfig from "./serviceAccountKeyQA";

//Importación de elementros de firebase
class Firebase {
  constructor() {
    //configuración de BD firebases
    if (!app.apps.length) {
      app.initializeApp(FirebaseConfig);
    }
    app.firestore().enablePersistence({ synchronizeTabs: true });
    this.db = app.firestore();
    this.storage = app.storage();
    this.auth = app.auth();
    this.time = app.firestore.FieldValue.serverTimestamp();
  }
}

const firebase = new Firebase();
export default firebase;
