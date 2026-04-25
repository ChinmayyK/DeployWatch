// Auth pages are full-bleed (the AuthPanel handles its own layout)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
