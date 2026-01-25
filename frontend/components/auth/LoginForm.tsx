/**
 * Login Form Component
 *
 * Email/password login form with validation and "Remember me" checkbox
 *
 * Features:
 * - Email validation (format check)
 * - Password required validation
 * - Remember me checkbox
 * - Loading state during authentication
 * - Error display
 *
 * Usage:
 * ```tsx
 * <LoginForm />
 * ```
 */

"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { LoginFormData } from "@/types/user";

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form fields
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(formData);
      // useAuth hook handles success message and redirect
    } catch (error) {
      // useAuth hook handles error toast
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        error={errors.password}
        placeholder="Enter your password"
        autoComplete="current-password"
        disabled={isSubmitting}
      />

      <div className="flex items-center">
        <input
          id="remember-me"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        <label
          htmlFor="remember-me"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Remember me (7 days)
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Sign In
      </Button>
    </form>
  );
}
