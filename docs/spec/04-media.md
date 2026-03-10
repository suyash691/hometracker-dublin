# Module 04: Media & Photos

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entity: Media

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| type | enum | photo, floorplan, document, video |
| filePath | string | local filesystem |
| caption | string? | |

## API

```
GET/POST  /api/houses/:id/media       # list / upload (FormData)
DELETE    /api/houses/:id/media/:mediaId
GET       /api/media/:filename         # serve file with MIME type
```

Files stored in `/data/media/`. Path traversal prevented.
