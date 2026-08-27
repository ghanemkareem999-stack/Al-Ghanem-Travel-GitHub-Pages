# Marketing Consent Validation — 19 August 2026

## Scope

This validation confirms the client-side safeguards around the configured GA4, Google Tag Manager, and Meta Pixel identifiers. It does not inspect, collect, or expose any individual visitor data.

| Check | Result |
|---|---|
| Production asset contains the configured GA4, GTM, and Meta identifiers | Confirmed during the production build. |
| GTM load is gated | Confirmed: the GTM script is injected only through the consent-controlled loader. |
| GA4 load is gated | Confirmed: the GA4 script is injected only through the consent-controlled loader and configured with `anonymize_ip: true`. |
| Meta Pixel load is gated | Confirmed: the Meta script and `PageView` call are made only through the consent-controlled loader. |
| No choice or declined choice | Confirmed by unit test: scripts cannot load. |
| Accepted choice with configured IDs | Confirmed by unit test: scripts are eligible to load. |

## Safeguard implemented

`canLoadMarketingScripts(choice, ids)` is the single testable gate for optional tracking. It returns true only when the visitor has explicitly selected `accepted` and at least one tracking identifier is configured. The consent component uses this guard for both restored choices and a new interaction.

## Validation result

TypeScript validation passed. Vitest reported **87 passed** and **1 deferred Resend credential test skipped**. The production build completed successfully. Browser preferences on a connected user browser were not changed for this validation.
