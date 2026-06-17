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
        className={`w-full rounded-xl bg-gradient-to-r from-[#0891B2] to-[#0284C7] px-5 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-700/25 transition-all duration-200 hover:from-[#0E7490] hover:to-[#0369A1] hover:shadow-xl hover:shadow-cyan-700/30 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg disabled:active:scale-100 ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
