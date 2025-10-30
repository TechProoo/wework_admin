const items = [
  {
    title: "New course published",
    description: "Design 101 has been published",
  },
  { title: "New company joined", description: "Acme Inc was added" },
];

export default function Notifications() {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <div className="mt-4 grid gap-3">
        {items.map((n: any, i: number) => (
          <div key={i} className="card">
            <div className="font-medium">{n.title}</div>
            <div className="text-sm text-muted">{n.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
