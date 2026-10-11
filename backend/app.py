import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "SatyaCheck API",
        "openai_configured": bool(OPENAI_API_KEY),
    })


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    claim = str(data.get("claim", "")).strip()
    language = str(data.get("language", "English")).strip()

    if not claim:
        return jsonify({"error": "Please enter a claim."}), 400

    if len(claim) > 5000:
        return jsonify({"error": "Claim must be 5000 characters or fewer."}), 400

    if not OPENAI_API_KEY:
        return jsonify({
            "status": "OpenAI API key not configured",
            "explanation": "Add OPENAI_API_KEY to backend/.env and restart the backend.",
            "sources": [],
        })

    prompt = f"""
Investigate this claim cautiously.

Claim language: {language}
Claim: {claim}

Respond in {language} where possible.
Explain what the claim asserts, what needs verification,
what evidence could support or contradict it, and any warning signs
or missing context.

Do not invent facts, citations, publishers, URLs, or statistics.
Do not claim you searched the web.
If the claim cannot be verified from available information, say so.
Make clear this is AI-assisted analysis, not a confirmed fact-check.
"""

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a careful misinformation research assistant. Never invent evidence."
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
            },
            timeout=45,
        )
        response.raise_for_status()
        result = response.json()
        explanation = result["choices"][0]["message"]["content"]

        return jsonify({
            "status": "AI analysis complete — not a verified verdict",
            "explanation": explanation,
            "sources": [],
            "evidence_found": False,
        })

    except requests.Timeout:
        return jsonify({
            "status": "Analysis timed out",
            "explanation": "Please try again.",
            "sources": [],
        }), 504

    except requests.RequestException:
        app.logger.exception("OpenAI API request failed")
        return jsonify({
            "status": "AI service unavailable",
            "explanation": "Check your API key, API billing or quota, model access, and internet connection.",
            "sources": [],
        }), 502

    except (KeyError, IndexError, TypeError):
        app.logger.exception("Unexpected API response")
        return jsonify({
            "status": "Unexpected API response",
            "explanation": "Please try again.",
            "sources": [],
        }), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)