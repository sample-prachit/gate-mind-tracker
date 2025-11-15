
import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";

export function AuthModal() {
  const { user, loading, error, signIn, signUp, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };


  if (user) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-primary/10 via-white to-indigo-50 border border-primary/20 rounded-xl px-4 py-2 shadow-md mt-6 w-full max-w-md mx-auto">
        <div className="bg-primary/20 rounded-full p-1 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-primary" />
        </div>
        <span className="text-base font-semibold text-foreground tracking-tight break-all text-center w-full sm:w-auto">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={signOut} disabled={loading} className="w-full sm:w-auto">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[100vh] bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-400/30 via-indigo-400/20 to-purple-400/20 rounded-3xl blur-xl z-0" />
        <div className="relative z-10 w-full bg-white/95 border-l-8 border-primary rounded-3xl shadow-2xl p-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <div className="bg-primary/10 rounded-full p-3 mb-2">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-extrabold text-center mb-1 text-foreground tracking-tight drop-shadow-sm">
              {mode === "login" ? "Sign in to GATE Tracker" : "Create your account"}
            </h2>
            <p className="text-base text-muted-foreground mb-2 text-center">
              {mode === "login"
                ? "Welcome back! Please enter your details."
                : "Register to start tracking your GATE exam progress."}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-5 mt-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-background/80 focus:bg-white"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-background/80 focus:bg-white"
            />
            {error && <div className="text-red-500 text-xs text-center font-medium">{error}</div>}
            <Button type="submit" className="w-full mt-2 text-base font-semibold tracking-wide shadow-md" size="lg" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register"}
            </Button>
          </form>
          <div className="text-sm text-center mt-6 text-muted-foreground">
            {mode === "login" ? (
              <span>
                New here?{' '}
                <button
                  type="button"
                  className="underline text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  className="underline text-primary font-semibold hover:text-primary/80 transition-colors"
                  onClick={() => setMode("login")}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
