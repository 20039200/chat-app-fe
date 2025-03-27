import { create } from "zustand";
import toast from "react-hot-toast";
import moment from "moment";
import { useAuthStore } from "./useAuthStore";
import { encryptAESKey, encryptMessage, generateAESKey } from "../utils/encryption";
import { receiveMessage } from "../utils/decryption";
import axiosInstance from "../lib/axios";
const NotificationSound = new Audio("/message-receive.mp3"); // Preload the sound

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
  
      const messages = await Promise.all(
        res.data.map(async (data) => {
          const { authUser } = useAuthStore.getState();
          const msg = await receiveMessage(data, authUser._id, localStorage.getItem("pk"));
          return {
            ...data,
            encryptedMessage: msg, // Store decrypted message
          };
        })
      );
  
      set({ messages }); // Update state with resolved messages
    } catch (error) {
      console.log("error", error)
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },  
  sendMessage: async (message) => {
    const { selectedUser } = get();
    if (!selectedUser) return toast.error("No user selected");

    const { getPublicKey, authUser } = useAuthStore.getState();
    try {
      const receiverId = selectedUser._id;
      const receiverPublicKey = await getPublicKey(receiverId);
      const senderPublicKey = authUser.publicKey;
      
      const aesKey = await generateAESKey(); // Ensure async execution
      const { encrypted } = encryptMessage(message, aesKey);
      const encryptedAESKeySender = await encryptAESKey(aesKey, senderPublicKey);
      const encryptedAESKeyReceiver = await encryptAESKey(aesKey, receiverPublicKey);

      await axiosInstance.post(`/messages/send/${receiverId}`, {
        encryptedMessage: encrypted,
        encryptedAESKeySender,
        encryptedAESKeyReceiver,
      });

      set((state) => ({
        messages: [...state.messages, {
          receiverId,
          senderId: authUser._id,
          encryptedMessage: message,
          createdAt: moment.utc().local()
        }],
      }));
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const {socket, authUser} = useAuthStore.getState();

    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const msg = await receiveMessage(newMessage, authUser._id, localStorage.getItem("pk"));

      set({
        messages: [...get().messages, {...newMessage, encryptedMessage: msg}],
      });

      // 🔔 Play notification sound
    NotificationSound.currentTime = 0; // Reset sound for quick consecutive notifications
    NotificationSound.play().catch(error => console.error("Error playing sound:", error));
    });
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
