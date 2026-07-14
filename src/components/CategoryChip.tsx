import { finnKategori } from "../data/seedLoader";

export function CategoryChip({ kategoriId }: { kategoriId: string }) {
  const kategori = finnKategori(kategoriId);
  return (
    <span
      className="chip"
      style={{
        background: `${kategori.farge}55`,
        color: "var(--text)",
      }}
    >
      {kategori.namn}
    </span>
  );
}
