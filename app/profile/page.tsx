import { EmptyState } from "@/components/EmptyState";

export default function ProfilePage() {
  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Profile</p>
        <h1 className="font-serif text-4xl">Your space</h1>
        <p className="max-w-md text-sm leading-relaxed text-charcoal/70">
          Personal notes, reminders, and preferences are coming soon.
        </p>
      </header>

      <EmptyState
        title="Profile is in progress"
        description="For now, Sola keeps your reading progress automatically in this demo mode."
      />
    </div>
  );
}
