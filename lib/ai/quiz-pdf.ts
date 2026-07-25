import type { McqQuestion } from "./provider";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Builds the HTML for a quiz PDF, rendered via the site's existing HTML->PDF
 * pipeline (html2canvas + jsPDF) rather than pdf-lib's built-in fonts — MCQ
 * text often comes back in whatever language the source document was in, and
 * pdf-lib's standard fonts only cover Latin/WinAnsi text.
 */
export function buildQuizHtml(questions: McqQuestion[], includeAnswerKey: boolean): string {
  const letters = ["A", "B", "C", "D"];
  const questionsHtml = questions
    .map(
      (q, i) => `
        <div style="margin-bottom:18px;">
          <p style="font-weight:700;margin:0 0 6px;">${i + 1}. ${escapeHtml(q.question)}</p>
          ${q.options
            .map(
              (opt, j) =>
                `<p style="margin:0 0 3px 18px;">${letters[j]}. ${escapeHtml(opt)}</p>`
            )
            .join("")}
        </div>`
    )
    .join("");

  const answerKeyHtml = includeAnswerKey
    ? `
      <div style="margin-top:28px;padding-top:16px;border-top:2px solid #333;">
        <h2 style="font-size:16px;margin:0 0 10px;">Answer Key</h2>
        ${questions
          .map((q, i) => `<p style="margin:0 0 3px;">${i + 1}. ${letters[q.correctIndex]}</p>`)
          .join("")}
      </div>`
    : "";

  return `
    <div style="font-family:sans-serif;font-size:13px;line-height:1.6;color:#111;">
      <h1 style="font-size:20px;margin:0 0 16px;">Quiz</h1>
      ${questionsHtml}
      ${answerKeyHtml}
    </div>`;
}

/** Plain-text version for the .txt download. */
export function buildQuizText(questions: McqQuestion[], includeAnswerKey: boolean): string {
  const letters = ["A", "B", "C", "D"];
  const lines: string[] = [];
  questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.question}`);
    q.options.forEach((opt, j) => lines.push(`   ${letters[j]}. ${opt}`));
    lines.push("");
  });
  if (includeAnswerKey) {
    lines.push("Answer Key");
    lines.push("----------");
    questions.forEach((q, i) => lines.push(`${i + 1}. ${letters[q.correctIndex]}`));
  }
  return lines.join("\n");
}
