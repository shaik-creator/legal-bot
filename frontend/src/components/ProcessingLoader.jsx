// src/components/ProcessingLoader.jsx

import { useState, useEffect, useRef } from "react";
import { PROCESSING_STEPS, LANGUAGES } from "../data/mockData";

const STEP_DURATION_MS  = 1000;
const PROGRESS_TICK_MS  = 100;
const PROGRESS_INCREMENT = 2;

export default function ProcessingLoader({ file, lang, onDone }) {
  const [step, setStep]         = useState(0);
  const [progress, setProgress] = useState(0);
  const calledRef = useRef(false);

  // Map language code to full language name for the backend
  const selectedLang = LANGUAGES.find(l => l.code === lang);
  const languageName = selectedLang?.label || "English";

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const processDocument = async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", languageName);

      try {
        const apiUrl = "https://nyaybot-backend.onrender.com";
        const res = await fetch(`${apiUrl}/process`, {
          method: "POST",
          body: formData,
          headers: {
            "Bypass-Tunnel-Reminder": "true",
          }
        });

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const data = await res.json();
        onDone(data);
      } catch (error) {
        console.error("Error processing document:", error);
        onDone({
          summary: "⚠️ Could not connect to the backend server. Make sure the backend is running on http://localhost:8000",
          content: `Error Details: ${error.message}\n\nPlease ensure:\n1. The backend server is running (uvicorn app:app --reload)\n2. All Python dependencies are installed\n3. The API configuration is correct`,
          actions: [
            "Start the backend server with: cd backend && uvicorn app:app --reload",
            "Install dependencies: pip install -r requirements.txt",
            "Check the backend terminal for error messages"
          ]
        });
      }
    };

    processDocument();

    // Keep the animation going
    const stepTimer = setInterval(() => {
      setStep(s => {
        const next = s + 1;
        if (next >= PROCESSING_STEPS.length) {
          clearInterval(stepTimer);
        }
        return next;
      });
    }, STEP_DURATION_MS);

    const progressTimer = setInterval(() => {
      setProgress(p => Math.min(p + PROGRESS_INCREMENT, 95));
    }, PROGRESS_TICK_MS);

    return () => { clearInterval(stepTimer); clearInterval(progressTimer); };
  }, [file, languageName, onDone]);

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "linear-gradient(160deg, #EFF6FF 0%, #F8FAFC 60%, #F0FDF4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%", maxWidth: 520,
        textAlign: "center", animation: "fadeSlideUp 0.5s ease",
      }}>
        {/* Spinner */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          border: "4px solid #E0EAFF",
          borderTop: "4px solid #2563EB",
          margin: "0 auto 32px",
          animation: "spin 1s linear infinite",
        }} />

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 8,
        }}>
          Analyzing Your Document
        </h2>
        <p style={{
          color: "#64748B", fontFamily: "Georgia, serif",
          fontSize: 15, marginBottom: 40,
        }}>
          Our AI is working through the legal language…
        </p>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40, textAlign: "left" }}>
          {PROCESSING_STEPS.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 18px", borderRadius: 12,
              background: i < step ? "#F0FDF4" : i === step ? "#EFF6FF" : "#F8FAFC",
              border: `1px solid ${i < step ? "#BBF7D0" : i === step ? "#BFDBFE" : "#F1F5F9"}`,
              transition: "all 0.4s",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: i < step ? "#22C55E" : i === step ? "#2563EB" : "#E2E8F0",
                fontSize: 12,
              }}>
                {i < step && <span style={{ color: "#fff" }}>✓</span>}
                {i === step && (
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: "#fff", display: "block",
                    animation: "pulse 1s infinite",
                  }} />
                )}
              </div>
              <span style={{
                fontFamily: "Georgia, serif", fontSize: 14,
                color: i < step ? "#166534" : i === step ? "#1D4ED8" : "#94A3B8",
                fontWeight: i === step ? 600 : 400,
              }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          background: "#E2E8F0", borderRadius: 100, height: 8, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 100,
            background: "linear-gradient(90deg, #2563EB, #60A5FA)",
            width: `${progress}%`, transition: "width 0.1s linear",
          }} />
        </div>
        <p style={{
          color: "#94A3B8", fontSize: 13, marginTop: 8, fontFamily: "Georgia, serif",
        }}>
          {progress}% complete
        </p>
      </div>
    </div>
  );
}
