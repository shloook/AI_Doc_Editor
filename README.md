# <p align = "center"> AI Document Editor</p>
<img width="4834" height="1667" alt="bento-grid-section" src="https://github.com/user-attachments/assets/4a900377-ff69-4450-9a2e-19b33230fadc" />


AI_Doc_Editor is a modern, lightweight AI-powered document editor. It provides clean writing space, real-time editing, AI suggestions, modular architecture, and minimal setup.

## ✨ Features
- Real-time text editor  
- AI-powered writing suggestions  
- Lightweight, fast, modular  
- No heavy frameworks  
- Fully customizable UI  
- MIT Licensed  

## 🚀 Getting Started

### Clone the repository
```bash
git clone https://github.com/shloook/AI_Doc_Editor.git
cd AI_Doc_Editor
```

### Run the project (static)
Open the file:
```
index.html
```

### Run with Node.js (if using API backend)
```bash
npm install
npm start
```

---

## 📂 Project Structure
```
AI_Doc_Editor/
├── index.html
├── style.css
├── script.js
├── ai.js
├── assets/
├── LICENSE
└── README.md
```

---

## 🧠 Core Editor Logic (script.js)
```javascript
const editor = document.getElementById("editor");

editor.addEventListener("input", () => {
    console.log("Editor updated:", editor.innerText);
});
```

---

## 🤖 AI Suggestion Logic (ai.js)
```javascript
async function generateSuggestion(text) {
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
    });

    const data = await response.json();
    return data.suggestion;
}

document.getElementById("suggestBtn").onclick = async () => {
    const userText = editor.innerText;
    const suggestion = await generateSuggestion(userText);
    document.getElementById("suggestionBox").innerText = suggestion;
};
```

---

## 🖥 HTML Layout (index.html)
```html
<div class="container">
    <h1>AI Doc Editor</h1>

    <div id="editor" class="editor" contenteditable="true">
        Start typing your document here...
    </div>

    <button id="suggestBtn">Generate AI Suggestion</button>

    <div id="suggestionBox" class="suggestion"></div>
</div>
```

---

## 🎨 Styling (style.css)
```css
body {
    background: #f5f5f5;
    font-family: Arial, sans-serif;
}

.container {
    width: 70%;
    margin: auto;
    padding: 20px;
}

.editor {
    width: 100%;
    min-height: 300px;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #ccc;
    font-size: 16px;
    line-height: 1.5;
}

button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 16px;
}

.suggestion {
    margin-top: 20px;
    background: #eaf3ff;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #bcd7ff;
}
```

---

## 🧪 Optional API

### Generate AI Suggestion
```
POST /api/generate
Content-Type: application/json

{
  "input": "Your text here"
}
```

### Example Response
```json
{
  "suggestion": "AI-generated improved version of your text."
}
```

---

## 🤝 Contributing
1. Fork the repository  
2. Create a feature branch  
3. Commit changes  
4. Open a pull request  

---

## 📄 License
MIT License.

---

## ⭐ Acknowledgements
Inspired by modern editors, AI writing tools, and minimal UI design.
