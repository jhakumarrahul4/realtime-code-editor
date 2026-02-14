// ===============================
// Initialize Socket
// ===============================
const socket = io();

// Make sure roomId exists
if (typeof roomId !== "undefined") {
  socket.emit("join-room", roomId);
}

let editor;
let isRemoteChange = false; // 🔥 Prevent infinite loop

// ===============================
// Monaco Editor Setup
// ===============================
require.config({
  paths: {
    vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value: typeof initialCode !== "undefined" ? initialCode : "",
    language: getMonacoLanguage(
      typeof initialLanguage !== "undefined" ? initialLanguage : "63",
    ),
    theme: "vs-dark",
    automaticLayout: true,
  });

  // ===============================
  // Real-time Code Change
  // ===============================
  editor.onDidChangeModelContent(() => {
    if (isRemoteChange) return; // 🔥 Ignore remote updates

    const code = editor.getValue();

    socket.emit("code-change", {
      roomId,
      code,
    });
  });
});

// ===============================
// Receive Code Updates
// ===============================
socket.on("code-update", (newCode) => {
  if (!editor) return;

  if (editor.getValue() !== newCode) {
    isRemoteChange = true; // 🔥 Mark as remote change
    editor.setValue(newCode);
    isRemoteChange = false; // 🔥 Reset flag
  }
});

// ===============================
// Language Change Handling
// ===============================
const languageDropdown = document.getElementById("language");

if (languageDropdown) {
  languageDropdown.addEventListener("change", function () {
    const selectedLanguage = this.value;

    if (editor) {
      monaco.editor.setModelLanguage(
        editor.getModel(),
        getMonacoLanguage(selectedLanguage),
      );
    }

    socket.emit("language-change", {
      roomId,
      language: selectedLanguage,
    });
  });
}

// ===============================
// Receive Language Updates
// ===============================
socket.on("update-language", (language) => {
  if (languageDropdown) {
    languageDropdown.value = language;
  }

  if (editor) {
    monaco.editor.setModelLanguage(
      editor.getModel(),
      getMonacoLanguage(language),
    );
  }
});

// ===============================
// Run Code
// ===============================
async function runCode() {
  if (!editor) return;

  const code = editor.getValue();
  const language = languageDropdown.value;
  const input = document.getElementById("input").value || "";

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        language,
        input,
      }),
    });

    const data = await res.json();

    let output = "";

    if (data.stdout) output += data.stdout;
    if (data.stderr) output += data.stderr;

    document.getElementById("output").value = output;

    socket.emit("console-output", {
      roomId,
      output,
    });
  } catch (error) {
    document.getElementById("output").value = "Execution Failed";
  }
}

// ===============================
// Receive Console Output
// ===============================
socket.on("receive-console-output", (output) => {
  document.getElementById("output").value = output;
});

// ===============================
// Helper Function
// ===============================
function getMonacoLanguage(languageId) {
  const map = {
    63: "javascript",
    71: "python",
    54: "cpp",
    50: "c",
    62: "java",
  };

  return map[languageId] || "javascript";
}
