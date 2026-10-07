# Al Ghanem Travel: Product Roadmap and Architecture

## Purpose

**Al Ghanem Travel | Islamic Tourism & Travel Services** is a multilingual B2B accommodation platform for corporate and religious-travel programmes. The launch scope is Madinah Al Munawwarah, with Makkah Al Mukarramah incorporated into the domain model, URL strategy, filtering model, and inquiry flow from day one. The Arabic positioning line is **«الراحة والأمان لضيوف الرحمن»**.

| Objective | Launch implementation | Future expansion path |
|---|---|---|
| Corporate demand capture | Typed B2B inquiry form with complete contact, rooming, guest, date, city, long-stay, property, and note fields | Add partner rate and availability workflows after commercial contracting |
| Hotel portfolio | Verified Madinah reference portfolio with property, gallery, rooms, amenities, map routing, and holy-site context | Ingest additional verified hotel records through the administrator-only partner-import route |
| International experience | Arabic, English, Bahasa Melayu, Urdu, Bahasa Indonesia, and Hindi | Add locale content using the same translation contract; RTL is retained for Arabic and Urdu |
| City scalability | Active Madinah city, Makkah-ready city entity and filter model | Activate Makkah inventory without a schema or route redesign |
| Search visibility | Dynamic sitemap, robots response, canonical URLs, Open Graph metadata, and business/hotel structured data | Set the canonical custom domain and register the production sitemap with search tools |

## Technology Stack

The application uses React 19 and TypeScript for the public interface, Tailwind CSS for the responsive visual system, Express and tRPC for typed server procedures, Drizzle ORM with MySQL/TiDB for data persistence, and managed S3-compatible storage for web assets. This stack deliberately separates content, operations, and presentation so new cities, hotels, translations, and inquiries can grow independently.

| Layer | Selected technology | Rationale |
|---|---|---|
| Public interface | React 19, TypeScript, Tailwind CSS, Wouter | A responsive, componentized marketing and portfolio experience with accessible interactions and RTL/LTR support |
| Application server | Express 4, tRPC 11, Zod | Typed validation from form through persistence; public and administrator-only procedures are explicitly separated |
| Data | Drizzle ORM, MySQL/TiDB | Relational structure for cities, hotels, translations, rooms, amenities, galleries, and inquiries |
| Mapping | Google Maps integration | Property-level geocoding and live walking routes to Al-Masjid an-Nabawi |
| Assets | Managed object storage | Stable delivery of the official logo and original, commercial-use-safe imagery |
| Notifications | Internal owner notification plus Resend-ready transactional email foundation | Inquiry details are persisted and owner alerts trigger on submission; real email requires a verified sender domain |

## Content and Data Model

The database is city-first. Each hotel belongs to a city and has independently localized metadata, room configuration, amenities, and gallery records. A hotel can be held in draft, marked verified, or published, while content and images remain subject to partner authorization. This prevents an unverified listing from being represented as confirmed live inventory.

```text
City
 └── Hotel
      ├── Localized hotel translations (six launch locales)
      ├── Room configurations
      ├── Corporate amenities
      ├── Gallery assets and rights status
      └── Map coordinates and verified holy-site context

Corporate inquiry
 └── Company, contact, phone, email, country, preferred city,
     rooms, guests, dates, long-stay detail, property preference, notes,
     locale, owner-notification state, email state
```

The verified partner ingestion endpoint, `catalogue.importVerifiedPartnerHotel`, is administrator-only. It rejects invalid slugs, missing English source content, repeated locales, non-verified portfolio status, and malformed public URLs. A partner record should be imported only after commercial approval, content review, location verification, and image-rights confirmation.

## Sitemap

The application serves a host-aware sitemap at `/sitemap.xml` and robots instructions at `/robots.txt`. It uses the request host during development and can be fixed to the business domain through `CANONICAL_ORIGIN` after the domain has been connected.

| Route | Purpose | Indexing role |
|---|---|---|
| `/` | Brand, B2B value proposition, destination architecture, and primary conversion paths | Primary landing page |
| `/hotels` | Madinah directory with city, category, proximity, room, gallery, and corporate-capability filters | Portfolio hub |
| `/hotels/dar-al-taqwa-madinah` | Verified property reference, gallery, rooms, amenities, holy-site context, and live walking route | Property detail template |
| `/inquiry` | Corporate bulk, group, and long-stay accommodation request | Lead generation |
| `/sitemap.xml` | Generated public URL list | Search-engine discovery |
| `/robots.txt` | Crawl allowance and sitemap reference | Crawl guidance |

## Design System

The public visual system is original to Al Ghanem Travel. It combines deep Madinah green, warm ivory, soft gold, editorial serif typography, and restrained geometric linework. The official logo is used without altering its artwork; only empty margin was trimmed to improve responsive presentation. All preview property imagery is original illustrative material and is explicitly labelled as such until a partner provides authorized property photos.

## Quality Controls Completed

The final quality suite includes TypeScript verification and Vitest coverage for authentication, inquiry logic, the verified-partner import schema, sitemap generation, language direction, and portfolio filtering/localized content. Browser verification covered the English, Arabic, Bahasa Melayu, Urdu, and Hindi property views; Arabic and Urdu were confirmed in RTL. The live map produced a route of approximately 1.1 km and 16 minutes to Al-Masjid an-Nabawi at the time of testing; the interface treats this as dynamic route output rather than a fixed claim.

## References

[1]: https://www.taqwamadinah.com/ "Dar Al Taqwa Madinah official website"
[2]: https://www.hrs.com/en/hotel/539758 "HRS Dar Al Taqwa listing"
[3]: https://resend.com/docs/api-reference/emails/send-email "Resend send-email API reference"
