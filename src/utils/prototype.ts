import { formatISO, addYears, addDays, addSeconds, subHours, subMinutes, getUnixTime, subDays, isWeekend, isWithinInterval } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc, toDate, OptionsWithTZ, format } from 'date-fns-tz';

declare global {
	interface DateFormatOptions {
		format?: 'extended' | 'basic';
		representation?: 'complete' | 'date' | 'time';
	}

	interface Array<T> {
		sortByKey(key: string, desc?: boolean): T[];
	}

	interface Date {
		toISOTime(formatOptions?: DateFormatOptions): string;
		formatTime(pattern: string, timezone?: string): string;
		toLocalTime(timezone: string): Date;
		toUTCTime(timezone: string): Date;
		toUnixTime(): number;
		isWeekend(): boolean;
		isInInterval(start: Date, end: Date): boolean;
		addYears(amount: number): Date;
		addDays(amount: number): Date;
		addSeconds(amount: number): Date;
		subDays(amount: number): Date;
		subHours(amount: number): Date;
		subMinutes(amount: number): Date;
	}

	interface Number {
		toDate(options?: OptionsWithTZ): Date;
	}

	interface String {
		toDate(options?: OptionsWithTZ): Date;
	}
}

Array.prototype.sortByKey = function <T>(this: T[], key: string, desc = false): T[] {
	return this.sort((a, b) => (a[key] > b[key] ? (desc ? -1 : 1) : b[key] > a[key] ? (desc ? 1 : -1) : 0));
};

Date.prototype.toISOTime = function (this: Date, formatOptions?: DateFormatOptions): string {
	return formatISO(this, formatOptions);
};

Date.prototype.formatTime = function (this: Date, pattern: string, timezone?: string): string {
	return format(this, pattern, { timeZone: timezone });
};

Date.prototype.toLocalTime = function (this: Date, timezone: string): Date {
	return utcToZonedTime(this, timezone);
};

Date.prototype.toUTCTime = function (this: Date, timezone: string): Date {
	return zonedTimeToUtc(this, timezone);
};

Date.prototype.toUnixTime = function (this: Date): number {
	return getUnixTime(this);
};

Date.prototype.isWeekend = function (this: Date): boolean {
	return isWeekend(this);
};

Date.prototype.isInInterval = function (this: Date, start: Date, end: Date): boolean {
	return isWithinInterval(this, { start, end });
};

Date.prototype.addYears = function (this: Date, amount: number): Date {
	return addYears(this, amount);
};

Date.prototype.addDays = function (this: Date, amount: number): Date {
	return addDays(this, amount);
};

Date.prototype.addSeconds = function (this: Date, amount: number): Date {
	return addSeconds(this, amount);
};

Date.prototype.subDays = function (this: Date, amount: number): Date {
	return subDays(this, amount);
};

Date.prototype.subHours = function (this: Date, amount: number): Date {
	return subHours(this, amount);
};

Date.prototype.subMinutes = function (this: Date, amount: number): Date {
	return subMinutes(this, amount);
};

Number.prototype.toDate = function (this: Date, options?: OptionsWithTZ): Date {
	return toDate(this, options);
};

String.prototype.toDate = function (this: Date, options?: OptionsWithTZ): Date {
	return toDate(this, options);
};
