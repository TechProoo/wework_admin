// lightweight preview modal

export default function PreviewConfirmModal({
  open,
  payload,
  onConfirm,
  onClose,
}: {
  open: boolean;
  payload: any;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="mobile-menu open" style={{ zIndex: 70 }} role="dialog">
      <div className="mobile-menu-inner card" style={{ maxWidth: 760 }}>
        <h3 className="text-xl font-bold mb-2">Preview course</h3>

        <div className="mb-3">
          <div className="font-semibold" style={{ fontSize: 18 }}>
            {payload?.title ?? "Untitled"}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            {payload?.category ?? "Category"} • {payload?.level ?? "Level"}
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            {payload?.description ?? "No description"}
          </p>
        </div>

        <div className="mt-3">
          <div className="muted text-sm">Lessons</div>
          <ul>
            {(payload?.lessons ?? []).map((l: any, i: number) => (
              <li key={i} className="py-2 border-b">
                {l.title || `Lesson ${i + 1}`}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 justify-end mt-4">
          <button className="btn-ghost" onClick={onClose} type="button">
            Keep editing
          </button>
          <button className="btn" onClick={onConfirm} type="button">
            Confirm & publish
          </button>
        </div>
      </div>
    </div>
  );
}
