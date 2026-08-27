# Al Ghanem Travel: Domain-Deferred Production Launch Guide

## Current Status

The website is ready for a managed publish checkpoint. The domain-independent experience is complete: the database schema is applied; public pages, mapping, multilingual content, portfolio filters, inquiries, internal owner notifications, sitemap, robots response, and analytics-ready page metadata are in place. The two intentionally deferred items are **custom-domain assignment** and **transactional email sender verification**.

| Readiness item | Current state | Required action before live commercial launch |
|---|---|---|
| Managed hosting | Ready | Create the release checkpoint, then use the project’s **Publish** control |
| HTTPS | Managed by the hosted platform | Bind the selected custom domain through the Domains panel; HTTPS is provisioned with the hosted domain flow |
| Custom domain | Deferred | Purchase or connect a domain, then make it the primary domain |
| Canonical SEO host | Dynamic in preview | Set `CANONICAL_ORIGIN` to the final `https://` domain through the project secret/configuration flow |
| Email sender | Deferred | Verify a sender domain in Resend and set `RESEND_FROM_EMAIL` |
| Resend API key | Stored securely | Leave server-side only; rotate it immediately if it is ever exposed outside secure configuration |
| Inquiry owner alert | Active | Internal owner alert is triggered on submission; email delivery activates after sender verification |
| Property inventory | Controlled | Publish further records only through verified partner ingestion with source and rights review |
| Marketing measurement | Consent-gated readiness implemented | Add the approved GA4, GTM, and/or Meta identifiers through secure configuration; measurement scripts stay unloaded until a visitor accepts marketing cookies |
| Social accounts | Deferred by design | Provide verified official Facebook, LinkedIn, and Instagram URLs; unavailable channels remain hidden rather than linking to an unverified profile |

## Domain and HTTPS Steps

First, choose a domain that clearly represents the business. From the project management interface, open **Settings → Domains**, then either purchase a new domain or attach an existing one. If the domain is registered elsewhere, add the DNS records provided by the domain flow. After propagation and assignment, select the custom domain as the primary public address.

Once the domain resolves, set `CANONICAL_ORIGIN` to the exact HTTPS origin, for example `https://www.example.com`. This ensures that `/sitemap.xml` and `/robots.txt` emit final public URLs rather than the preview host. Check the public pages, sitemap, and robots response after the change.

> Do not publish a commercial booking campaign before the custom domain, sender identity, and customer-facing legal copy have been reviewed.

## Marketing Measurement and Social Activation

The public site contains **consent-gated** support for Google Analytics 4, Google Tag Manager, and Meta Pixel. No third-party marketing script is loaded merely because a visitor opens a page. Once an approved identifier is configured, visitors are offered a localized privacy choice; scripts load only after the visitor selects the allow option.

| Integration | Secure configuration key | Format example | Activation condition |
|---|---|---|---|
| Google Analytics 4 | `VITE_GA4_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Visitor accepts marketing measurement |
| Google Tag Manager | `VITE_GTM_ID` | `GTM-XXXXXXX` | Visitor accepts marketing measurement |
| Meta Pixel | `VITE_META_PIXEL_ID` | Numeric pixel ID | Visitor accepts marketing measurement |

Before adding an identifier, confirm the account is owned by Al Ghanem Travel and that the organization’s privacy notice and consent wording are suitable for the intended markets. Configure only the services that are genuinely required; leaving every identifier empty keeps the consent panel and third-party scripts absent.

Add Facebook, LinkedIn, and Instagram only after supplying their exact official profile URLs. The site must not link to profiles inferred from a similar name, logo, or location.

## Transactional Email Activation

Resend requires a verified sender identity for dependable transactional email delivery. In Resend, add the chosen business domain and complete its required DNS verification. Then add a sender value such as `Al Ghanem Travel <inquiries@yourdomain.com>` as `RESEND_FROM_EMAIL` through the secure configuration flow. The existing inquiry workflow will then use the server-side credential to email full inquiry details to **alghanemtravel@gmail.com** while retaining the internal owner alert as a fallback.[3]

## Pre-Publish QA

Before publishing, review the homepage, portfolio, property detail, and inquiry page at desktop and mobile widths. Submit a test inquiry only after confirming the internal notification recipient and database retention policy. Confirm that live map routes load on the public host, property source links remain current, image rights are documented, and every published property has partner-authorized content.

| Check | Acceptance criterion |
|---|---|
| Brand | Official logo, full official wording, and Arabic positioning line are visible and accurate |
| Languages | Arabic and Urdu render RTL; English, Malay, Indonesian, and Hindi render LTR |
| Contact | Telephone, both WhatsApp contacts, and email actions are reachable from header, footer, and inquiry page |
| WhatsApp | The floating action opens the Saudi WhatsApp Business number with a locale-appropriate introductory message on desktop and mobile |
| Marketing | No marketing script is present before consent; approved configured scripts load only after an affirmative choice |
| Map | Each published hotel detail page shows a property pin, nearby holy-site markers, and a live walking route to Al-Masjid an-Nabawi |
| Inquiry | Required fields validate; a saved submission produces an internal owner notification and shows a clear success state |
| SEO | Every public page has a title, description, canonical URL, Open Graph values, structured data, sitemap, and robots response |
| Performance | Images are served through managed storage and the page remains usable on a mobile connection |

## Publish and Post-Publish Monitoring

Create a verified checkpoint first. Then use the **Publish** control in the project interface to make that checkpoint public. After publishing, verify the public custom-domain pages, submit `/sitemap.xml` to the chosen search-console property, and watch production logs for errors. If a production issue arises, return to the last verified checkpoint using the version-history controls rather than modifying live code directly.

## Operating Boundaries

The current site is a corporate inquiry and portfolio platform, not an instant-confirmation booking engine. Live availability, rates, inventory, and contractual terms should remain outside public claims until they are supplied through an approved partner or inventory integration. This preserves the accuracy and trust required for B2B religious travel.

## References

[1]: https://www.taqwamadinah.com/ "Dar Al Taqwa Madinah official website"
[2]: https://www.hrs.com/en/hotel/539758 "HRS Dar Al Taqwa listing"
[3]: https://resend.com/docs/api-reference/emails/send-email "Resend send-email API reference"
