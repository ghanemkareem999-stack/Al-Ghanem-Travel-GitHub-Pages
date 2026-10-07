# Al Ghanem Travel Architecture

## Product Scope

Al Ghanem Travel is designed as a public, multilingual B2B accommodation platform for corporate religious travel. The launch market is Madinah. Makkah is represented as an inactive city record from the outset, so activating it requires content and commercial onboarding rather than a structural redesign.

## Domain Model

| Entity | Responsibility | Future scalability |
|---|---|---|
| `cities` | City identity, launch visibility, geography, and route parameters. | Makkah and further destinations are additional rows. |
| `hotels` | Non-translated hotel identity, location, portfolio status, category, coordinates, and official source URL. | Each property belongs to a city and can be imported from a verified supplier feed. |
| `hotelTranslations` | Localized property name, description, address, and SEO copy. | Supports the six launch locales and further languages. |
| `hotelRooms` | Room configuration, occupancy, inventory-ready metadata, and localized descriptions. | Supplier room feeds can map to stable room codes. |
| `hotelAmenities` | Corporate and guest amenity catalogue with locale-ready labels. | Filters remain consistent across cities. |
| `hotelGalleries` | Rights-cleared image metadata and ordering. | Partner image refreshes do not change hotel records. |
| `corporateInquiries` | All submitted B2B booking data and notification-delivery state. | Supports CRM synchronization later without losing source records. |

## Internationalization

The customer-facing experience uses six locales: English (`en`), Arabic (`ar`), Bahasa Melayu (`ms`), Urdu (`ur`), Bahasa Indonesia (`id`), and Hindi (`hi`). The locale context sets both `lang` and `dir` on the document. Arabic and Urdu render right-to-left; the other locales render left-to-right. The launch interface uses a strongly typed translation dictionary; the database carries a parallel `hotelTranslations` model for portfolio content.

## Content and Commercial Governance

The catalogue UI is ready for complete Madinah coverage, but a property becomes publicly visible only after its location, partner permission, amenities, gallery rights, and commercial representation have been verified. Exact walking distance is calculated from property coordinates at map-view time instead of being stored as a marketing assertion. This prevents stale proximity claims while preserving a high-trust client experience.

## Inquiry Delivery

Corporate inquiries are persisted before any alert is sent. The server formats every submitted field into an internal owner alert. The transactional-email module is implemented but deliberately waits for a verified `RESEND_FROM_EMAIL`; this is the only step deferred until Al Ghanem Travel selects and verifies a domain.

