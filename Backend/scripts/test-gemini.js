import "dotenv/config";
import axios from "axios";

const provider = "gemini";
const apiKey = process.env.GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const sanitizeMessage = (message) => String(message || "Unknown Gemini API error")
  .replaceAll(apiKey || "\0", "[redacted]")
  .replace(/([?&]key=)[^&\s]+/gi, "$1[redacted]")
  .replace(/\bAIza[\w-]{20,}\b/g, "[redacted]")
  .replace(/\s+/g, " ")
  .slice(0, 400);

const printResult = (result) => {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

if (!apiKey) {
  printResult({
    provider,
    model: configuredModel,
    success: false,
    error: "GEMINI_API_KEY is missing from Backend/.env.",
  });
  process.exitCode = 1;
} else {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(configuredModel)}:generateContent`,
      {
        contents: [{ parts: [{ text: "Reply with exactly: Gemini API connection successful." }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 40 },
      },
      {
        headers: { "x-goog-api-key": apiKey },
        timeout: 20000,
      },
    );

    const generatedText = response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!generatedText) {
      const blockReason = response.data?.promptFeedback?.blockReason;
      throw new Error(blockReason
        ? `Gemini returned no text (prompt blocked: ${blockReason}).`
        : "Gemini returned a successful HTTP response but no generated text.");
    }

    printResult({
      provider,
      model: response.data?.modelVersion || configuredModel,
      success: true,
      response: sanitizeMessage(generatedText).slice(0, 240),
    });
  } catch (error) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message;
    const detail = apiMessage || error.message;
    const message = status
      ? `Gemini API returned HTTP ${status}: ${sanitizeMessage(detail)}`
      : error.code
        ? `Could not reach Gemini API (${error.code}): ${sanitizeMessage(detail)}`
        : sanitizeMessage(detail);

    printResult({
      provider,
      model: configuredModel,
      success: false,
      ...(status ? { httpStatus: status } : {}),
      error: message,
    });
    process.exitCode = 1;
  }
}
