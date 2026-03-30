import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot" | "magic-link";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Content de vous revoir !");
      navigate("/dashboard");
    } catch {
      toast.error("Email ou mot de passe incorrect. Vérifiez vos informations ou réinitialisez votre mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
    } catch (err: any) {
      const msg = err?.message?.includes("already registered")
        ? "Cet email est déjà utilisé. Essayez de vous connecter."
        : "Une erreur est survenue. Veuillez réessayer.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Un lien de réinitialisation a été envoyé à votre adresse email.");
    } catch {
      toast.error("Impossible d'envoyer le lien. Vérifiez votre adresse email.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast.success("Un lien de connexion vous a été envoyé par email.");
    } catch {
      toast.error("Impossible d'envoyer le lien. Vérifiez votre adresse email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch {
      toast.error("Erreur lors de la connexion avec Google.");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthMode, { h1: string; sub: string }> = {
    login: { h1: "Content de vous revoir", sub: "Connectez-vous pour gérer vos dons" },
    signup: { h1: "Rejoignez Cash4Cause", sub: "Créez un compte pour commencer à aider" },
    forgot: { h1: "Mot de passe oublié ?", sub: "Entrez votre email pour recevoir un lien de réinitialisation" },
    "magic-link": { h1: "Connexion sans mot de passe", sub: "Recevez un lien de connexion par email" },
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-card border">
          {/* Back button for secondary modes */}
          {(mode === "forgot" || mode === "magic-link") && (
            <button
              onClick={() => setMode("login")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          )}

          <div className="text-center mb-6">
            <Logo size="lg" className="mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-foreground">{titles[mode].h1}</h1>
            <p className="text-sm text-muted-foreground mt-1">{titles[mode].sub}</p>
          </div>

          {/* Google button — login & signup only */}
          {(mode === "login" || mode === "signup") && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mb-4"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
            </>
          )}

          {/* LOGIN form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline mt-1 block"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Chargement..." : "Se connecter"}
              </Button>
            </form>
          )}

          {/* SIGNUP form */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom d'affichage</Label>
                <Input id="name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Votre nom" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Chargement..." : "Créer un compte"}
              </Button>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>
            </form>
          )}

          {/* MAGIC LINK */}
          {mode === "magic-link" && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Envoi en cours..." : "Recevoir le lien"}
              </Button>
            </form>
          )}

          {/* Bottom links */}
          <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                <p>
                  Pas encore de compte ?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                    S'inscrire
                  </button>
                </p>
                <button
                  onClick={() => setMode("magic-link")}
                  className="text-primary/80 hover:text-primary hover:underline text-xs"
                >
                  Recevoir un lien de connexion par email
                </button>
              </>
            )}
            {mode === "signup" && (
              <p>
                Déjà un compte ?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                  Se connecter
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
