import { useState } from "react";

const mock = [
  { id: "m1", user: "Alice", last: "Can you review my course?" },
  { id: "m2", user: "Bob", last: "Application received." },
];

export default function Conversations() {
  const [items] = useState(mock);
  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold">Conversations</h2>
      <div className="mt-4 grid gap-3">
        {items.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.user}</div>
                <div className="text-sm text-muted">{c.last}</div>
              </div>
              <button className="link">Open</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
