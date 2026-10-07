# Launch Verification — 19 August 2026

## Marketing-consent and tracking check

The English development route was opened with no stored choice. The marketing-preference prompt was visible and no tracking scripts were present before consent. After selecting **Allow marketing**, the prompt was removed and the browser confirmed the saved value `accepted` under `al-ghanem-marketing-consent-v1`.

| Integration | Confirmed loaded after consent | Configured identifier |
|---|---:|---|
| Google Tag Manager | Yes | `GTM-WNZK29H3` |
| Google Analytics 4 | Yes | `G-MXNYD0HH4Y` |
| Meta Pixel | Yes | `1037789939075260` |

The loaded GA4 script URL contains `G-MXNYD0HH4Y`, the GTM script URL contains `GTM-WNZK29H3`, and the Meta Pixel runtime was initialized after consent. This confirms consent-gated loading in the development environment. Production verification follows the deployment checkpoint.

## Public-flow observations

The desktop English navigation exposes Home, Hotel Directory, Our Approach, Reviews, About, and Contact. The homepage trust strip presents the six-language service context, the Madinah directory, direct team support, and the 17-year licensed-service statement. The short English corporate-inquiry form shows the response-time commitment alongside only the essential initial contact fields.

## Server-rendered crawlability check

The raw `/ar` HTTP response was inspected without a browser renderer. It contained the Arabic page title, Arabic meta description, Arabic Open Graph title and description, the configured share-image URL, and the complete seven-link hreflang set (six supported languages plus `x-default`). The generated sitemap contains 168 indexable URLs and 1,176 alternate-language links. `robots.txt` allows public crawling, disallows the admin and private-form routes, and points crawlers to the sitemap.

## Hotel-detail presentation check

The English Pullman Zamzam Madinah detail page displays **Central Area — South of Al-Masjid an-Nabawi**. Its Arabic counterpart presents the Arabic name first, followed by the official English name, and displays **المنطقة المركزية — جنوب المسجد النبوي**. Both routes retain Al Ghanem Travel as the sole enquiry contact and show the reviewed walking-route action.

## Production propagation check

Immediately after checkpoint `1b38d0ba`, the public `manus.space` route for Tabah Towers Hotel still returned the previous deployment’s **Property not found** page. This is treated as a propagation or cache delay rather than a content-validation result. The public route will be checked again after deployment propagation before it is reported as live.

After checkpoint `1a7c579a`, the public Al Ansar route likewise still displayed the former **Al Ansar Madinah** location-only profile with no gallery. The current checkpoint is valid locally (tests, build, and development visual inspection passed), but the public domain has not yet caught up to this deployment. A cache-busted production check is required once propagation completes.

The follow-up cache-busted production check at `?release=1a7c579a` completed successfully. The public page now returns **Al Ansar Palace Golden Tulip Hotel** and the three-image hotel gallery, confirming that the earlier response was only propagation or cache delay.
