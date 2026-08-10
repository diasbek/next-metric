"use client";

import { ToastContainer, toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const base: ToastOptions = {
  position: "top-right",
  autoClose: 4200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  theme: "dark",
};

export function adminToastSuccess(message: string, options?: ToastOptions) {
  toast.success(message, { ...base, ...options });
}

export function adminToastError(message: string, options?: ToastOptions) {
  toast.error(message, { ...base, autoClose: 6500, ...options });
}

export function adminToastInfo(message: string, options?: ToastOptions) {
  toast.info(message, { ...base, ...options });
}

export function adminToastWarn(message: string, options?: ToastOptions) {
  toast.warn(message, { ...base, ...options });
}

/** Mount once in admin dashboard / auth shells. */
export function AdminToaster() {
  return (
    <ToastContainer
      {...base}
      newestOnTop
      limit={4}
      style={{ zIndex: 99999 }}
      toastStyle={{
        background: "#141414",
        border: "1px solid #333",
        color: "#fafafa",
        fontSize: 14,
      }}
    />
  );
}
