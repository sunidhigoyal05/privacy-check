# PrivacyCheck Backend

## Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Optional: set LLM API key
export OPENAI_API_KEY="your-key-here"

# Run server
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs
