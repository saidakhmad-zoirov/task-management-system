import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { CountUp } from "../components/ui/CountUp";
import { DecodeText } from "../components/ui/DecodeText";
import { Field } from "../components/ui/Field";
import { SplitText } from "../components/ui/SplitText";
import { ErrorState, LoadingState } from "../components/ui/States";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { dashboardService } from "../services/dashboard";
import { getErrorMessage, getFieldErrors } from "../services/errors";
import { userService } from "../services/users";
import { formatDateTime } from "../utils/format";

export default function Profile() {
  const { updateProfile, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  // GET /users/me — profil sahifasi har safar serverdan yangilanadi
  const me = useAsync((signal) => userService.me(signal), []);
  const stats = useAsync((signal) => dashboardService.stats(signal), []);

  const [form, setForm] = useState<{ username: string; email: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current_password: "", new_password: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);

  if (me.loading && !me.data) return <LoadingState />;
  if (me.error || !me.data) return <ErrorState message={me.error ?? "Xatolik"} onRetry={me.reload} />;
  const user = me.data;
  const values = form ?? { username: user.username, email: user.email };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const patch: { username?: string; email?: string } = {};
    if (values.username.trim() !== user.username) patch.username = values.username.trim();
    if (values.email.trim().toLowerCase() !== user.email) patch.email = values.email.trim();
    if (!Object.keys(patch).length) {
      notify("O'zgarish yo'q", "info");
      return;
    }
    setSaving(true);
    try {
      me.setData(await updateProfile(patch)); // PATCH /users/me
      setForm(null);
      notify("Profil saqlandi");
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(Object.keys(fields).length ? fields : { general: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwErrors({});
    setPwSaving(true);
    try {
      await updateProfile(pw); // PATCH /users/me {current_password, new_password}
      setPw({ current_password: "", new_password: "" });
      notify("Parol yangilandi");
    } catch (err) {
      const fields = getFieldErrors(err);
      setPwErrors(Object.keys(fields).length ? fields : { general: getErrorMessage(err) });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <span className="grid size-20 place-items-center rounded-3xl bg-accent font-display text-3xl uppercase text-on-accent">{user.username.slice(0, 2)}</span>
          <div className="space-y-1">
            <DecodeText text="PROFIL" className="label text-violet" />
            <h1 className="text-4xl sm:text-5xl">
              <SplitText key={user.username} text={user.username} />
            </h1>
            <p className="text-sm text-muted">{formatDateTime(user.created_at)} dan beri</p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            logout();
            notify("Hisobdan chiqdingiz", "info");
            navigate("/login");
          }}
        >
          Chiqish
        </Button>
      </header>

      {stats.data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Jami", value: stats.data.total, cls: "" },
            { label: "Bajarildi", value: stats.data.done, cls: "text-accent" },
            { label: "Bajarilish", value: stats.data.completion_rate, cls: "text-violet", suffix: "%" },
          ].map((s, i) => (
            <div key={s.label} className="rise panel p-5" style={{ ["--i" as string]: i }}>
              <p className="label">{s.label}</p>
              <p className={`mt-2 font-display text-3xl sm:text-4xl ${s.cls}`}>
                <CountUp value={s.value} />
                {s.suffix}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={save} className="panel space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-2xl">Shaxsiy ma'lumotlar</h2>
          <Field id="profile-username" label="Username" name="username" value={values.username} error={errors.username} onChange={(e) => setForm({ ...values, username: e.target.value })} />
          <Field id="profile-email" label="Email" name="email" type="email" value={values.email} error={errors.email} onChange={(e) => setForm({ ...values, email: e.target.value })} />
          {errors.general && <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{errors.general}</p>}
          <Button type="submit" loading={saving}>
            Saqlash
          </Button>
        </form>

        <form onSubmit={changePassword} className="panel space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-2xl">Parolni o'zgartirish</h2>
          <Field id="current-password" label="Joriy parol" name="current_password" type="password" autoComplete="current-password" value={pw.current_password} error={pwErrors.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
          <Field id="new-password" label="Yangi parol" name="new_password" type="password" autoComplete="new-password" value={pw.new_password} error={pwErrors.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          {pwErrors.general && <p role="alert" className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral">{pwErrors.general}</p>}
          <Button type="submit" variant="violet" loading={pwSaving} disabled={!pw.current_password || !pw.new_password}>
            Yangilash
          </Button>
        </form>
      </div>
    </div>
  );
}
