import NepaliDate from 'nepali-date-converter';

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagariNumerals(num: number | string): string {
  return num
    .toString()
    .split('')
    .map((char) => {
      const n = parseInt(char, 10);
      return !isNaN(n) ? DEVANAGARI_DIGITS[n] : char;
    })
    .join('');
}

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Returns Nepal current time (UTC+5:45) as Date object
 */
export function getNepalCurrentDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  // Nepal is UTC+5:45 = +345 minutes
  return new Date(utc + 345 * 60000);
}

/**
 * Formats time in HH:mm:ss for Nepal time
 */
export function formatNepalTime(dateInput: Date = new Date(), lang: 'ne' | 'en' = 'ne'): string {
  // Convert to Nepal time zone
  const nepalDate = new Date(dateInput.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }));
  let hours = nepalDate.getHours();
  const minutes = nepalDate.getMinutes();
  const seconds = nepalDate.getSeconds();
  const ampm = hours >= 12 ? (lang === 'ne' ? 'अपराह्न' : 'PM') : (lang === 'ne' ? 'पूर्वाह्न' : 'AM');
  hours = hours % 12 || 12;

  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const sStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;

  const timeStr = `${hStr}:${mStr}:${sStr} ${ampm}`;
  return lang === 'ne' ? toDevanagariNumerals(timeStr) : timeStr;
}

/**
 * Returns formatted dual date string: e.g., "२०८३ मंसिर १ (17 Nov 2026)"
 */
export function formatDualDate(dateInput: string | Date | null | undefined, lang: 'ne' | 'en' = 'ne'): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  try {
    const nepaliDate = new NepaliDate(date);
    const bsFormatted = nepaliDate.format('YYYY MMMM D', 'np');

    const adDay = date.getDate();
    const adMonth = ENGLISH_MONTHS[date.getMonth()];
    const adYear = date.getFullYear();

    if (lang === 'ne') {
      return `${bsFormatted} (${toDevanagariNumerals(adDay)} ${adMonth} ${toDevanagariNumerals(adYear)})`;
    }
    const bsFormattedEn = nepaliDate.format('YYYY MMMM D', 'en');
    return `${bsFormattedEn} BS (${adDay} ${adMonth} ${adYear} AD)`;
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Short relative time in Nepali and English
 */
export function formatRelativeTime(dateInput: string | Date, lang: 'ne' | 'en' = 'ne'): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return lang === 'ne' ? 'भर्खरै' : 'just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return lang === 'ne' 
      ? `${toDevanagariNumerals(diffInMinutes)} मिनेट अघि` 
      : `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return lang === 'ne' 
      ? `${toDevanagariNumerals(diffInHours)} घण्टा अघि` 
      : `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return lang === 'ne' 
    ? `${toDevanagariNumerals(diffInDays)} दिन अघि` 
    : `${diffInDays}d ago`;
}
