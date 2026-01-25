/**
 * Signup Form Component
 *
 * Email/password registration form with validation
 *
 * Features:
 * - Email format validation
 * - Password minimum 8 characters
 * - Password confirmation match validation
 * - Optional name field
 * - Loading state during registration
 * - Error display
 *
 * Usage:
 * ```tsx
 * <SignupForm />
 * ```
 */

"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { SignupFormData } from "@/types/user";

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  name?: string;
}

export function SignupForm() {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    passwordConfirmation: "",
    name: "",
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

    // Password validation (minimum 8 characters per spec)
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Password confirmation validation
    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Please confirm your password";
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Passwords do not match";
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
      await signUp(formData);
      // useAuth hook handles success message and redirect
    } catch (error) {
      // useAuth hook handles error toast
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name (Optional)"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Your name"
        autoComplete="name"
        disabled={isSubmitting}
      />

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
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        helperText="Must be at least 8 characters"
        disabled={isSubmitting}
      />

      <Input
        label="Confirm Password"
        type="password"
        value={formData.passwordConfirmation}
        onChange={(e) =>
          setFormData({ ...formData, passwordConfirmation: e.target.value })
        }
        error={errors.passwordConfirmation}
        placeholder="Re-enter your password"
        autoComplete="new-password"
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        Create Account
      </Button>
    </form>
  );
}
