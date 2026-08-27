# Initial Hotel Content Sources

## Dar Al Taqwa Madinah

The official Dar Al Taqwa website identifies the hotel as being in the courtyard of the Prophet's Mosque, approximately three metres from a main entrance, and facing the King Fahad Gate ladies' entrance. It describes a roughly 25-minute drive from Madinah International Airport. Its published room examples include Standard King Haram View (27 m², two guests), Standard Twin Beds Haram View (26 m², two guests), and Deluxe King Bed Haram View (30 m², two guests). The hotel also presents meetings and events capability and multiple food-and-beverage venues.

Source: [Dar Al Taqwa Madinah official website](https://www.taqwamadinah.com/), reviewed 17 August 2026.

## Content Handling Decision

All production property content must be verified against the relevant hotel or partner source before publishing. The initial UI can use this verified entry as a portfolio demonstration; photo assets must be rights-cleared or supplied by Al Ghanem Travel before commercial launch. Walking distance remains map-derived at runtime rather than a hard-coded claim.

## Corporate Inquiry Email Delivery

The planned transactional-email integration uses the Resend Email API. Its official documentation specifies a `POST /emails` request with a verified sender (`from`), recipient (`to`), subject, and HTML or plain-text content. Each inquiry will use the supplied business email as the intended recipient and the enquirer email as the reply-to address, with an idempotency key derived from the persisted inquiry ID to prevent duplicate notifications.

Source: [Resend Send Email API](https://resend.com/docs/api-reference/emails/send-email), reviewed 17 August 2026.

## Map Route Verification

The property-detail map was verified in the development preview on 17 August 2026. The live walking-route service resolved the Dar Al Taqwa location to Al-Masjid an-Nabawi and returned 1.1 km with an approximate 16-minute walking duration at the time of verification. The interface intentionally treats this as live route output rather than static marketing copy because routing conditions and endpoints can vary.

## Sitemap Verification

The dynamic sitemap endpoint was verified in the HTTPS development preview on 17 August 2026. It produced HTTPS URLs for the homepage, hotel directory, verified property detail page, and corporate inquiry page. When a custom domain is selected, `CANONICAL_ORIGIN` should be set to that domain so the same endpoint emits the final public URLs.

## Nearby Holy-Site Context

The Dar Al Taqwa reference card lists Al-Masjid an-Nabawi, Jannat al-Baqi Cemetery, and King Fahad Gate as nearby context. The property’s official website describes its position opposite Gate 23 and close to the ladies’ prayer-area entrance. A secondary HRS listing states that both the Prophet’s Mosque and Baqi Cemetery are within a 10-minute walk. The interface therefore labels the sites as proximity context while keeping the exact walking duration to Al-Masjid an-Nabawi live and map-derived rather than fixed marketing content.

## RTL and Metadata Verification

The Arabic locale was checked in the browser on the verified property-detail route on 17 August 2026. Navigation, labels, summary, rooms, amenities, nearby-site context, and title switched to RTL Arabic, while the browser title retained the official English brand wording: `Dar Al Taqwa Madinah — محفظة فنادق المدينة | Al Ghanem Travel | Islamic Tourism & Travel Services`. The live walking map also resolved successfully during this check.

Bahasa Melayu and Urdu were subsequently checked on the same route. Both localized the property information, gallery labels, room configurations, amenities, nearby-site context, and page title. Urdu applied the RTL layout correctly; both titles retained `Al Ghanem Travel | Islamic Tourism & Travel Services`.

Hindi was also checked on the verified property-detail page. Its LTR layout, localized property content, local page-title segment, nearby holy-site labels, and the official English brand suffix were all present. The automated locale suite additionally covers English and Bahasa Indonesia content contracts, while the browser checks cover Arabic, Malay, Urdu, and Hindi presentation.

The English homepage was checked after returning the selector to English. Its title was `Al Ghanem Travel | Islamic Tourism & Travel Services`, and its visible header, navigation, hero, and contact identity were consistent with the approved wording.

The English hotel portfolio route was subsequently checked. Its title rendered as `Madinah Hotel Portfolio | Al Ghanem Travel | Islamic Tourism & Travel Services`, with the page title once only and the exact official brand wording retained without duplication.
