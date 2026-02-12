"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface VerificationPendingPanelProps {
  email: string;
  redirectPath?: string;
}

export function VerificationPendingPanel({ email, redirectPath = "/dashboard" }: VerificationPendingPanelProps) {
  const { resendVerificationEmail: resendEmail, getResendStatus } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [remainingToday, setRemainingToday] = useState(5);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const status = getResendStatus(email);
      setCooldownRemaining(status.cooldownRemaining);
      setRemainingToday(status.remainingToday);
    };

    updateStatus();
    const intervalId = window.setInterval(updateStatus, 1000);
    return () => window.clearInterval(intervalId);
  }, [email]);

  const handleResendVerificationEmail = async () => {
    if (isSending) return;
    if (cooldownRemaining > 0 || remainingToday <= 0 || isAlreadyVerified) return;

    setIsSending(true);
    try {
      const result = await resendEmail(email);
      if (result.outcome === "already_verified") {
        setIsAlreadyVerified(true);
      }
      const status = getResendStatus(email);
      setCooldownRemaining(status.cooldownRemaining);
      setRemainingToday(status.remainingToday);
      if (result.ok) {
        setIsAlreadyVerified(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  const resendDisabled = isSending || cooldownRemaining > 0 || remainingToday <= 0 || isAlreadyVerified;

  const buttonLabel = isAlreadyVerified
    ? "Already Verified"
    : isSending
      ? "Sending..."
      : cooldownRemaining > 0
        ? `Resend in ${cooldownRemaining}s`
        : "Resend Verification Email";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Verify Your Email
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        We sent a verification link to <span className="font-medium">{email}</span>.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Please verify your email to unlock dashboard, todos, and chatbot access.
      </p>

      <div className="rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3 text-sm text-blue-800 dark:text-blue-200">
        <p>Check your email inbox.</p>
        {cooldownRemaining > 0 && <p>Next resend available in {cooldownRemaining}s.</p>}
        {isAlreadyVerified && (
          <p>
            Your account is already verified. Continue to{" "}
            <a href={redirectPath} className="underline font-medium">
              dashboard
            </a>.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleResendVerificationEmail}
        disabled={resendDisabled}
        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
