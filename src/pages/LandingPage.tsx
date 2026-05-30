import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-canvas-soft px-6">
      <div className="page-enter flex flex-col items-center gap-8 max-w-md w-full">
        {/* App icon */}
        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/app-icon.jpg"
            alt="Velinya"
            className="w-full h-full object-cover"
          />
        </div>

        {/* App title */}
        <div className="text-center">
          <h1 className="font-display text-5xl font-900 text-ink tracking-tight">
            Velinya
          </h1>
          <p className="mt-3 text-lg text-body leading-relaxed">
            Your notes & todos, beautifully organized — everywhere you go.
          </p>
        </div>

        {/* Google Sign-In button */}
        <button
          id="google-sign-in-btn"
          onClick={signInWithGoogle}
          className="flex items-center gap-3 bg-canvas text-ink font-semibold text-base
                     px-8 py-3.5 rounded-xl border border-ink/10 shadow-sm
                     hover:shadow-md hover:border-ink/20 active:scale-[0.98]
                     transition-all duration-200 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-sm text-mute text-center">
          Sign in to sync your data across all your devices
        </p>
      </div>
    </div>
  );
}
