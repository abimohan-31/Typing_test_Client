import { create } from "zustand";
import api, { ApiResponse } from "../lib/axios";
import { User, StudentProfile, TeamLeaderProfile } from "../types";
import { socket } from "../sockets/client";

interface AuthState {
  user: User | null;
  profile: StudentProfile | TeamLeaderProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
  
  setUser: (user: User | null) => void;
  setProfile: (profile: StudentProfile | TeamLeaderProfile | null) => void;
  setError: (error: string | null) => void;
  
  login: (credentials: Record<string, string>) => Promise<User>;
  registerStudent: (data: Record<string, string>) => Promise<any>;
  registerLeader: (data: Record<string, string>) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  isChecking: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setError: (error) => set({ error }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse>("/auth/login", credentials);
      const data = response.data.data;
      
      const userObj: User = {
        _id: data._id,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: "",
        updatedAt: "",
      };

      let profileObj: any = null;
      if (data.role === "student") {
        profileObj = {
          _id: "",
          userId: data._id,
          name: data.name,
          groupId: data.groupId || null,
        };
      } else if (data.role === "team-leader") {
        profileObj = {
          _id: "",
          userId: data._id,
          name: data.name,
        };
      }

      set({
        user: userObj,
        profile: profileObj,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect real-time socket immediately
      socket.connect();
      if (data.groupId && data.role === "student") {
        socket.emit("joinGroup", { groupId: data.groupId });
      }

      return userObj;
    } catch (err: any) {
      const errMsg = err.friendlyMessage || "Login failed";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  registerStudent: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse>("/auth/register/student", formData);
      const data = response.data.data;

      const userObj: User = {
        _id: data._id,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: "",
        updatedAt: "",
      };

      const profileObj = {
        _id: "",
        userId: data._id,
        name: data.name,
        groupId: null,
      };

      set({
        user: userObj,
        profile: profileObj,
        isAuthenticated: true,
        isLoading: false,
      });

      socket.connect();
      return data;
    } catch (err: any) {
      const errMsg = err.friendlyMessage || "Registration failed";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  registerLeader: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse>("/auth/register/team-leader", formData);
      const data = response.data.data;

      const userObj: User = {
        _id: data._id,
        email: data.email,
        role: data.role,
        isActive: true,
        createdAt: "",
        updatedAt: "",
      };

      const profileObj = {
        _id: "",
        userId: data._id,
        name: data.name,
      };

      set({
        user: userObj,
        profile: profileObj,
        isAuthenticated: true,
        isLoading: false,
      });

      socket.connect();
      return data;
    } catch (err: any) {
      const errMsg = err.friendlyMessage || "Registration failed";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Allow local logout anyway
    } finally {
      // Disconnect socket connection
      if (socket.connected) {
        socket.disconnect();
      }
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },

  checkAuth: async () => {
    set({ isChecking: true, error: null });
    try {
      const response = await api.get<ApiResponse>("/users/me");
      const { user, profile } = response.data.data;

      set({
        user,
        profile,
        isAuthenticated: true,
        isChecking: false,
      });

      // Connect socket on session resume
      if (!socket.connected) {
        socket.connect();
      }

      const groupId = profile?.groupId?._id || profile?.groupId;
      if (groupId) {
        socket.emit("joinGroup", { groupId });
      }
    } catch (err) {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isChecking: false,
      });
      if (socket.connected) {
        socket.disconnect();
      }
    }
  },
}));
