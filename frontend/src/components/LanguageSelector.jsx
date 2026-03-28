// src/components/LanguageSelector.jsx

import { LANGUAGES } from "../data/mockData";

export default function LanguageSelector({ lang, setLang }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 24,
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      marginBottom: 28,
    }}>
      <p style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 16,
      }}>
        🌐 Choose Output Language
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 10,
      }}>
        {LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 12, cursor: "pointer",
              border: `2px solid ${lang === l.code ? "#2563EB" : "#E2E8F0"}`,
              background: lang === l.code ? "#EFF6FF" : "#FAFAFA",
              transition: "all 0.15s", fontFamily: "Georgia, serif",
            }}
          >
            <span style={{ fontSize: 18 }}>{l.flag}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: lang === l.code ? "#2563EB" : "#374151",
              }}>
                {l.label}
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>{l.native}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
