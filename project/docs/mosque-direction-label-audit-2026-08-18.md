# Madinah Directional-Label Audit — 18 August 2026

## Purpose and method

This audit corrects the hotel-directory direction labels using the **Al-Masjid an-Nabawi Google Maps pin** as the only origin. A property below the mosque pin is classified as south, above it as north, to the map right as east, and to the map left as west. Commercial descriptions such as “North Zone” are not treated as geographic evidence.

The reference pin returned by Google Maps was `24.4674061, 39.6110589`. Each confirmed property point was retrieved through the Google Maps Places text search used by the project’s authenticated maps integration. The published UI now shows a cardinal label only for the reviewed exact-property matches below; records with an ambiguous, non-equivalent, obsolete, or unresolved search result retain a neutral Central Area or Madinah location label.

## Confirmed published labels

| Hotel | Confirmed relative sector | Public Arabic label |
|---|---|---|
| Pullman Zamzam Madinah | South | المنطقة المركزية — جنوب المسجد النبوي |
| New Madinah Hotel | South | المنطقة المركزية — جنوب المسجد النبوي |
| Crowne Plaza Madinah | South | المنطقة المركزية — جنوب المسجد النبوي |
| Radisson Hotel Madinah | South | جنوب المسجد النبوي |
| Dar Al Taqwa Madinah | North | المنطقة المركزية — شمال المسجد النبوي |
| InterContinental Dar Al Iman Madinah | North | المنطقة المركزية — شمال المسجد النبوي |
| Madinah Hilton | North | المنطقة المركزية — شمال المسجد النبوي |
| Dallah Taibah Hotel | North | المنطقة المركزية — شمال المسجد النبوي |
| The Biltmore Al Madinah Hotel | North | المنطقة المركزية — شمال المسجد النبوي |
| Saja by Warwick Madinah | North | المنطقة المركزية — شمال المسجد النبوي |
| Golden Tulip Al Zahabi | North | المنطقة المركزية — شمال المسجد النبوي |
| Al Ritz Al Madinah Hotel | North | المنطقة المركزية — شمال المسجد النبوي |
| Waqf Uthman Bin Affan Hotel | North | المنطقة المركزية — شمال المسجد النبوي |
| Al Aqeeq Hotel | North | المنطقة المركزية — شمال المسجد النبوي |
| Anwar Al Madinah Mövenpick | North-west | المنطقة المركزية — شمال غرب المسجد النبوي |
| Al Mukhtara International Hotel | North-west | المنطقة المركزية — شمال غرب المسجد النبوي |
| Ramada by Wyndham Madinah Al Hamra | South-west | المنطقة المركزية — جنوب غرب المسجد النبوي |
| Rawda Al Aqiq Hotel | West | المنطقة المركزية — غرب المسجد النبوي |
| Le Méridien Medina | West | غرب المسجد النبوي |
| DoubleTree by Hilton Madinah Gate | East | شرق المسجد النبوي |

## Explicit source boundary

Several planning names returned a different hotel, a Makkah property, a parking point, a generic district, a historical identity, or no reliable exact match. Those results are deliberately **not** used to assign a public direction. This protects the directory from replacing one incorrect label with another.

The visual inspection after the update confirms that Pullman’s hotel-detail page displays the equivalent of **“Central Area — South of Al-Masjid an-Nabawi.”**

## Arabic interface check

The Arabic Pullman detail page was checked after the change. Its heading presents **“فندق زمزم بولمان المدينة — Pullman Zamzam Madinah”**, and the accommodation-details panel presents **“المنطقة المركزية — جنوب المسجد النبوي.”** The layout remains right-to-left and the directional label is visible without relying on the former “North Zone” wording.
