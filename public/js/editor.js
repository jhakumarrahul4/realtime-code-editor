// ===============================
// Monaco Loader Config
// ===============================
require.config({
  paths: {
    vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs",
  },
});

let editor;

// ===============================
// Initialize Monaco + Yjs
// ===============================
require(["vs/editor/editor.main"], function () {

  // Create Yjs document
  const ydoc = new Y.Doc();

  // Connect to same Railway server using WebSocket
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const provider = new WebsocketProvider(
    wsProtocol + "//" + window.location.host,
    roomId,
    ydoc
  );

  // Shared text type
  const yText = ydoc.getText("monaco");

  // Create Monaco editor
  editor = monaco.editor.create(document.getElementById("editor"), {
    theme: "vs-dark",
    automaticLayout: true,
    language: getMonacoLanguage(
      typeof initialLanguage !== "undefined" ? initialLanguage : "63"
    ),
  });

  // Bind Monaco to Yjs
  new MonacoBinding(
    yText,
    editor.getModel(),
    new Set([editor]),
    provider.awareness
  );

  console.log("✅ Yjs collaborative editor ready");
});

// ===============================
// Language Change
// ===============================
const languageDropdown = document.getElementById("language");

if (languageDropdown) {
  languageDropdown.addEventListener("change", function () {
    if (editor) {
      monaco.editor.setModelLanguage(
        editor.getModel(),
        getMonacoLanguage(this.value)
      );
    }
  });
}

// ===============================
// Run Code (unchanged)
// ===============================
async function runCode() {
  if (!editor) return;

  const code = editor.getValue();
  const language = languageDropdown.value;
  const input = document.getElementById("input")?.value || "";

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

  } catch (error) {
    document.getElementById("output").value = "Execution Failed";
  }
}

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
