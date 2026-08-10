import type { McqQuestion } from "./provider";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const LETTERS = ["A", "B", "C", "D"];

/** Questions-only HTML: the answer key is built separately so it can be
 *  rendered as its own PDF and merged in, guaranteeing it starts on a fresh
 *  page regardless of how many pages the questions take up. */
export function buildQuestionsHtml(questions: McqQuestion[]): string {
  const questionsHtml = questions
    .map(
      (q, i) => `
        <div style="margin-bottom:18px;">
          <p style="font-weight:700;margin:0 0 6px;">${i + 1}. ${escapeHtml(q.question)}</p>
          ${q.options
            .map((opt, j) => `<p style="margin:0 0 3px 18px;">${LETTERS[j]}. ${escapeHtml(opt)}</p>`)
            .join("")}
        </div>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;font-size:13px;line-height:1.6;color:#111;">
      <h1 style="font-size:20px;margin:0 0 16px;">Quiz</h1>
      ${questionsHtml}
    </div>`;
}

export function buildAnswerKeyHtml(questions: McqQuestion[]): string {
  const rows = questions
    .map((q, i) => `<p style="margin:0 0 5px;">${i + 1}. ${LETTERS[q.correctIndex]}</p>`)
    .join("");
  return `
    <div style="font-family:sans-serif;font-size:13px;line-height:1.6;color:#111;">
      <h1 style="font-size:18px;margin:0 0 14px;">Answer Key</h1>
      ${rows}
    </div>`;
}

/** Plain-text version for the .txt download. */
export function buildQuizText(questions: McqQuestion[], includeAnswerKey: boolean): string {
  const lines: string[] = [];
  questions.forEach((q, i) => {
    lines.push(`${i + 1}. ${q.question}`);
    q.options.forEach((opt, j) => lines.push(`   ${LETTERS[j]}. ${opt}`));
    lines.push("");
  });
  if (includeAnswerKey) {
    lines.push("Answer Key");
    lines.push("----------");
    questions.forEach((q, i) => lines.push(`${i + 1}. ${LETTERS[q.correctIndex]}`));
  }
  return lines.join("\n");
}
