# Hotel Search Validation — 18 August 2026

## Arabic live-search check

The Arabic homepage search was checked with the partial query **«بولمان»**. The live result list appeared immediately and returned the exact hotel profile, displayed as **«فندق زمزم بولمان المدينة — Pullman Zamzam Madinah»**, with the reviewed south-of-mosque area label. This confirms that partial Arabic name matching is active and that the selected result uses the hotel-detail route.

The search component includes complete interface labels for Arabic, English, Malay, Urdu, Indonesian, and Hindi. Its name index accepts both the Arabic and official English property names independently of the current display locale.

## Cross-language result check

After switching the same live page from Arabic to English, the existing Arabic partial-name query continued to return **Pullman Zamzam Madinah** while the search label and result-area wording changed to English. This verifies that matching data is independent from the active interface language and that the component supports both RTL and LTR presentation.

The English homepage was subsequently checked in the desktop LTR layout. The **Find a hotel** label and its name-search prompt are visible within the primary hero without disrupting the corporate enquiry and hotel-directory actions.
