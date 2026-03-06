import Link from "next/link";
import { sendMagicLinkAction, signInWithGoogleAction } from "@/app/auth/actions";

type LoginPageProps = {
  searchParams?: {
    sent?: string;
    email?: string;
    error?: string;
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const sent = searchParams?.sent === "1";
  const email = searchParams?.email;
  const error = searchParams?.error;
  const next = searchParams?.next ?? "/today";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-md flex-col justify-center py-8">
      <div className="rounded-3xl border border-charcoal/10 bg-white/75 p-6 shadow-soft backdrop-blur">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-slate">Sola</p>
          <h1 className="font-serif text-4xl text-charcoal">Welcome back</h1>
          <p className="text-sm leading-relaxed text-charcoal/75">Sign in to keep your reading progress in sync across devices.</p>
        </div>

        <form action={sendMagicLinkAction} className="mt-6 space-y-4" aria-label="Email magic link sign in form">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-charcoal/90">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-charcoal/20 bg-parchment px-4 py-3 text-base text-charcoal shadow-inner-soft outline-none transition focus:border-olive/60 focus:ring-2 focus:ring-olive/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-charcoal px-4 py-3 text-base font-medium text-white transition hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60"
          >
            Send magic link
          </button>
        </form>

        <form action={signInWithGoogleAction} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-2xl border border-charcoal/20 bg-white px-4 py-3 text-base font-medium text-charcoal transition hover:bg-charcoal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60"
          >
            Continue with Google
          </button>
        </form>

        {sent ? <p className="mt-4 text-sm text-olive">Check {email ?? "your email"} for your secure sign-in link.</p> : null}
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

        <p className="mt-6 text-center text-sm text-charcoal/70">
          New to Sola? <Link className="underline decoration-charcoal/30 underline-offset-4" href="/">Start here</Link>
        </p>
      </div>
    </div>
  );
}
