import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: ReactNode;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full rounded-xl border bg-white/80 py-3.5 pr-4 text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 ${
              icon ? "pl-11" : "pl-4"
            } ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200"} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
