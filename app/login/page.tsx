import { Suspense } from "react";
import LoginFormWrapper from "./LoginFormWrapper";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginFormWrapper />
    </Suspense>
  );
}
