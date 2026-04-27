# Void Yield 2 Design Hub

This is the canonical game design hierarchy for **progressive disclosure**.

- Start with the vision and pillars.
- Then read the gameplay systems and economy constraints.
- Then read the UI North Star and page-level interactions.
- Then read staged delivery slices.
- Finally, review unresolved questions.

## Design Document Hierarchy

1. [01 Vision & Pillars](./01-vision-pillars.md)
2. [02 Core Loops & Systems](./02-core-loops-systems.md)
3. [03 UI North Star](./03-ui-north-star.md)
4. [04 Staged Delivery Plan](./04-staged-delivery-plan.md)
5. [05 Open Questions & Risks](./05-open-questions-risks.md)

## Consolidation Notes

The previous single-file drafts had duplicated wording around:
- desktop vs mobile layout guidance,
- alert handling behavior,
- route/fuel clarity,
- early slice scope.

These are now normalized in this hierarchy:
- **Single source for page behavior:** `03-ui-north-star.md`
- **Single source for implementation order:** `04-staged-delivery-plan.md`
- **Single source for unresolved issues:** `05-open-questions-risks.md`
