export interface OcrLanguage {
  code: string;
  label: string;
}

/** A curated common subset — tesseract.js supports 100+ or the full list can be added later. */
export const OCR_LANGUAGES: OcrLanguage[] = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ara", label: "Arabic" },
  { code: "rus", label: "Russian" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
];
