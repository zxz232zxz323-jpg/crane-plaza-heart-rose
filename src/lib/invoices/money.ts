const ONES = [
  "صفر",
  "واحد",
  "اثنان",
  "ثلاثة",
  "أربعة",
  "خمسة",
  "ستة",
  "سبعة",
  "ثمانية",
  "تسعة",
  "عشرة",
  "أحد عشر",
  "اثنا عشر",
  "ثلاثة عشر",
  "أربعة عشر",
  "خمسة عشر",
  "ستة عشر",
  "سبعة عشر",
  "ثمانية عشر",
  "تسعة عشر",
];

const TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];

const HUNDREDS = [
  "",
  "مائة",
  "مائتان",
  "ثلاثمائة",
  "أربعمائة",
  "خمسمائة",
  "ستمائة",
  "سبعمائة",
  "ثمانمائة",
  "تسعمائة",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n] ?? "";
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) return TENS[tens] ?? "";
  return `${ONES[ones]} و${TENS[tens]}`;
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (rest === 0) return HUNDREDS[hundreds] ?? "";
  return `${HUNDREDS[hundreds]} و${twoDigits(rest)}`;
}

type Forms = [string, string, string, string];

function group(n: number, forms: Forms): string {
  if (n === 1) return forms[0];
  if (n === 2) return forms[1];
  if (n >= 3 && n <= 10) return `${threeDigits(n)} ${forms[2]}`;
  return `${threeDigits(n)} ${forms[3]}`;
}

export function integerToWords(n: number): string {
  if (n === 0) return "صفر";
  if (n < 0 || n > 999_999_999_999) return String(n);
  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (billions) parts.push(group(billions, ["مليار", "ملياران", "مليارات", "مليار"]));
  if (millions) parts.push(group(millions, ["مليون", "مليونان", "ملايين", "مليون"]));
  if (thousands) parts.push(group(thousands, ["ألف", "ألفان", "آلاف", "ألف"]));
  if (rest) parts.push(threeDigits(rest));
  return parts.join(" و");
}

function dinarPhrase(n: number): string {
  if (n === 1) return "دينار عراقي واحد";
  if (n === 2) return "ديناران عراقيان";
  if (n >= 3 && n <= 10) return `${integerToWords(n)} دنانير عراقية`;
  return `${integerToWords(n)} دينار عراقي`;
}

function filsPhrase(n: number): string {
  if (n === 1) return "فلس واحد";
  if (n === 2) return "فلسان";
  if (n >= 3 && n <= 10) return `${integerToWords(n)} فلوس`;
  return `${integerToWords(n)} فلساً`;
}

/** Formal amount line used in the «المبلغ كتابة» cell. */
export function amountToArabic(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  const sign = amount < 0 ? "سالب " : "";
  let abs = Math.abs(amount);
  let dinar = Math.floor(abs + 1e-8);
  let fils = Math.round((abs - dinar) * 1000);
  if (fils >= 1000) {
    dinar += Math.floor(fils / 1000);
    fils %= 1000;
  }
  if (dinar === 0 && fils === 0) return "فقط صفر دينار عراقي لا غير";
  const parts: string[] = [];
  if (dinar > 0) parts.push(dinarPhrase(dinar));
  if (fils > 0) parts.push(filsPhrase(fils));
  return `فقط ${sign}${parts.join(" و")} لا غير`;
}

export function roundMoney(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

export function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return "";
  const negative = n < 0;
  const abs = roundMoney(Math.abs(n));
  const [whole, frac] = abs.toFixed(3).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const trimmed = frac.replace(/0+$/, "");
  const body = trimmed ? `${grouped}.${trimmed}` : grouped;
  return negative ? `-${body}` : body;
}

export function formatQty(n: number): string {
  if (!Number.isFinite(n)) return "";
  const rounded = roundMoney(n);
  return String(rounded);
}
