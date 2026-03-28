// src/components/OutputDashboard.jsx

import { useState } from "react";
import { LANGUAGES } from "../data/mockData";

export default function OutputDashboard({ file, lang, apiData, onReset }) {
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hi! I've analyzed your document. What would you like to know?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const selectedLang = LANGUAGES.find(l => l.code === lang);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { role: "user", text: chatInput },
      {
        role: "ai",
        text: "I'm reviewing that clause now. Based on your document, I'll have a detailed answer shortly. (Connect backend AI for live responses.)",
      },
    ]);
    setChatInput("");
  };

  // Parse the API data
  const summary = apiData?.summary || "No summary available.";
  const content = apiData?.content || "No content available.";
  const actions = apiData?.actions || [];

  // Split content into paragraphs for better display
  const contentParagraphs = content.split("\n\n").filter(p => p.trim());

  return (
    <div style={{ background: "#F8FAFC", minHeight: "calc(100vh - 60px)", paddingBottom: 60 }}>
      {/* Top action bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #E2E8F0",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "#DCFCE7", color: "#166534",
            fontSize: 12, fontWeight: 700, padding: "4px 12px",
            borderRadius: 100, letterSpacing: "0.5px",
          }}>
            ✓ ANALYSIS COMPLETE
          </div>
          <span style={{ fontSize: 14, color: "#64748B", fontFamily: "Georgia, serif" }}>
            {file?.name}
          </span>
          <span style={{
            background: "#EFF6FF", color: "#2563EB",
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
          }}>
            {selectedLang?.flag} {selectedLang?.label}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowChat(s => !s)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 10,
              background: showChat ? "#EFF6FF" : "#fff",
              border: "1px solid #E2E8F0",
              color: "#374151", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "Georgia, serif",
            }}
          >
            💬 Ask Questions
          </button>
          <button
            onClick={onReset}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 10,
              background: "#2563EB", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "Georgia, serif",
            }}
          >
            ↩ New Document
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* Summary Card */}
        <div style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
          borderRadius: 20, padding: "24px 28px", marginBottom: 24, color: "#fff",
          boxShadow: "0 4px 24px rgba(37,99,235,0.25)", animation: "fadeSlideUp 0.5s ease",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <div>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700, fontSize: 18, marginBottom: 10,
              }}>
                Document Summary
              </p>
              <p style={{
                fontSize: 15, lineHeight: 1.7, color: "#BFDBFE",
                fontFamily: "Georgia, serif",
              }}>
                {summary}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: actions.length > 0 ? "1fr 380px" : "1fr",
          gap: 20, alignItems: "start",
        }}>
          {/* Left panel — Simplified Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: "#fff", borderRadius: 16, padding: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              animation: "fadeSlideUp 0.6s ease",
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700, fontSize: 18, color: "#0F172A",
                marginBottom: 16, display: "flex", gap: 10, alignItems: "center",
              }}>
                <span>📖</span> Simplified Content
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {contentParagraphs.map((para, i) => (
                  <p key={i} style={{
                    fontSize: 14, color: "#374151",
                    fontFamily: "Georgia, serif", lineHeight: 1.7,
                    padding: "12px 16px", borderRadius: 10,
                    background: "#F8FAFC", border: "1px solid #F1F5F9",
                  }}>
                    {para}
                  </p>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel — Action Checklist */}
          {actions.length > 0 && (
            <ActionChecklistPanel actions={actions} />
          )}
        </div>

        {/* Floating Chat Box */}
        {showChat && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            width: 380, height: 500,
            background: "#fff", borderRadius: 20,
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column",
            overflow: "hidden", animation: "fadeSlideUp 0.3s ease",
          }}>
            <div style={{
              padding: "16px 20px", background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700, fontSize: 18, color: "#fff",
                display: "flex", gap: 8, alignItems: "center", margin: 0
              }}>
                💬 NyayBot Chat
              </h3>
              <button 
                onClick={() => setShowChat(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: "16px", flex: 1, overflowY: "auto", background: "#F8FAFC" }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 16,
                }}>
                  <div style={{
                    maxWidth: "85%", padding: "12px 16px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "#2563EB" : "#fff",
                    border: m.role === "ai" ? "1px solid #E2E8F0" : "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    fontSize: 14,
                    color: m.role === "user" ? "#fff" : "#1E293B",
                    fontFamily: "Georgia, serif", lineHeight: 1.6,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              padding: "16px", background: "#fff", borderTop: "1px solid #E2E8F0",
              display: "flex", gap: 10,
            }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ask a legal question..."
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid #CBD5E1", fontSize: 14,
                  fontFamily: "Georgia, serif", outline: "none", color: "#1E293B",
                  background: "#F8FAFC",
                }}
              />
              <button
                onClick={sendChat}
                style={{
                  padding: "10px 16px", borderRadius: 10,
                  background: "#2563EB", color: "#fff",
                  border: "none", cursor: "pointer", fontSize: 16,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionChecklistPanel({ actions }) {
  const [items, setItems] = useState(actions.map((a, i) => ({
    text: typeof a === "string" ? a : a.text || a,
    done: false,
    deadline: typeof a === "object" ? a.deadline : null,
  })));

  const toggle = (i) =>
    setItems(prev => prev.map((a, idx) => idx === i ? { ...a, done: !a.done } : a));

  const completedCount = items.filter(a => a.done).length;
  const progressPct = (completedCount / items.length) * 100;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 24,
      border: "1px solid #E2E8F0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      animation: "fadeSlideUp 0.7s ease",
      position: "sticky", top: 80,
    }}>
      <h3 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 700, fontSize: 18, color: "#0F172A",
        marginBottom: 4, display: "flex", gap: 10, alignItems: "center",
      }}>
        <span>✅</span> What You Should Do
      </h3>
      <p style={{ color: "#64748B", fontSize: 13, fontFamily: "Georgia, serif", marginBottom: 20 }}>
        {completedCount} of {items.length} steps completed
      </p>

      {/* Progress bar */}
      <div style={{
        background: "#F1F5F9", borderRadius: 100, height: 6,
        marginBottom: 24, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 100,
          background: "linear-gradient(90deg, #22C55E, #4ADE80)",
          width: `${progressPct}%`,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Action items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((a, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              background: a.done ? "#F0FDF4" : "#FAFAFA",
              border: `1px solid ${a.done ? "#BBF7D0" : "#F1F5F9"}`,
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              border: `2px solid ${a.done ? "#22C55E" : "#CBD5E1"}`,
              background: a.done ? "#22C55E" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", marginTop: 1,
            }}>
              {a.done && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 13, fontFamily: "Georgia, serif", lineHeight: 1.5,
                color: a.done ? "#166534" : "#374151",
                textDecoration: a.done ? "line-through" : "none",
              }}>
                {a.text}
              </p>
              {a.deadline && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  marginTop: 4, background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  borderRadius: 6, padding: "2px 8px",
                }}>
                  <span style={{ fontSize: 10 }}>⏰</span>
                  <span style={{
                    fontSize: 11, color: "#C2410C",
                    fontWeight: 600, fontFamily: "Georgia, serif",
                  }}>
                    {a.deadline}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
