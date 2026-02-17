import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Mail, Lock, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  useEffect(() => {
    // Check if this is a recovery flow from URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setPasswordUpdated(true);
      setTimeout(() => navigate("/login"), 2500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-amber-warm/20 border border-amber-warm/30 rounded-full flex items-center justify-center">
              <Moon className="w-7 h-7 text-amber-warm" />
            </div>
            <span className="font-display text-2xl font-bold text-primary-foreground">Bedtime Stories</span>
          </Link>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
          {/* Success state after password update */}
          {passwordUpdated ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-purple-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Password updated!</h2>
              <p className="text-muted-foreground text-sm">Redirecting you to sign in…</p>
            </div>
          ) : isRecovery ? (
            /* New password form */
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Set a new password</h1>
              <p className="text-muted-foreground text-sm mb-6">Choose a strong new password for your account.</p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-purple text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-purple hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          ) : sent ? (
            /* Sent confirmation */
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Check your inbox</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We've sent a password reset link to <span className="font-semibold text-primary">{email}</span>.
              </p>
              <Link to="/login" className="mt-6 inline-block text-primary font-medium hover:underline text-sm">
                Back to sign in
              </Link>
            </div>
          ) : (
            /* Send reset email form */
            <>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Reset your password</h1>
              <p className="text-muted-foreground text-sm mb-6">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-purple text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-purple hover:opacity-90 transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary font-medium hover:underline">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
