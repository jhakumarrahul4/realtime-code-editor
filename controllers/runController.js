const axios = require("axios");

/**
 * @desc Run Code using Piston API
 * @route POST /api/run
 */
exports.runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required"
      });
    }

    // Map frontend language IDs → Piston language names
    const languageMap = {
      "63": "javascript",
      "71": "python",
      "54": "cpp",
      "50": "c",
      "62": "java"
    };

    const pistonLanguage = languageMap[language];

    if (!pistonLanguage) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language"
      });
    }

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language: pistonLanguage,
        version: "*",
        files: [
          {
            content: code
          }
        ],
        stdin: input || ""
      }
    );

    const result = response.data;

    return res.json({
      success: true,
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      code: result.run.code
    });

  } catch (error) {
    console.error("Piston Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Code execution failed"
    });
  }
};
