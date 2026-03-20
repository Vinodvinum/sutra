"use client";

import { useMemo, useState } from "react";

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  error?: string;
  required?: boolean;
}

export default function AuthInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  error,
  required = false,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === "password";
  const inputType = useMemo(() => {
    if (!isPassword) {
      return type;
    }

    return showPassword ? "text" : "password";
  }, [isPassword, showPassword, type]);

  return (
    <div className="auth-input-group">
      <label className="auth-label">
        {label}
        {required ? " *" : ""}
      </label>
      <div className="auth-input-wrap">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={inputType}
          placeholder={placeholder}
          className="auth-input"
        />
        {isPassword ? (
          <button
            className="auth-eye"
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? "\u{1F648}" : "\u{1F441}"}
          </button>
        ) : null}
      </div>
      {error ? <div className="auth-error">{error}</div> : null}
    </div>
  );
}
