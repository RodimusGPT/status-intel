# AI Data Collection Prompt v2
## Multi-Report Elite Intelligence Format

This prompt generates multiple stay reports per property, enabling proper confidence scoring.

---

## Key Requirements

1. **ELITE STATUS REQUIRED**: Only include stay reports where the traveler explicitly states their elite status (Platinum/Titanium/Ambassador)
2. **NO CAP ON REPORTS**: Include ALL elite reports you can find - more data = higher confidence
3. **SOURCE ATTRIBUTION**: Each report must reference the source (FlyerTalk user, Reddit u/username, blog)

## Confidence Tiers

| Reports | Suite Rate | Confidence | Display |
|---------|------------|------------|---------|
| 10+ | 70%+ | Very High | Most reliable |
| 5+ | 70%+ | High | Confident |
| 3+ | 50%+ | Likely | Good signal |
| 1-2 | Any | Possible | Limited data |
| 3+ | <30% | Unlikely | Confirmed rare |

## What to Include vs Skip

**INCLUDE:**
- "As a Titanium Elite, I was upgraded from a Deluxe to an Executive Suite..."
- "Checked in with my Platinum status and they moved me to floor 28..."
- "Ambassador here - used Your24 and got the Carlton Suite..."

**SKIP:**
- "Beautiful hotel, great location, room was nice" (no status mentioned)
- "We stayed here for our anniversary" (no elite context)
- Blog review that doesn't mention writer's elite status

## Research Priority

1. FlyerTalk "Marriott | Marriott Bonvoy" forum
2. Reddit r/marriottbonvoy
3. One Mile at a Time (onemileatatime.com)
4. The Points Guy (thepointsguy.com)
5. Upgraded Points

---

See the full prompt template in this repository for detailed JSON structure.
