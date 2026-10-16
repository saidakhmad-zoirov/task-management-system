import { LinkButton } from "../components/ui/Button";
import { DecodeText } from "../components/ui/DecodeText";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="mx-auto grid min-h-[70dvh] max-w-xl place-items-center px-4 text-center">
      <div className="space-y-6">
        <p className="font-display text-[clamp(7rem,24vw,13rem)] leading-none text-accent">
          <DecodeText text="404" />
        </p>
        <h1 className="text-3xl">Bunday sahifa yo'q</h1>
        <p className="text-muted">Havola eskirgan yoki noto'g'ri yozilgan bo'lishi mumkin.</p>
        <LinkButton to={user ? "/dashboard" : "/"}>{user ? "Dashboardga" : "Bosh sahifaga"}</LinkButton>
      </div>
    </div>
  );
}
