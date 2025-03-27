import { create } from "zustand";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { generateKeyPair } from "../utils/generateKeyPair.js";
import axiosInstance from "../lib/axios.js";

const BASE_URL =
  import.meta.env.VITE_MODE === "development" ? "http://localhost:5001" : import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  googleSignInUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const { publicKey, privateKey } = await generateKeyPair();
      const res = await axiosInstance.post("/auth/google-sign-in-up", {
        ...data,
        publicKey: publicKey,
      });

      console.log({res})

      localStorage.setItem("pk", privateKey);
      localStorage.setItem("token", res.data.token);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.log({error})
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  getPublicKey: async (userId) => {
    try {
      const res = await axiosInstance.get(`/auth/${userId}/publicKey`);
      return res.data.publicKey;
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
