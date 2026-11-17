declare module 'nepali-date-converter' {
  export default class NepaliDate {
    constructor(date?: Date | string | number);
    format(formatStr: string, language?: 'np' | 'en'): string;
    getYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
  }
}
