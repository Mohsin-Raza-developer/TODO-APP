/**
 * Toast Renderer Client Component
 *
 * Renders toast notifications from ToastContext
 * Must be a client component to access context hooks
 */

"use client";

import { useToast } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/ui/Toast";

export function ToastRenderer() {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onDismiss={removeToast} />;
}
