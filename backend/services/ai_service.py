import os
from dotenv import load_dotenv

load_dotenv()

_groq_client = None
_groq_available = False


def _init_groq():
    """Try to initialize Groq client. Returns True if successful."""
    global _groq_client, _groq_available

    api_key = os.getenv("GROQ_API_KEY", "")

    if not api_key or api_key == "your_groq_api_key_here":
        print("[NyayBot] No valid GROQ_API_KEY found. AI simplification will be skipped.")
        _groq_available = False
        return False

    try:
        from groq import Groq
        _groq_client = Groq(api_key=api_key)
        _groq_available = True
        print("[NyayBot] Groq AI client initialized successfully.")
        return True
    except Exception as e:
        print(f"[NyayBot] Failed to initialize Groq client: {e}")
        _groq_available = False
        return False


# Try to initialize on import
_init_groq()


def simplify_text(chunk):
    """
    Simplify legal text into plain, simple language.
    Falls back to basic text cleanup if Groq API is unavailable.
    """
    global _groq_available, _groq_client

    if not _groq_available or _groq_client is None:
        return _basic_simplify(chunk)

    try:
        response = _groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a legal document simplifier for Indian citizens. "
                        "Take complex legal text and rewrite it in simple, clear language "
                        "that anyone can understand. Keep important details like dates, "
                        "amounts, names, and obligations. Use short sentences and bullet points "
                        "where appropriate. Do NOT add legal advice."
                    )
                },
                {
                    "role": "user",
                    "content": f"Simplify this legal text into plain language:\n\n{chunk}"
                }
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content

    except Exception as e:
        error_msg = str(e)
        print(f"[NyayBot] Groq API error: {error_msg}")

        # If it's an auth error, disable Groq for future calls
        if "401" in error_msg or "invalid_api_key" in error_msg.lower():
            print("[NyayBot] API key is invalid. Switching to fallback mode.")
            _groq_available = False

        return _basic_simplify(chunk)


def _basic_simplify(text):
    """
    Basic text cleanup when AI is not available.
    Cleans up the text, splits into readable paragraphs.
    """
    if not text:
        return ""

    # Clean up extra whitespace
    lines = text.strip().split("\n")
    cleaned_lines = []

    for line in lines:
        line = line.strip()
        if line:
            cleaned_lines.append(line)

    return "\n\n".join(cleaned_lines)