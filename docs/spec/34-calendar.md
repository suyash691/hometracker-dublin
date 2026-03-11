# Module 34: Calendar Integration (Viewing Reminders)

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified

## Approach: `.ics` File Download

Generate a standard iCalendar (RFC 5545) file when the user clicks "Add to Calendar" on a house with a viewing date. The `.ics` file opens in the user's default calendar app (Google Calendar, Apple Calendar, Outlook) — no API keys, no OAuth, no dependencies.

## How It Works

1. User sets a viewing date on a house (already implemented — datetime picker on details tab)
2. User clicks "📅 Add to Calendar" button next to the viewing date
3. App generates a `.ics` file with:
   - Event title: "Viewing: 42 Phibsborough Road"
   - Start time: the viewing date/time
   - Duration: 30 minutes (default)
   - Location: the house address + eircode
   - Description: asking price, beds/baths, BER, Daft link
   - Reminder: 1 hour before
4. Browser downloads the file → user opens it → calendar app creates the event

## `.ics` Format

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HomeTracker//Viewing//EN
BEGIN:VEVENT
DTSTART:20260315T110000
DTEND:20260315T113000
SUMMARY:Viewing: 42 Phibsborough Road
LOCATION:42 Phibsborough Road, Phibsborough, D07 X2Y3
DESCRIPTION:Asking: €425,000 | 3 bed / 1 bath | BER: C2\nhttps://www.daft.ie/...
BEGIN:VALARM
TRIGGER:-PT60M
ACTION:DISPLAY
DESCRIPTION:Viewing in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR
```

## API

```
GET /api/houses/:id/calendar    → returns .ics file (Content-Type: text/calendar)
```

No new database models needed. Generates from existing House fields.

## UI

On the house detail page (details tab), next to the viewing date picker:

```
Viewing date: [2026-03-15 11:00]  📅 Add to Calendar
```

Also on the dashboard "Upcoming Viewings" section, each viewing gets a small calendar icon.

## Feasibility

- **Zero dependencies** — `.ics` is a plain text format, generated with string concatenation
- **Universal compatibility** — works on iOS, Android, macOS, Windows, Gmail, Outlook
- **No API keys** — no Google/Apple Calendar API needed
- **Offline** — works even without internet (file is generated locally)
- **~20 lines of code** for the generator function
