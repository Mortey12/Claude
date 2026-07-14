import { useEffect, useRef, useState } from "react";
import { db } from "../../db/db";
import type { DecoyTodo } from "../../types";
import { appConfig } from "../../config/appConfig";

const LONG_PRESS_MS = 2000;

export function DecoyScreen({ onReveal }: { onReveal: () => void }) {
  const [todos, setTodos] = useState<DecoyTodo[]>([]);
  const [text, setText] = useState("");
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    db.decoyTodos.orderBy("opprettaAt").toArray().then(setTodos);
  }, []);

  function startPress() {
    pressTimer.current = setTimeout(onReveal, LONG_PRESS_MS);
  }

  function cancelPress() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  async function addTodo() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const todo: DecoyTodo = {
      id: crypto.randomUUID(),
      tekst: trimmed,
      fullfoert: false,
      opprettaAt: new Date().toISOString(),
    };
    await db.decoyTodos.put(todo);
    setTodos((prev) => [...prev, todo]);
    setText("");
  }

  async function toggle(id: string) {
    const item = todos.find((t) => t.id === id);
    if (!item) return;
    const updated = { ...item, fullfoert: !item.fullfoert };
    await db.decoyTodos.put(updated);
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function remove(id: string) {
    await db.decoyTodos.delete(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="decoy-theme" style={{ minHeight: "100svh", padding: "0 0 40px" }}>
      <header
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          padding: "28px 20px 18px",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "manipulation",
        }}
      >
        <h1 style={{ fontSize: "1.4rem", margin: 0, fontWeight: 600 }}>{appConfig.decoyName}</h1>
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--decoy-text-soft)" }}>
          Gjeremålsliste
        </p>
      </header>

      <main style={{ padding: "0 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Nytt gjeremål"
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid var(--decoy-border)",
              borderRadius: "var(--decoy-radius)",
              background: "var(--decoy-surface)",
              color: "var(--decoy-text)",
              fontSize: "0.95rem",
            }}
          />
          <button
            onClick={addTodo}
            style={{
              padding: "10px 16px",
              border: "1px solid var(--decoy-border)",
              borderRadius: "var(--decoy-radius)",
              background: "var(--decoy-accent)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Legg til
          </button>
        </div>

        {todos.length === 0 && (
          <p style={{ color: "var(--decoy-text-soft)", fontSize: "0.9rem" }}>
            Ingen gjeremål enno.
          </p>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {todos.map((t) => (
            <li
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "var(--decoy-surface)",
                border: "1px solid var(--decoy-border)",
                borderRadius: "var(--decoy-radius)",
              }}
            >
              <input type="checkbox" checked={t.fullfoert} onChange={() => toggle(t.id)} />
              <span
                style={{
                  flex: 1,
                  textDecoration: t.fullfoert ? "line-through" : "none",
                  color: t.fullfoert ? "var(--decoy-text-soft)" : "var(--decoy-text)",
                  fontSize: "0.95rem",
                }}
              >
                {t.tekst}
              </span>
              <button
                onClick={() => remove(t.id)}
                aria-label="Slett"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--decoy-text-soft)",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
