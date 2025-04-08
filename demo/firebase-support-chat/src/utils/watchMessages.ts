import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

function watchMessages(clientId: string, cb: (message: string) => void) {
  const messageDocRef = doc(db, "messages", clientId);
  return onSnapshot(messageDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      if (!docSnapshot.metadata.hasPendingWrites) {
        const data = docSnapshot.data();
        if (data && data.messages && data.messages.length > 0) {
          const latestMessage = data.messages[data.messages.length - 1];
          cb(latestMessage);
        }
      }
    }
  }, (error) => {
    console.error("Error listening to messages:", error);
  });
}

export { watchMessages };