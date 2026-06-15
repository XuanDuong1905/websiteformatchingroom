import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ isLoading = false, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-3 text-base font-semibold text-white shadow transition duration-200 hover:from-cyan-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-100 border-t-white" />
            Đang xử lý...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

AuthButton.displayName = "AuthButton";
