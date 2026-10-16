import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, getFieldErrors } from "../services/errors";
import { AuthShell } from "./AuthShell";

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneral(null);
    if (form.password !== form.password2) {
      setErrors({ password2: "Parollar mos emas." });
      return;
    }
    setLoading(true);
    try {
      const me = await register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      notify(`Hisob yaratildi. Xush kelibsiz, ${me.username}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setGeneral(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      label="Yangi hisob"
      title="Ro'yxatdan o'tish"
      footer={
        <>
          Hisobingiz bormi?{" "}
          <Link to="/login" state={location.state} className="font-medium text-accent underline-offset-4 hover:underline">
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field id="username" label="Username" name="username" autoComplete="username" required value={form.username} error={errors.username} onChange={set("username")} />
        <Field id="email" label="Email" name="email" type="email" autoComplete="email" required value={form.email} error={errors.email} onChange={set("email")} />
        <Field id="password" label="Parol" name="password" type="password" autoComplete="new-password" required value={form.password} error={errors.password} onChange={set("password")} />
        <Field id="password2" label="Parolni takrorlang" name="password2" type="password" autoComplete="new-password" required value={form.password2} error={errors.password2} onChange={set("password2")} />
        <p className="text-xs text-faint">Kamida 8 belgi, ichida harf va raqam bo'lsin.</p>
        {general && (
          <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">
            {general}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Hisob yaratish
        </Button>
      </form>
    </AuthShell>
  );
}
