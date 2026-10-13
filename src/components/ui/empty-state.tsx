export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-sand-300 bg-white/60 px-6 py-12 text-center text-stone-600">
      {children}
    </p>
  );
}
