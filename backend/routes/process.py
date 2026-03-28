from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.extractor import extract_text
from services.chunker import chunk_text
from services.ai_service import simplify_text
from services.translator import translate_text

router = APIRouter()


@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    language: str = Form(default="English")
):
    try:
        # 1. Extract text from the document
        text = await extract_text(file)

        if not text or not text.strip():
            return {
                "summary": "Could not extract any text from the document.",
                "content": "No readable text found in the uploaded file. Please try a different file.",
                "actions": [
                    "Try uploading a text-based PDF (not scanned)",
                    "Ensure the document is clear and readable",
                    "Try a different file format (PDF, JPG, PNG)"
                ]
            }

        # Check if extraction returned an error message
        if text.startswith("["):
            return {
                "summary": text,
                "content": text,
                "actions": [
                    "Try uploading a text-based PDF (not scanned)",
                    "Ensure the document is clear and readable",
                    "Try a different file format"
                ]
            }

        # 2. Chunk the text into manageable pieces
        chunks = chunk_text(text)

        # 3. Simplify each chunk using AI (or fallback)
        simplified_chunks = []
        for chunk in chunks:
            simplified = simplify_text(chunk)
            simplified_chunks.append(simplified)

        # 4. Join simplified text
        simplified_text = "\n\n".join(simplified_chunks)

        # 5. Translate the simplified text if not English
        if language.lower() != "english":
            translated = translate_text(simplified_text, language)
        else:
            translated = simplified_text

        # 6. Create summary (first 500 chars of simplified text)
        summary = simplified_chunks[0] if simplified_chunks else "No summary available."
        if len(summary) > 500:
            summary = summary[:500] + "..."

        # Translate summary too if needed
        if language.lower() != "english":
            summary = translate_text(summary, language)

        # 7. Generate action items (and translate if needed)
        actions = _generate_actions(language)

        return {
            "summary": summary,
            "content": translated,
            "actions": actions
        }

    except Exception as e:
        print(f"[NyayBot] Error in process_document: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )


def _generate_actions(language):
    """Generate action items for the user, translated if needed."""
    actions = [
        "Read through the simplified document carefully",
        "Note down any dates, deadlines, or amounts mentioned",
        "Consult a lawyer if any clause seems unfair or unclear",
        "Keep a signed copy of the original document",
        "Set reminders for important deadlines mentioned",
        "Verify all personal details are correct in the document"
    ]

    if language.lower() != "english":
        translated_actions = []
        for action in actions:
            try:
                translated = translate_text(action, language)
                translated_actions.append(translated)
            except Exception:
                translated_actions.append(action)
        return translated_actions

    return actions