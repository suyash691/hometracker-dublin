# Module 18: Professional Communications Tracker

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: Persona Audit (Reseller + Buyer)

## Problem

Solicitor delays are the #1 frustration in Irish conveyancing. 8-week target, 10-20 week reality. Nobody returns calls. Buyers have no way to track or escalate.

## Entity: CommLog

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk? | nullable for general comms |
| professional | enum | solicitor, broker, agent, surveyor, insurer, other |
| contactName | string | |
| direction | enum | outbound, inbound |
| method | enum | call, email, text, meeting |
| summary | string | brief note of what was discussed |
| responseNeeded | boolean | are we waiting for a reply? |
| respondedAt | datetime? | when they replied |
| createdAt | datetime | |

## Automation Level

| Aspect | Auto/Manual |
|--------|-------------|
| "Days since last response" calculation | **Auto** — computed from createdAt where responseNeeded=true and respondedAt=null |
| Overdue alerts | **Auto** — flag when >5 days without response (configurable) |
| Chase email templates | **Auto** — pre-written templates for solicitor/agent/broker |
| Escalation prompts | **Auto** — "10 days no response → here's how to escalate to the Law Society" |
| Logging each communication | **Manual** — user taps "Log call/email" with quick-entry form |
| Marking as responded | **Manual** — user taps when reply received |

## API

```
GET    /api/comms?houseId=X&professional=Y    # list, filter
POST   /api/comms                              # log new communication
PUT    /api/comms/:id                          # mark responded, edit
```

## Chase Templates

```
Solicitor (7 days): "Hi [name], just checking in on progress with [address]. Could you update us on the status of [current milestone]? Happy to provide any documents needed."

Agent (3 days): "Hi [name], following up on our bid for [address]. Could you confirm the current status and whether there are any other offers?"

Broker (5 days): "Hi [name], checking in on our mortgage application with [lender]. Are there any outstanding documents or conditions we need to address?"
```
