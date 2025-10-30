import { useState } from "react";

const initial = [
  { id: "cat_1", name: "Design" },
  { id: "cat_2", name: "Engineering" },
  { id: "cat_3", name: "Product" },
];

export default function Categories() {
  const [cats, setCats] = useState(initial);
  const [newName, setNewName] = useState("");

  function add() {
    if (!newName.trim()) return;
    setCats((s) => [{ id: `cat_${Date.now()}`, name: newName }, ...s]);
    setNewName("");
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-semibold">Categories</h2>
      <div className="mt-4 card">
        <div className="flex gap-2">
          <input
            className="input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
          />
          <button className="comic-button" onClick={add}>
            Add
          </button>
        </div>
        <ul className="mt-4">
          {cats.map((c) => (
            <li key={c.id} className="p-2 border-b">
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
