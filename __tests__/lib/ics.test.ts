/**
 * @jest-environment node
 */
import { generateIcs } from "@/lib/ics";

describe("generateIcs", () => {
  const event = {
    title: "Viewing: 42 Phibsborough Road",
    start: new Date("2026-03-15T11:00:00Z"),
    location: "42 Phibsborough Road, Phibsborough, D07 X2Y3",
    description: "Asking: €425,000 | 3 bed / 1 bath | BER: C2",
  };

  it("generates valid iCalendar format", () => {
    const ics = generateIcs(event);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
  });

  it("includes event title", () => {
    expect(generateIcs(event)).toContain("SUMMARY:Viewing: 42 Phibsborough Road");
  });

  it("includes location", () => {
    expect(generateIcs(event)).toContain("LOCATION:42 Phibsborough Road");
  });

  it("includes description", () => {
    expect(generateIcs(event)).toContain("DESCRIPTION:Asking:");
  });

  it("formats start time correctly", () => {
    expect(generateIcs(event)).toContain("DTSTART:20260315T110000Z");
  });

  it("defaults to 30 min duration", () => {
    expect(generateIcs(event)).toContain("DTEND:20260315T113000Z");
  });

  it("respects custom duration", () => {
    expect(generateIcs({ ...event, durationMinutes: 60 })).toContain("DTEND:20260315T120000Z");
  });

  it("includes 1-hour reminder", () => {
    const ics = generateIcs(event);
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("TRIGGER:-PT60M");
  });

  it("escapes commas in text", () => {
    const ics = generateIcs({ ...event, location: "42 Road, Dublin, Ireland" });
    expect(ics).toContain("LOCATION:42 Road\\, Dublin\\, Ireland");
  });
});
