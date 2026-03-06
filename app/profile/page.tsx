import { signOutAction } from "@/app/auth/actions";
import { requireAppUserProfile } from "@/lib/auth/get-current-user";

export default async function ProfilePage() {
  const { profile } = await requireAppUserProfile();

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Profile</p>
        <h1 className="font-serif text-4xl">Your space</h1>
        <p className="max-w-md text-sm leading-relaxed text-charcoal/70">Signed in as {profile.email || "your account"}.</p>
      </header>

      <section className="rounded-2xl border border-charcoal/10 bg-white/70 p-5 shadow-soft">
        <p className="text-sm text-charcoal/75">Your reading plan and progress are synced securely to your account.</p>
      </section>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-2xl border border-charcoal/20 bg-white px-4 py-3 text-base font-medium text-charcoal transition hover:bg-charcoal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
