import { AuthPanel } from "@/features/auth/auth-panel";

export default function LoginPage() {
  return <div className="mx-auto flex w-full max-w-5xl justify-center"><AuthPanel mode="login" /></div>;
}
