export function generateIcs(event: { title: string; start: Date; location: string; description: string; durationMinutes?: number }): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(event.start.getTime() + (event.durationMinutes || 30) * 60000);
  const esc = (s: string) => s.replace(/[,;\\]/g, c => "\\" + c).replace(/\n/g, "\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HomeTracker//Viewing//EN",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(event.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(event.location)}`,
    `DESCRIPTION:${esc(event.description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Viewing in 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
