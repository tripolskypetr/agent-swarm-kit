import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

async function saveMessage(clientId: string, text: string) {
  const messageDocRef = doc(db, "messages", clientId);
  const docSnapshot = await getDoc(messageDocRef);
  let messages: string[] = [];

  if (docSnapshot.exists()) {
    const data = docSnapshot.data();
    messages = data.messages || [];
  }

  messages.push(text);

  await setDoc(messageDocRef, { messages }, { merge: true });
}

export { saveMessage };
