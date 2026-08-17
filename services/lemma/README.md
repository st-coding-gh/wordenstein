# Lemma API

This is a simple FastAPI-based API that accepts text and returns a list of filtered, lemmatized words using spaCy.

## Features

- Lemmatization using spaCy
- Filters out punctuation, stop words, spaces, digits, proper nouns, pronouns, symbols, foreign words
- Token-based Authorization using Bearer token
- JSON request and response format

---

## 🔧 Setup

1. **Clone the repo**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. **Create and activate a virtual environment**

```bash
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

4. **create .env file**

```bash
API_KEY=your-secret-token-here
```

5. **🚀 Run the server**

```bash
uvicorn main:app --reload
```

## API

Visit http://127.0.0.1:8000/docs for interactive API docs.

## debug tips

1. ✅ How to check if port is still in use. powershell:

```bash
netstat -ano | findstr :8000
```

output:

```bash
  TCP    127.0.0.1:8000    0.0.0.0:0    LISTENING    12345
```

2. ❌ How to kill the process. powershell:

```bash
taskkill /PID 12345 /F
```
