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
            background: "#18181b",
            color: "#fafafa",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#ffffff",
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
    info: (msg: string) => toast(msg, { icon: "ℹ️" }),
  };
};

export default toast;
