import type { ReactNode } from "react";

import { OrbitCanvas } from "../components/canvas/OrbitCanvas";
import { DecodeText } from "../components/ui/DecodeText";
import { SplitText } from "../components/ui/SplitText";

export function AuthShell({ label, title, children, footer }: { label: string; title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-10rem)] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="relative hidden h-[460px] lg:block">
        <OrbitCanvas />
        <div className="absolute bottom-6 left-6 max-w-xs space-y-2">
          <DecodeText text="TASK / FLOW / DONE" className="label text-accent" />
          <p className="text-sm text-muted">Har bir nuqta — bitta vazifa. Kulrang — to do, binafsha — jarayonda, yashil — bajarildi.</p>
        </div>
      </div>
      <div className="panel relative mx-auto w-full max-w-md p-8 shadow-soft sm:p-10">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="label text-violet">{label}</p>
            <h1 className="text-4xl">
              <SplitText text={title} />
            </h1>
          </div>
          {children}
          <p className="text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}
