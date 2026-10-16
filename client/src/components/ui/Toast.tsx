"use client";

import React from "react";
import toast, { Toaster } from "react-hot-toast";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "14px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
          },
          success: {
            style: {
              background: "#059669", // Vibrant Emerald 600
              color: "#ffffff",
              border: "1px solid #10b981",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#059669",
            },
          },
          error: {
            style: {
              background: "#e11d48", // Vibrant Rose 600
              color: "#ffffff",
              border: "1px solid #f43f5e",
            },
            iconTheme: {
              primary: "#ffffff",
              secondary: "#e11d48",
            },
          },
        }}
      />
    </>
  );
};

export const useToast = () => {
  return {
    toast: (msg: string) => toast(msg),
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    warning: (msg: string) =>
      toast(msg, {
        icon: "⚠️",
        style: {
          background: "#d97706", // Vibrant Amber 600
          color: "#ffffff",
          border: "1px solid #f59e0b",
        },
      }),
    info: (msg: string) =>
      toast(msg, {
        icon: "ℹ️",
        style: {
          background: "#4f46e5", // Vibrant Indigo 600
          color: "#ffffff",
          border: "1px solid #6366f1",
        },
      }),
  };
};

export default toast;
