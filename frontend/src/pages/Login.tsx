import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { AuthShell } from "./AuthShell";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const me = await login(form.login.trim(), form.password);
      notify(`Xush kelibsiz, ${me.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      label="Hisobga kirish"
      title="Qaytganingiz yaxshi"
      footer={
        <>
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" state={location.state} className="font-medium text-accent underline-offset-4 hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field id="login" label="Username yoki email" name="login" autoComplete="username" required value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
        <Field id="password" label="Parol" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && (
          <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!form.login || !form.password}>
          Kirish
        </Button>
      </form>
    </AuthShell>
  );
}
