# Verified Partner Hotel Import

Only an authenticated administrator can invoke `catalogue.importVerifiedPartnerHotel`. The import requires a normalized city slug, a verified property record, an official website URL when available, corporate-readiness data, and at least an English translation. The input schema accepts up to all six launch languages and rejects duplicated locales.

The route uses idempotent upserts for the city, hotel, and localized property content. The production workflow is therefore: validate partner authorization and image rights, collect the official source URL and map coordinates, prepare the localized content, and invoke the administrator-only import route. New galleries, rooms, amenities, and exact walking-route claims must be added only after corresponding partner materials are reviewed.
