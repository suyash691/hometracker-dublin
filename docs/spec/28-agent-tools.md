# Module 28: Agent Transparency Tools

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Buyer)

## Problem

Agents work for the seller. Power imbalance is brutal. Under-quoting to generate bidding wars is common. Properties going €100k-€150k over asking.

## Features

### Under-Quoting Detection (Auto)
Compare asking price vs PPR median for area. Flag if asking is >15% below median: "⚠ This property may be under-quoted. Similar properties in [area] sold for €X on average."

### Agent Response Tracking (Semi-Auto)
Uses CommLog (Module 18) filtered by professional=agent. Auto-calculates average response time per agent across all properties.

### "What to Ask" Scripts (Auto)
Pre-populated question lists for different stages:
- **At viewing**: "How long has it been on the market?", "Are there other offers?", "Is the vendor in a chain?"
- **When bidding**: "How many registered bidders?", "What's the vendor's timeline?", "Will they accept subject to survey?"
- **After sale agreed**: "When can we expect contracts?", "Are there any known title issues?"

## API

Leverages existing CommLog + PPRComparable APIs. No new entities needed. Under-quoting detection is a computed field on house detail.
