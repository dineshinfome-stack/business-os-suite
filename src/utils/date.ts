import { format, parseISO } from "date-fns";
import { DATE_FORMAT, DATE_TIME_FORMAT } from "@/constants/dates";

export function formatDate(input: Date | string, pattern: string = DATE_FORMAT): string {
  const d = typeof input === "string" ? parseISO(input) : input;
  return format(d, pattern);
}

export function formatDateTime(input: Date | string): string {
  return formatDate(input, DATE_TIME_FORMAT);
}
