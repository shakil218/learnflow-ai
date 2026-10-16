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
          className:
            "rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-300",
          success: {
            className:
              "bg-emerald-600 text-white border border-emerald-500 shadow-emerald-950/20",
            iconTheme: {
              primary: "#ffffff",
              secondary: "#059669",
            },
          },
          error: {
            className:
              "bg-rose-600 text-white border border-rose-500 shadow-rose-950/20",
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
    success: (msg: string) =>
      toast.success(msg, {
        className:
          "bg-emerald-600 text-white border border-emerald-500 shadow-emerald-950/20 font-semibold rounded-2xl px-4 py-3 text-sm",
      }),
    error: (msg: string) =>
      toast.error(msg, {
        className:
          "bg-rose-600 text-white border border-rose-500 shadow-rose-950/20 font-semibold rounded-2xl px-4 py-3 text-sm",
      }),
    warning: (msg: string) =>
      toast(msg, {
        icon: "⚠️",
        className:
          "bg-amber-600 text-white border border-amber-500 shadow-amber-950/20 font-semibold rounded-2xl px-4 py-3 text-sm",
      }),
    info: (msg: string) =>
      toast(msg, {
        icon: "ℹ️",
        className:
          "bg-indigo-600 text-white border border-indigo-500 shadow-indigo-950/20 font-semibold rounded-2xl px-4 py-3 text-sm",
      }),
  };
};

export default toast;
