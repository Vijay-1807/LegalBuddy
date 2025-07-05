// chatService.js
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";

export const saveChatMessage = async (userId, message, sender = "user") => {
  try {
    await addDoc(collection(db, "chats"), {
      userId,
      message,
      sender, // "user" or "bot"
      timestamp: serverTimestamp()
    });
    console.log("Chat saved successfully.");
  } catch (error) {
    console.error("Error saving chat:", error);
  }
};

export const getChatHistory = async (userId) => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("userId", "==", userId), orderBy("timestamp"));
  const querySnapshot = await getDocs(q);
  const chats = [];
  querySnapshot.forEach((doc) => {
    chats.push(doc.data());
  });
  return chats;
};
