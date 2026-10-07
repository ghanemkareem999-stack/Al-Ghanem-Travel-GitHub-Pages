import { describe, expect, it } from "vitest";
import { locales } from "./i18n";
import { canonicalHotelProfiles as hotelProfiles, filterHotels, getHotelAreaLabel, getHotelContent, getHotelDisplayName, getPublicLocationState, getPublicLocationUrl, legacyHotelSlugAliases, publicServicedApartmentSlugs, searchHotelsByName, sortHotelsForDirectory } from "./portfolio";
import { planningCopy } from "./planningCopy";

describe("hotel portfolio filtering", () => {
  it("returns the verified Madinah property for matching city, corporate, proximity, gallery, and room filters", () => {
    const results = filterHotels(hotelProfiles, { query: "", category: "all", city: "madinah", proximity: "haram_side", corporateOnly: true, galleryOnly: true, minimumRooms: 2 }, "en");
    expect(results).toHaveLength(1);
    expect(results[0]?.slug).toBe("dar-al-taqwa-madinah");
  });

  it("uses one disclosed Madinah destination placeholder for the three records without property photography", () => {
    const slugs = ["diyar-al-sater-madinah", "lulu-al-arab-madinah", "luluat-quba-madinah"];
    for (const slug of slugs) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
      expect(hotel.galleryKind).toBe("destination_placeholder");
      expect(hotel.galleryNote).toBe("Madinah destination image — not property photography");
    }
  });

  it("does not leave priority records on the destination placeholder after matched media is found", () => {
    const prioritySlugs = ["nusk-al-eman-hotel", "sidrat-al-madina", "sidra-alia-al-dahabi-madinah", "taqwa-manazil-madina", "karam-al-sada-madinah"];
    for (const slug of prioritySlugs) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel.gallery.length).toBeGreaterThan(0);
      expect(hotel.galleryKind).not.toBe("destination_placeholder");
    }
  });

  it("adds the owner-provided Karam Al Saadah room set only to the Karam Al Saadah gallery", () => {
    const karam = hotelProfiles.find(profile => profile.slug === "karam-al-sada-madinah")!;
    const ownerProvidedKaramImages = [
      "/manus-storage/karam-al-saadah-triple-room-a-owner-2026-08-27_64f2bc5a.png",
      "/manus-storage/karam-al-saadah-triple-room-b-owner-2026-08-27_6fdde471.png",
      "/manus-storage/karam-al-saadah-family-room-owner-2026-08-27_abf386c5.png",
      "/manus-storage/karam-al-saadah-triple-room-c-owner-2026-08-27_cd37de23.png",
      "/manus-storage/karam-al-saadah-bathroom-owner-2026-08-27_c232bec4.png",
      "/manus-storage/karam-al-saadah-family-room-d-owner-2026-08-27_f1f7e4c9.png",
      "/manus-storage/karam-al-saadah-room-desk-owner-2026-08-27_ea734fff.png",
    ];
    expect(karam.gallery).toEqual(expect.arrayContaining(ownerProvidedKaramImages));
    const otherGalleries = hotelProfiles.filter(profile => profile.slug !== karam.slug).flatMap(profile => profile.gallery);
    for (const image of ownerProvidedKaramImages) {
      expect(otherGalleries).not.toContain(image);
    }
  });

  it("keeps the exact galleries for priority records that already have matched media", () => {
    for (const slug of ["grand-plaza-al-madinah", "grand-plaza-badr-al-maqam", "al-rehab-madinah", "novotel-madinah", "nusk-al-eman-hotel", "nusk-al-madinah-hotel", "manar-al-eiman-madinah", "jiwar-taiba-madinah", "sidrat-al-madina", "sidra-alia-al-dahabi-madinah", "taqwa-manazil-madina", "karam-al-sada-madinah"]) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel.gallery.length).toBeGreaterThan(0);
      expect(hotel.galleryKind).not.toBe("destination_placeholder");
    }
  });

  it("places all twelve requested priority hotels first in the directory", () => {
    const prioritySlugs = ["grand-plaza-al-madinah", "grand-plaza-badr-al-maqam", "al-rehab-madinah", "novotel-madinah", "nusk-al-eman-hotel", "nusk-al-madinah-hotel", "manar-al-eiman-madinah", "sidrat-al-madina", "sidra-alia-al-dahabi-madinah", "jiwar-taiba-madinah", "taqwa-manazil-madina", "karam-al-sada-madinah"];
    expect(sortHotelsForDirectory(hotelProfiles, "ar").slice(0, prioritySlugs.length).map(hotel => hotel.slug)).toEqual(prioritySlugs);
  });

  it("adds View Al Madinah as a searchable central-area record without presenting generic imagery as hotel photography", () => {
    const hotel = hotelProfiles.find(profile => profile.slug === "view-al-madinah-hotel");
    expect(hotel).toMatchObject({
      name: "View Al Madinah Hotel",
      arabicName: "فندق فيو المدينة",
      proximityBand: "central",
      galleryKind: "destination_placeholder",
      galleryNote: "Madinah destination image — not property photography",
    });
    expect(hotel?.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(searchHotelsByName(hotelProfiles, "فيو المدينة")).toContainEqual(hotel);
    expect(searchHotelsByName(hotelProfiles, "View Hotel")).toContainEqual(hotel);
  });

  it("adds The Seasons Hotel with a reviewed Bani Harithah property location and a disclosed non-property image", () => {
    const hotel = hotelProfiles.find(profile => profile.slug === "the-seasons-hotel-madinah");
    expect(hotel).toMatchObject({
      name: "The Seasons Hotel",
      arabicName: "فندق ذا سيزونز",
      proximityBand: "city",
      galleryKind: "destination_placeholder",
      verification: { evidenceLevel: "map_listing", locationStatus: "property_point_reviewed" },
    });
    expect(hotel?.mapAddress).toContain("Bani Harithah");
    expect(hotel?.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(searchHotelsByName(hotelProfiles, "The Seasons Hotels")).toContainEqual(hotel);
    expect(searchHotelsByName(hotelProfiles, "ذا سيزونز")).toContainEqual(hotel);
  });

  it("adds Season Star Hotel Madinah with an independently reviewed location and no implied property photography", () => {
    const hotel = hotelProfiles.find(profile => profile.slug === "season-star-hotel-madinah");
    expect(hotel).toMatchObject({
      name: "Season Star Hotel Madinah",
      arabicName: "فندق سيزون ستار المدينة",
      proximityBand: "city",
      galleryKind: "destination_placeholder",
      verification: { evidenceLevel: "map_listing", locationStatus: "property_point_reviewed" },
    });
    expect(hotel?.mapAddress).toContain("King Abdul Aziz Road");
    expect(hotel?.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(searchHotelsByName(hotelProfiles, "Season Star")).toContainEqual(hotel);
    expect(searchHotelsByName(hotelProfiles, "سيزون ستار")).toContainEqual(hotel);
  });

  it("adds SureStay by Best Western Madinah with its current brand identity and disclosed general imagery", () => {
    const hotel = hotelProfiles.find(profile => profile.slug === "surestay-by-best-western-madinah");
    expect(hotel).toMatchObject({
      name: "SureStay by Best Western Madinah",
      arabicName: "فندق شورستاي باي بست ويسترن المدينة",
      proximityBand: "city",
      galleryKind: "destination_placeholder",
      verification: { evidenceLevel: "official_property", locationStatus: "property_point_reviewed" },
    });
    expect(hotel?.mapAddress).toContain("Bani Harithah");
    expect(hotel?.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(searchHotelsByName(hotelProfiles, "SureStay")).toContainEqual(hotel);
    expect(searchHotelsByName(hotelProfiles, "بست ويسترن")).toContainEqual(hotel);
  });

  it("searches localized property content", () => {
    const results = filterHotels(hotelProfiles, { query: "اجتماعات", category: "all", city: "all", proximity: "all", corporateOnly: false, galleryOnly: false, minimumRooms: 0 }, "ar");
    expect(results.map(hotel => hotel.slug)).toEqual(expect.arrayContaining(["dar-al-taqwa-madinah", "biltmore-al-madinah", "new-madinah-hotel"]));
  });

  it("returns Arabic and English hotel-name matches in every supported interface locale", () => {
    const pullman = hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!;
    const baseFilters = { category: "all" as const, city: "all" as const, proximity: "all" as const, corporateOnly: false, galleryOnly: false, minimumRooms: 0 };

    for (const locale of locales) {
      expect(filterHotels([pullman], { ...baseFilters, query: "Pullman" }, locale)).toEqual([pullman]);
      expect(filterHotels([pullman], { ...baseFilters, query: "بولمان" }, locale)).toEqual([pullman]);
      expect(filterHotels([pullman], { ...baseFilters, query: "زمزم" }, locale)).toEqual([pullman]);
    }
  });

  it("sorts the public directory by premium category, verification strength, and authorized gallery availability", () => {
    const template = hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!;
    const ranked = filterHotels([
      { ...template, slug: "executive-official", name: "Executive Official", category: "executive", gallery: [], status: "verified", corporateReady: false, verification: { ...template.verification, evidenceLevel: "official_property" } },
      { ...template, slug: "premium-map-gallery", name: "Premium Map Gallery", category: "premium", gallery: ["/matched-gallery.jpg"], status: "verified", corporateReady: false, verification: { ...template.verification, evidenceLevel: "map_listing" } },
      { ...template, slug: "premium-official-gallery", name: "Premium Official Gallery", category: "premium", gallery: ["/matched-gallery.jpg"], status: "verified", corporateReady: false, verification: { ...template.verification, evidenceLevel: "official_property" } },
    ], { query: "", category: "all", city: "madinah", proximity: "all", corporateOnly: false, galleryOnly: false, minimumRooms: 0 }, "en");
    expect(ranked.map(hotel => hotel.slug)).toEqual(["premium-official-gallery", "premium-map-gallery", "executive-official"]);
  });

  it("matches a full or partial hotel name in Arabic and English", () => {
    expect(searchHotelsByName(hotelProfiles, "pull").map(hotel => hotel.slug)).toContain("pullman-zamzam-madinah");
    const pullman = hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!;
    expect(pullman).toMatchObject({ name: "Pullman Zamzam Madina", searchAliases: ["Pullman Zamzam Madinah"] });
    expect(searchHotelsByName([pullman], "Pullman Zamzam Madinah")).toEqual([pullman]);
    expect(searchHotelsByName(hotelProfiles, "بولمان").map(hotel => hotel.slug)).toContain("pullman-zamzam-madinah");
    expect(searchHotelsByName(hotelProfiles, "الذهبي").map(hotel => hotel.slug)).toContain("golden-tulip-al-zahabi");
    expect(searchHotelsByName(hotelProfiles, "   ")).toEqual([]);
  });

  it("keeps serviced apartments out of the public hotel directory while retaining the verified Waqf hotel profile", () => {
    expect([...publicServicedApartmentSlugs]).toEqual([
      "al-shorfa-serviced-apartments",
      "al-diyafah-serviced-apartments",
      "al-awali-serviced-apartments",
      "al-aqiq-awali-apartments",
      "retaj-awali-apartments",
    ]);
    for (const slug of publicServicedApartmentSlugs) expect(hotelProfiles.some(hotel => hotel.slug === slug)).toBe(false);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-waqf-serviced-apartments")).toMatchObject({ name: "Waqf Uthman Bin Affan Hotel" });
  });

  it("adds clear central-area hotel candidates as location-first profiles without gate routes", () => {
    const candidates = [
      ["jayden-hotel-madinah", "Jayden Hotel", "فندق جايدن"],
    ] as const;
    for (const [slug, name, arabicName] of candidates) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel).toMatchObject({ name, arabicName, status: "verification_pending", proximityBand: "central" });
      expect(hotel.nearestGate).toBeUndefined();
      expect(getPublicLocationState(hotel)).toBe("property_location");
      expect(hotel.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    }
  });

  it("adds a matched Valy Al Madinah gallery while retaining its location-first route safeguard", () => {
    const valy = hotelProfiles.find(profile => profile.slug === "valy-al-madinah-hotel")!;
    expect(valy).toMatchObject({ name: "Valy Al Madinah Hotel", arabicName: "فندق فالي المدينة", status: "verification_pending", proximityBand: "central" });
    expect(valy.gallery).toEqual([
      "/manus-storage/valy-al-madinah-hotel-exterior-2026_e706d6e4.jpg",
      "/manus-storage/valy-al-madinah-hotel-room-2026_64284af8.jpg",
      "/manus-storage/valy-al-madinah-hotel-lobby-2026_ab1a8bc2.jpeg",
    ]);
    expect(valy.galleryNote).toBe("Hotel gallery");
    expect(valy.nearestGate).toBeUndefined();
    expect(getPublicLocationState(valy)).toBe("property_location");
  });

  it("adds a matched Makarem Burj Al Madinah gallery while retaining its location-first route safeguard", () => {
    const makarem = hotelProfiles.find(profile => profile.slug === "makarem-burj-al-madinah")!;
    expect(makarem).toMatchObject({ name: "Makarem Burj Al Madinah", arabicName: "فندق مكارم برج المدينة", searchAliases: ["Makarem Burj Al Madinah Hotel and Suites"], status: "verification_pending", proximityBand: "central" });
    expect(searchHotelsByName([makarem], "Makarem Burj Al Madinah Hotel and Suites")).toEqual([makarem]);
    expect(makarem.gallery).toEqual([
      "/manus-storage/makarem-burj-al-madinah-exterior-2026_33720bd0.jpg",
      "/manus-storage/makarem-burj-al-madinah-room-2026_6df6f493.jpg",
      "/manus-storage/makarem-burj-al-madinah-lounge-2026_4a4761d5.jpg",
    ]);
    expect(makarem.galleryNote).toBe("Hotel gallery");
    expect(makarem.nearestGate).toBeUndefined();
    expect(getPublicLocationState(makarem)).toBe("property_location");
  });

  it("adds a matched Jayden Hotel gallery while retaining its location-first route safeguard", () => {
    const jayden = hotelProfiles.find(profile => profile.slug === "jayden-hotel-madinah")!;
    expect(jayden).toMatchObject({ name: "Jayden Hotel", arabicName: "فندق جايدن", status: "verification_pending", proximityBand: "central" });
    expect(jayden.gallery).toEqual([
      "/manus-storage/jayden-hotel-madinah-exterior-2026_0ad0294c.jpg",
      "/manus-storage/jayden-hotel-madinah-room-2026_111d52bd.jpg",
      "/manus-storage/jayden-hotel-madinah-lobby-2026_9e4761b9.jpg",
    ]);
    expect(jayden.galleryNote).toBe("Hotel gallery");
    expect(jayden.nearestGate).toBeUndefined();
    expect(getPublicLocationState(jayden)).toBe("property_location");
  });

  it("uses the current Durra Al Madinah Hotel identity with a matched three-image gallery and no gate route", () => {
    const durrat = hotelProfiles.find(profile => profile.slug === "al-durrah-madinah")!;
    expect(durrat).toMatchObject({ name: "Durra Al Madinah Hotel", arabicName: "فندق درة المدينة", status: "planning_record", searchAliases: ["Durrat Al Madinah Hotel"] });
    expect(durrat.gallery).toEqual([
      "/manus-storage/durrat-al-madinah-hotel-exterior-2026_0317a1b8.jpg",
      "/manus-storage/durrat-al-madinah-hotel-room-2026_62d01097.jpg",
      "/manus-storage/durrat-al-madinah-hotel-lobby-2026_b8611147.jpg",
    ]);
    expect(durrat.nearestGate).toBeUndefined();
  });

  it("uses the fuller current Al Madinah Harmony Hotel name while retaining the shortened legacy name for search", () => {
    const harmony = hotelProfiles.find(hotel => hotel.slug === "madinah-harmony")!;
    expect(harmony).toMatchObject({ name: "Al Madinah Harmony Hotel", arabicName: "فندق المدينة هارموني", searchAliases: ["Madinah Harmony"] });
    expect(searchHotelsByName([harmony], "Madinah Harmony")).toEqual([harmony]);
  });

  it("uses the current Madinah Hilton name while retaining the prior word order for search", () => {
    const hilton = hotelProfiles.find(hotel => hotel.slug === "hilton-madinah")!;
    expect(hilton).toMatchObject({ name: "Madinah Hilton", arabicName: "فندق هيلتون المدينة", searchAliases: ["Hilton Madinah"] });
    expect(searchHotelsByName([hilton], "Hilton Madinah")).toEqual([hilton]);
  });

  it("uses the current Maden Hotel identity while retaining the Al Nokhba Royal Inn alias and matched three-image gallery", () => {
    const maden = hotelProfiles.find(profile => profile.slug === "al-nokhba-madinah")!;
    expect(maden).toMatchObject({
      name: "Maden Hotel (Al Nokhba Royal Inn)",
      arabicName: "فندق مادن (النخبة رويال إن)",
      status: "planning_record",
      mapAddress: expect.stringContaining("King Fahd Street"),
    });
    expect(maden.gallery).toEqual([
      "/manus-storage/maden-hotel-exterior-2026_d2fdef5f.jpg",
      "/manus-storage/maden-hotel-room-2026_52ec9449.jpg",
      "/manus-storage/maden-hotel-lobby-2026_d0cb5c07.jpg",
    ]);
    expect(searchHotelsByName([maden], "Maden")).toEqual([maden]);
    expect(searchHotelsByName([maden], "Nokhba")).toEqual([maden]);
    expect(maden.nearestGate).toBeUndefined();
    expect(getPublicLocationState(maden)).toBe("property_location");
  });

  it("uses Marriott’s current Le Méridien Medina spelling while retaining the Madinah spelling for hotel search", () => {
    const leMeridien = hotelProfiles.find(hotel => hotel.slug === "le-meridien-madinah")!;
    expect(leMeridien).toMatchObject({ name: "Le Méridien Medina", arabicName: "لو ميريديان المدينة", searchAliases: ["Le Méridien Madinah"] });
    expect(searchHotelsByName([leMeridien], "Le Méridien Madinah")).toEqual([leMeridien]);
    expect(getHotelDisplayName(leMeridien, "ar")).toBe("لو ميريديان المدينة — Le Méridien Medina");
  });

  it("uses the Dar Al Eiman Al Haram Hotel identity while retaining the generic Al Haram Hotel name for hotel search", () => {
    const alHaram = hotelProfiles.find(hotel => hotel.slug === "al-haram-hotel")!;
    expect(alHaram).toMatchObject({ name: "Dar Al Eiman Al Haram Hotel", arabicName: "فندق دار الإيمان الحرم", searchAliases: ["Al Haram Hotel"] });
    expect(searchHotelsByName([alHaram], "Al Haram Hotel")).toEqual([alHaram]);
    expect(alHaram.gallery).toContain("/manus-storage/09_dar_al_eiman_al_haram__exterior__01_e8c8d659.webp");
    expect(alHaram.gallery).toContain("/manus-storage/dar-al-eiman-al-haram-exterior_2404c84d.jpg");
    expect(getHotelDisplayName(alHaram, "ar")).toBe("فندق دار الإيمان الحرم — Dar Al Eiman Al Haram Hotel");
  });

  it("uses the Emaar Royal Hotel identity while retaining Eman Royal and Al Eiman Royal as hotel-search aliases", () => {
    const emaaRoyal = hotelProfiles.find(hotel => hotel.slug === "eman-royal")!;
    expect(emaaRoyal).toMatchObject({ name: "Emaar Royal Hotel", arabicName: "فندق إعمار رويال", searchAliases: ["Eman Royal", "Al Eiman Royal Hotel"] });
    expect(searchHotelsByName([emaaRoyal], "Al Eiman Royal Hotel")).toEqual([emaaRoyal]);
    expect(getHotelDisplayName(emaaRoyal, "ar")).toBe("فندق إعمار رويال — Emaar Royal Hotel");
  });

  it("uses the current Rua Al Hijrah Hotel identity with the Coral Al Madinah alias and a matched three-image gallery", () => {
    const rua = hotelProfiles.find(profile => profile.slug === "coral-madinah")!;
    expect(rua).toMatchObject({
      name: "Rua Al Hijrah Hotel (Coral Al Madinah)",
      arabicName: "فندق رؤى الهجرة (كورال المدينة)",
      status: "planning_record",
    });
    expect(rua.gallery).toEqual([
      "/manus-storage/rua-al-hijrah-exterior-2026_9294fda3.jpg",
      "/manus-storage/rua-al-hijrah-room-2026_d7df4501.jpg",
      "/manus-storage/rua-al-hijrah-lobby-2026_5f2cc9db.jpg",
    ]);
    expect(searchHotelsByName([rua], "Rua")).toEqual([rua]);
    expect(searchHotelsByName([rua], "Coral")).toEqual([rua]);
    expect(rua.nearestGate).toBeUndefined();
    expect(getPublicLocationState(rua)).toBe("on_request");
  });

  it("keeps Arabic and English hotel aliases available independently of the interface locale", () => {
    const pullman = hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!;
    expect(searchHotelsByName([pullman], "Pullman")).toEqual([pullman]);
    expect(searchHotelsByName([pullman], "زمزم")).toEqual([pullman]);
  });

  it("provides localized property detail and nearby holy-site records", () => {
    const hotel = hotelProfiles[0];
    expect(hotel).toBeDefined();
    if (!hotel) return;
    expect(getHotelContent(hotel, "ar").summary).toContain("يوضح الفندق موقعه");
    expect(getHotelContent(hotel, "ar").summary).not.toContain("الموقع الرسمي للفندق");
    expect(getHotelContent(hotel, "ar").nearby.nabawi).toBe("المسجد النبوي");
    expect(getHotelContent(hotel, "hi").amenities).toContain("व्यावसायिक बैठकें");
    expect(hotel.nearbySites.map(site => site.key)).toEqual(["nabawi", "baqi", "kingFahadGate"]);
  });

  it("exposes Dar Al Taqwa's reviewed property point and shorter numbered courtyard-gate route", () => {
    const darAlTaqwa = hotelProfiles.find(hotel => hotel.slug === "dar-al-taqwa-madinah")!;
    expect(darAlTaqwa).toMatchObject({ name: "Dar Al Taqwa Hotel", arabicName: "فندق دار التقوى" });
    expect(getHotelDisplayName(darAlTaqwa, "ar")).toBe("فندق دار التقوى — Dar Al Taqwa Hotel");
    expect(darAlTaqwa.mapAddress).toContain("Off Al Sitteen Street");
    expect(darAlTaqwa.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(darAlTaqwa)).toBe("gate_route");
    expect(darAlTaqwa.nearestGate?.name).toBe("Haram Courtyard Gate No. 316");
    expect(darAlTaqwa.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("keeps the Tabah Towers profiles free of unsupported facilities and gate routes while using only the reviewed Tabah gallery", () => {
    const tabahTowers = hotelProfiles.find(hotel => hotel.slug === "tabah-towers-hotel")!;
    const silverTabah = hotelProfiles.find(hotel => hotel.slug === "silver-tabah-towers-hotel")!;
    expect(tabahTowers).toMatchObject({ name: "Tabah Towers Hotel", arabicName: "فندق أبراج طابة", status: "verification_pending" });
    expect(silverTabah).toMatchObject({ name: "Silver Tabah Towers Hotel", arabicName: "فندق أبراج طابة الفضي", status: "verification_pending" });
    expect(tabahTowers.gallery).toEqual([
      "/manus-storage/tabah-towers-exterior-2026_44c9821b.jpg",
      "/manus-storage/tabah-towers-room-2026_9ce1539b.jpg",
      "/manus-storage/tabah-towers-lobby-2026_58cfca39.jpg",
    ]);
    expect(silverTabah.gallery).toEqual([
      "/manus-storage/silver-tabah-towers-exterior-2026_13ba195a.jpg",
      "/manus-storage/silver-tabah-towers-room-2026_f9f2534e.jpg",
      "/manus-storage/silver-tabah-towers-lobby-2026_d59104db.jpg",
    ]);
    for (const hotel of [tabahTowers, silverTabah]) {
      expect(hotel.content.en.amenities).toEqual([]);
      expect(hotel.nearestGate).toBeUndefined();
      expect(hotel.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
      expect(getPublicLocationState(hotel)).toBe("property_location");
    }
    expect(getHotelDisplayName(tabahTowers, "ar")).toBe("فندق أبراج طابة — Tabah Towers Hotel");
    expect(getHotelDisplayName(silverTabah, "ar")).toBe("فندق أبراج طابة الفضي — Silver Tabah Towers Hotel");
  });

  it("adds Sofitel Shahd Al Madinah only after its Accor address and Google Hotels property listing match", () => {
    const sofitel = hotelProfiles.find(hotel => hotel.slug === "sofitel-shahd-al-madinah")!;
    expect(sofitel).toMatchObject({
      name: "Sofitel Shahd Al Madinah",
      arabicName: "فندق سوفيتل شهد المدينة",
      status: "verified",
      sourceUrl: "https://all.accor.com/hotel/B9X5/index.en.shtml",
    });
    expect(sofitel.mapAddress).toContain("Building 2943 King Fahd Road");
    expect(sofitel.googleMapsPlaceUrl).toContain("24.4720979%2C39.611539");
    expect(getPublicLocationState(sofitel)).toBe("property_location");
    expect(sofitel.gallery).toEqual(["/manus-storage/sofitel-shahd-exterior_e36b9568.jpg", "/manus-storage/sofitel-shahd-room_ead5cfae.jpg", "/manus-storage/sofitel-shahd-skyline_a1cf3910.jpg"]);
    expect(sofitel.content.en.amenities).toEqual([]);
    expect(sofitel.nearestGate).toBeUndefined();
    expect(getHotelDisplayName(sofitel, "ar")).toBe("فندق سوفيتل شهد المدينة — Sofitel Shahd Al Madinah");
  });

  it("adds Dallah Taibah Hotel as a location-only record with the historical short name retained for search", () => {
    const dallah = hotelProfiles.find(hotel => hotel.slug === "dallah-taibah")!;
    expect(dallah).toMatchObject({
      name: "Dallah Taibah Hotel",
      arabicName: "فندق دلة طيبة",
      searchAliases: ["Dallah Taibah", "دلة طيبة"],
      status: "verified",
    });
    expect(dallah.mapAddress).toContain("3005 Abi Zar Street");
    expect(dallah.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(dallah)).toBe("property_location");
    expect(dallah.gallery).toEqual([
      "/manus-storage/08_dallah_taibah__exterior__01_80cb409d.webp",
      "/manus-storage/2001_eaf41eea.jpg",
      "/manus-storage/2035_PDBL_e768d003.jpg",
    ]);
    expect(dallah.content.en.amenities).toEqual([]);
    expect(dallah.nearestGate).toBeUndefined();
    expect(searchHotelsByName([dallah], "دلة")).toEqual([dallah]);
  });

  it("adds Novotel Madinah from the current Accor identity with a location-only public scope", () => {
    const novotel = hotelProfiles.find(hotel => hotel.slug === "novotel-madinah")!;
    expect(novotel).toMatchObject({
      name: "Novotel Madinah",
      arabicName: "فندق نوفوتيل المدينة المنورة",
      searchAliases: ["Novotel Al Madinah", "نوفوتيل المدينة"],
      status: "verified",
      sourceUrl: "https://all.accor.com/hotel/B9H5/index.en.shtml",
    });
    expect(novotel.mapAddress).toContain("2110 King Faisal Road");
    expect(novotel.googleMapsPlaceUrl).toContain("24.47091%2C39.60348");
    expect(getPublicLocationState(novotel)).toBe("property_location");
    expect(novotel.gallery).toEqual(["/manus-storage/novotel-madinah-room_5c83530d.jpg", "/manus-storage/novotel-madinah-exterior_557edb7c.jpg", "/manus-storage/novotel-madinah-lobby_f621b6cb.jpg"]);
    expect(novotel.content.en.amenities).toEqual([]);
    expect(novotel.nearestGate).toBeUndefined();
    expect(searchHotelsByName([novotel], "نوفوتيل")).toEqual([novotel]);
  });

  it("adds Kayan International Hotel with a matched Madinah location and no unsupported public details", () => {
    const kayan = hotelProfiles.find(hotel => hotel.slug === "kayan-international-hotel")!;
    expect(kayan).toMatchObject({
      name: "Kayan International Hotel",
      arabicName: "فندق كيان العالمي",
      searchAliases: ["Kayan Hotel", "Kayan Al Alami Hotel", "فندق كيان العالمي"],
      status: "verified",
      sourceUrl: "https://www.google.com/travel/hotels/entity/CgsI5uSS_6C446PFARAB",
    });
    expect(kayan.mapAddress).toContain("First Ring Road");
    expect(kayan.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(kayan)).toBe("property_location");
    expect(kayan.gallery).toEqual(["/manus-storage/kayan-international-lobby_793e81fa.png", "/manus-storage/kayan-international-room_9dcd4d06.jpg", "/manus-storage/kayan-international-exterior_b735c7b0.jpg"]);
    expect(kayan.content.en.amenities).toEqual([]);
    expect(kayan.nearestGate).toBeUndefined();
    expect(searchHotelsByName([kayan], "كيان")).toEqual([kayan]);
  });

  it("adds Al Manakha Rotana Madinah from matching Rotana and Google Hotels identities without a route or gallery", () => {
    const rotana = hotelProfiles.find(hotel => hotel.slug === "al-manakha-rotana-madinah")!;
    expect(rotana).toMatchObject({
      name: "Al Manakha Rotana Madinah",
      arabicName: "فندق المناخة روتانا المدينة",
      searchAliases: ["Al Manakha Rotana", "Rotana Al Manakha Madinah", "روتانا المناخة"],
      status: "verified",
      sourceUrl: "https://www.rotana.com/rotanahotelandresorts/kingdomofsaudiarabia/madinah/almanakharotana",
    });
    expect(rotana.mapAddress).toContain("Abu Ayyub Al-Ansari");
    expect(rotana.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(rotana)).toBe("property_location");
    expect(rotana.gallery).toEqual(["/manus-storage/al-manakha-rotana-exterior_f54f77cc.jpg", "/manus-storage/al-manakha-rotana-lobby_2d5a3042.jpg", "/manus-storage/al-manakha-rotana-room_3c0e81b2.jpg"]);
    expect(rotana.content.en.amenities).toEqual([]);
    expect(rotana.nearestGate).toBeUndefined();
    expect(searchHotelsByName([rotana], "المناخة")).toEqual([rotana]);
  });

  it("uses Mysk Al Balad Hotel Madinah as the current operator-facing identity with only a reviewed property location", () => {
    const mysk = hotelProfiles.find(hotel => hotel.slug === "mysk-al-balad-madinah")!;
    expect(mysk).toMatchObject({
      name: "Mysk Al Balad Hotel Madinah",
      arabicName: "فندق مسك البلد المدينة",
      searchAliases: ["Mysk Al Balad", "Mysk Touch Al Balad", "مسك البلد"],
      status: "verified",
      sourceUrl: "https://myskhotels.com/en/our-hotels/mysk-al-balad/",
    });
    expect(mysk.mapAddress).toContain("District 2767");
    expect(mysk.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(mysk)).toBe("property_location");
    expect(mysk.gallery).toEqual(["/manus-storage/mysk-al-balad-exterior_863ce27f.jpg", "/manus-storage/mysk-al-balad-room_2289e1e4.jpg", "/manus-storage/mysk-al-balad-lobby_a5d8d726.jpg"]);
    expect(mysk.content.en.amenities).toEqual([]);
    expect(mysk.nearestGate).toBeUndefined();
    expect(searchHotelsByName([mysk], "مسك")).toEqual([mysk]);
  });

  it("uses The Biltmore Al Madinah Hotel as the visible current identity while retaining Oberoi only for search", () => {
    const biltmore = hotelProfiles.find(hotel => hotel.slug === "biltmore-al-madinah")!;
    expect(biltmore).toMatchObject({
      name: "The Biltmore Al Madinah Hotel",
      arabicName: "فندق بيلتمور المدينة المنورة",
      searchAliases: ["The Biltmore Almadinah Hotel", "The Oberoi Madina"],
      status: "verified",
      sourceUrl: "https://www.thebiltmorehotels.com/en/the-biltmore-al-madinah-hotel/",
    });
    expect(biltmore.mapAddress).toContain("Zaid Bin Sabit Street");
    expect(biltmore.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(biltmore)).toBe("property_location");
    expect(biltmore.gallery).toEqual([
      "/manus-storage/biltmore-al-madinah-suite-2026_d7a31330.jpg",
      "/manus-storage/biltmore-al-madinah-dining-2026_02ff6ba3.jpg",
      "/manus-storage/biltmore-al-madinah-lobby-2026_7ff24bc8.jpg",
    ]);
    expect(biltmore.content.en.amenities).toEqual(["Meetings and events", "Dining venues", "Fitness facilities"]);
    expect(biltmore.nearestGate).toBeUndefined();
    expect(searchHotelsByName([biltmore], "Oberoi")).toEqual([biltmore]);
  });

  it("adds Maden Hotel from matching Maden and Google Hotels identities with a location-only public scope", () => {
    const maden = hotelProfiles.find(hotel => hotel.slug === "maden-hotel-madinah")!;
    expect(maden).toMatchObject({
      name: "Maden Hotel",
      arabicName: "فندق مادن",
      searchAliases: ["MADEN Hotel", "فندق مادن"],
      status: "verified",
      sourceUrl: "https://madenhotels.com/en/hotels-maden-2/",
    });
    expect(maden.mapAddress).toContain("King Fahd Road");
    expect(maden.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(maden)).toBe("property_location");
    expect(maden.gallery).toEqual(["/manus-storage/maden-hotel-exterior_24163449.jpg", "/manus-storage/maden-hotel-lobby_6a050a38.jpg", "/manus-storage/maden-hotel-room_3ff43321.jpg"]);
    expect(maden.content.en.amenities).toEqual([]);
    expect(maden.nearestGate).toBeUndefined();
    expect(searchHotelsByName([maden], "مادن")).toEqual([maden]);
  });

  it("adds Elaf Al Taqwa Hotel from matching Elaf and Google Hotels identities with a location-only scope", () => {
    const taqwa = hotelProfiles.find(hotel => hotel.slug === "elaf-al-taqwa-madinah")!;
    expect(taqwa).toMatchObject({
      name: "Elaf Al Taqwa Hotel",
      arabicName: "فندق إيلاف التقوى",
      searchAliases: ["Elaf Al Taqwa", "إيلاف التقوى"],
      status: "verified",
      sourceUrl: "https://www.elafhotels.com/en/elaf-al-taqwa",
    });
    expect(taqwa.mapAddress).toContain("Bani Khidrah");
    expect(taqwa.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(taqwa)).toBe("property_location");
    expect(taqwa.gallery).toEqual(["/manus-storage/elaf-al-taqwa-exterior_4c92e46b.jpg", "/manus-storage/elaf-al-taqwa-room_f75acbe8.jpg", "/manus-storage/elaf-al-taqwa-facade_c97b6e12.webp"]);
    expect(taqwa.content.en.amenities).toEqual([]);
    expect(taqwa.nearestGate).toBeUndefined();
    expect(searchHotelsByName([taqwa], "إيلاف")).toEqual([taqwa]);
  });

  it("uses Elaf Taiba Hotel as the current visible name while retaining the New ELAF map wording only for search", () => {
    const taiba = hotelProfiles.find(hotel => hotel.slug === "elaf-taiba-madinah")!;
    expect(taiba).toMatchObject({
      name: "Elaf Taiba Hotel",
      arabicName: "فندق إيلاف طيبة",
      searchAliases: ["New ELAF Taiba Hotel", "فندق إيلاف طيبة الجديد"],
      status: "verified",
      sourceUrl: "https://www.elafhotels.com/en/elaf-taiba",
    });
    expect(taiba.mapAddress).toContain("Bada'ah");
    expect(taiba.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(taiba)).toBe("property_location");
    expect(taiba.gallery).toEqual(["/manus-storage/elaf-taiba-lobby_c986b5f3.jpg", "/manus-storage/elaf-taiba-reception_cc5dce9c.jpg", "/manus-storage/elaf-taiba-room_873488b0.jpg"]);
    expect(taiba.content.en.amenities).toEqual([]);
    expect(taiba.nearestGate).toBeUndefined();
    expect(searchHotelsByName([taiba], "الجديد")).toEqual([taiba]);
  });

  it("adds Taiba Front Hotel from matching operator and Google Hotels identities with a location-only scope", () => {
    const taibaFront = hotelProfiles.find(hotel => hotel.slug === "taiba-front-madinah")!;
    expect(taibaFront).toMatchObject({
      name: "Taiba Front Hotel",
      arabicName: "فندق واجهة طيبة",
      searchAliases: ["Taiba Front Madinah Hotel", "Taiba Front Madinah", "واجهة طيبة"],
      status: "verified",
      sourceUrl: "https://aqeeqhotels.com/taibafronthotel/",
    });
    expect(taibaFront.mapAddress).toContain("Musab Bin Omair Street");
    expect(taibaFront.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(taibaFront)).toBe("property_location");
    expect(taibaFront.gallery).toEqual(["/manus-storage/taiba-front-exterior_6c74a068.jpg", "/manus-storage/taiba-front-lobby_090a4373.jpg", "/manus-storage/taiba-front-room_afe547c2.jpg"]);
    expect(taibaFront.content.en.amenities).toEqual([]);
    expect(taibaFront.nearestGate).toBeUndefined();
    expect(searchHotelsByName([taibaFront], "واجهة")).toEqual([taibaFront]);
  });

  it("publishes Emaar Taibah Hotel's reviewed Google Hotels route to Al Salam Gate B without unsupported details", () => {
    const emaar = hotelProfiles.find(hotel => hotel.slug === "emaar-taibah-madinah")!;
    expect(emaar).toMatchObject({
      name: "Emaar Taibah Hotel",
      arabicName: "فندق إعمار طيبة",
      searchAliases: ["Emaar Taiba Hotel", "إعمار طيبة"],
      status: "verified",
      sourceUrl: "https://www.google.com/travel/hotels/entity/ChoI9o728rWIkqaiARoNL2cvMTF0YzB2OGx5YxAB",
    });
    expect(emaar.mapAddress).toContain("FJ83+MFG");
    expect(emaar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(emaar)).toBe("gate_route");
    expect(emaar.nearestGate).toEqual({
      name: "Al Salam Gate B",
      address: "Al Salam Gate B, Al-Masjid an-Nabawi, Madinah, Saudi Arabia",
    });
    expect(emaar.verification).toMatchObject({
      evidenceLevel: "map_listing",
      reviewedOn: "2026-08-18",
      routeReviewedOn: "2026-08-20",
      locationStatus: "named_gate_verified",
    });
    expect(emaar.gallery).toEqual(["/manus-storage/emaar-taibah-exterior_78f231be.jpg", "/manus-storage/emaar-taibah-room_ba21390c.jpg", "/manus-storage/emaar-taibah-lobby_ec02733b.jpg"]);
    expect(emaar.content.en.amenities).toEqual([]);
    expect(searchHotelsByName([emaar], "إعمار")).toEqual([emaar]);
  });

  it("uses Swiss International Taba Al Salam as the current identity and exposes its reviewed route to Al Salam Gate B", () => {
    const tabaAlSalam = hotelProfiles.find(hotel => hotel.slug === "swiss-international-taba-al-salam")!;
    expect(tabaAlSalam).toMatchObject({
      name: "Swiss International Taba Al Salam",
      arabicName: "فندق سويس إنترناشيونال طيبة السلام",
      searchAliases: ["Swiss International Taba Alsalam", "Taba Al Salam", "طابة السلام"],
      status: "verified",
      sourceUrl: "https://www.alkhomri.com.sa/en/sector-details/3",
    });
    expect(tabaAlSalam.mapAddress).toContain("Al Zubair ibn Al Awwam Street");
    expect(tabaAlSalam.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(tabaAlSalam)).toBe("gate_route");
    expect(tabaAlSalam.nearestGate).toEqual({
      name: "Al Salam Gate B",
      address: "Al Salam Gate B, Al-Masjid an-Nabawi, Madinah, Saudi Arabia",
    });
    expect(tabaAlSalam.verification).toMatchObject({
      evidenceLevel: "map_listing",
      routeReviewedOn: "2026-08-20",
      locationStatus: "named_gate_verified",
    });
    expect(tabaAlSalam.gallery).toEqual(["/manus-storage/swiss-taba-al-salam-exterior_01a3803f.jpg", "/manus-storage/swiss-taba-al-salam-reception_2c2b7136.jpg", "/manus-storage/swiss-taba-al-salam-room_5756efbb.jpg"]);
    expect(tabaAlSalam.content.en.amenities).toEqual([]);
    expect(searchHotelsByName([tabaAlSalam], "طابة")).toEqual([tabaAlSalam]);
  });

  it("converts an approved owner-published hotel into a safe public profile while withholding an unreviewed gate route", async () => {
    const { ownerPublishedProfile } = await import("./portfolio");
    const profile = ownerPublishedProfile({ slug: "owner-managed-hotel", category: "executive", citySlug: "madinah", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Owner", locationVerifiedAt: new Date("2026-08-18T00:00:00.000Z"), routeVerifiedAt: null, nearestGateName: null, nearestGateAddress: null, directoryZone: "central_north", sourceStatus: "official", accessMode: "walkable", corporateReady: false, translations: [{ locale: "en", name: "Owner Managed Hotel", shortDescription: "A reviewed property point is available for this owner-managed hotel record.", longDescription: "A reviewed property point is available for this owner-managed hotel record.", address: "Madinah Al Munawwarah, Saudi Arabia" }], gallery: [] });
    expect(profile?.status).toBe("verified");
    expect(getPublicLocationState(profile!)).toBe("property_location");
    expect(profile?.nearestGate).toBeUndefined();
  });

  it("exposes New Madinah Hotel's reviewed property point and shorter Bab Al Baqi walking route", () => {
    const newMadinah = hotelProfiles.find(hotel => hotel.slug === "new-madinah-hotel")!;
    expect(newMadinah.mapAddress).toContain("Behind Shariah Court");
    expect(newMadinah.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(newMadinah)).toBe("gate_route");
    expect(newMadinah.nearestGate?.name).toBe("Bab Al Baqi");
    expect(newMadinah.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("publishes InterContinental Dar Al Hijra Madinah with its reviewed hotel gallery and King Fahad Gate route", () => {
    const darAlHijra = hotelProfiles.find(hotel => hotel.slug === "intercontinental-dar-al-hijra-madinah")!;
    expect(darAlHijra).toMatchObject({
      name: "InterContinental Dar Al Hijra Madinah",
      arabicName: "فندق دار الهجرة إنتركونتيننتال المدينة",
      status: "verified",
      proximityBand: "central",
      address: "King Fahd Road, Al Haram, Madinah 42311, Saudi Arabia",
    });
    expect(darAlHijra.gallery).toEqual([
      "/manus-storage/intercontinental-dar-al-hijra-madinah-exterior-2026_bb5bbdf7.jpg",
      "/manus-storage/intercontinental-dar-al-hijra-madinah-room-2026_6abede9f.jpg",
      "/manus-storage/intercontinental-dar-al-hijra-madinah-lounge-2026_da77c02b.jpg",
      "/manus-storage/intercontinental-dar-al-hijra-suite-owner-2026-08-27_97543624.jpg",
      "/manus-storage/intercontinental-dar-al-hijra-guest-room-owner-2026-08-27_38c94bd2.jpg",
    ]);
    expect(darAlHijra.content.en.amenities).toEqual([]);
    expect(darAlHijra.nearestGate?.name).toBe("King Fahad Gate");
    expect(darAlHijra.verification.routeReviewedOn).toBe("2026-08-21");
    expect(getPublicLocationState(darAlHijra)).toBe("gate_route");
    expect(getHotelDisplayName(darAlHijra, "ar")).toBe("فندق دار الهجرة إنتركونتيننتال المدينة — InterContinental Dar Al Hijra Madinah");
  });

  it("uses the official Al Salam Gate destination when showing the reviewed Pullman route", () => {
    const pullman = hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah");
    expect(pullman?.nearestGate).toEqual({
      name: "Al Salam Gate",
      address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia",
    });
    expect(pullman?.verification).toMatchObject({ locationStatus: "named_gate_verified", routeReviewedOn: "2026-08-17" });
    expect(getHotelAreaLabel(pullman!, "ar")).toBe("المنطقة المركزية — جنوب المسجد النبوي");
    expect(getHotelDisplayName(pullman!, "ar")).toBe("فندق زمزم بولمان المدينة — Pullman Zamzam Madina");
  });

  it("uses the mosque-centre reference for reviewed directions and shows a pending label instead of an unverified sector", () => {
    const crowne = hotelProfiles.find(hotel => hotel.slug === "crowne-plaza-madinah")!;
    const andalus = hotelProfiles.find(hotel => hotel.slug === "andalus-palace-madinah")!;
    expect(getHotelAreaLabel(crowne, "en")).toBe("Central Area — South of Al-Masjid an-Nabawi");
    expect(getHotelAreaLabel(andalus, "ar")).toBe("الموقع قيد التأكيد");
  });

  it("withholds the historical Oberoi operating identity pending confirmation of a current successor", () => {
    expect(hotelProfiles.some(hotel => hotel.slug === "oberoi-madinah")).toBe(false);
  });

  it("keeps the Hilton Garden Inn Madinah planning record visible only as verification-pending after the current official sources did not establish an active matching property", () => {
    expect(hotelProfiles.find(hotel => hotel.slug === "hilton-garden-inn-madinah")).toMatchObject({ status: "verification_pending", gallery: [], mapAddress: undefined, googleMapsPlaceUrl: undefined });
  });

  it("keeps the generic Four Points by Sheraton Madinah planning record visible only as verification-pending after Marriott did not confirm an active matching property", () => {
    expect(hotelProfiles.find(hotel => hotel.slug === "four-points-by-sheraton-madinah")).toMatchObject({ status: "verification_pending", gallery: [], mapAddress: undefined, googleMapsPlaceUrl: undefined });
  });

  it("replaces the generic Golden Tulip Madinah planning record with the current Emaar Maktan identity and searchable historical aliases", () => {
    expect(hotelProfiles.find(hotel => hotel.slug === "golden-tulip-madinah")).toBeUndefined();
    const emaarMaktan = hotelProfiles.find(hotel => hotel.slug === "emaar-maktan-madinah")!;
    expect(emaarMaktan).toMatchObject({
      name: "Emaar Maktan Hotel",
      arabicName: "فندق إعمار مكتان",
      searchAliases: ["Emaar Mektan Hotel", "Emaar Al Mektan Hotel", "Golden Tulip Al Mektan", "فندق إعمار المكتان"],
      status: "verified",
    });
    expect(emaarMaktan.mapAddress).toContain("2234 Al Salam Road");
    expect(getPublicLocationState(emaarMaktan)).toBe("property_location");
    expect(emaarMaktan.gallery).toEqual(["/manus-storage/emaar-maktan-exterior_d35561f3.jpg", "/manus-storage/emaar-maktan-room_8ca68d7f.jpg", "/manus-storage/emaar-maktan-lobby_bc65f6b5.jpg"]);
    expect(emaarMaktan.content.en.amenities).toEqual([]);
    expect(emaarMaktan.nearestGate).toBeUndefined();
    expect(searchHotelsByName([emaarMaktan], "Golden Tulip")).toEqual([emaarMaktan]);
  });

  it("adds Jiwar Al Madina Hotel from matching operator and Google Hotels identities with a location-only scope", () => {
    const jiwar = hotelProfiles.find(hotel => hotel.slug === "jiwar-al-madina")!;
    expect(jiwar).toMatchObject({
      name: "Jiwar Al Madina Hotel",
      arabicName: "فندق جوار المدينة",
      searchAliases: ["Jiwar Al-Madina", "Jiwar Hotel", "جوار المدينة"],
      status: "verified",
      sourceUrl: "https://www.jiwaralmadina.com/",
    });
    expect(jiwar.mapAddress).toContain("2736 Al Haytham ibn Abi Sinan");
    expect(jiwar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(jiwar)).toBe("property_location");
    expect(jiwar.gallery).toEqual(["/manus-storage/jiwar-al-madina-exterior_7523dcfc.jpg", "/manus-storage/jiwar-al-madina-room_33da0c94.jpg", "/manus-storage/jiwar-al-madina-lobby_72bdeb66.jpg"]);
    expect(jiwar.content.en.amenities).toEqual([]);
    expect(jiwar.nearestGate).toBeUndefined();
    expect(searchHotelsByName([jiwar], "جوار")).toEqual([jiwar]);
  });

  it("uses Maden Al Rawda Hotel as the current Maden identity while retaining Royal Inn only for search", () => {
    const rawda = hotelProfiles.find(hotel => hotel.slug === "maden-al-rawda-madinah")!;
    expect(rawda).toMatchObject({
      name: "Maden Al Rawda Hotel",
      arabicName: "فندق مادن الروضة",
      searchAliases: ["Maden Alrawda Hotel", "Al Rawda Royal Inn", "مادن الروضة"],
      status: "verified",
      sourceUrl: "https://madenhotels.com/en/hotels-maden-alrawda/",
    });
    expect(rawda.mapAddress).toContain("Al Markaziyah Al Shamaliyah");
    expect(rawda.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(rawda)).toBe("property_location");
    expect(rawda.gallery).toEqual(["/manus-storage/maden-al-rawda-exterior_c586f683.jpg", "/manus-storage/maden-al-rawda-room_208f94ca.jpg", "/manus-storage/maden-al-rawda-lobby_c760748b.jpg"]);
    expect(rawda.content.en.amenities).toEqual([]);
    expect(rawda.nearestGate).toBeUndefined();
    expect(searchHotelsByName([rawda], "Royal Inn")).toEqual([rawda]);
  });

  it("adds Faraj Almadina Hotel with its matched city property location and no unsupported hotel facts", () => {
    const faraj = hotelProfiles.find(hotel => hotel.slug === "faraj-almadina-hotel")!;
    expect(faraj).toMatchObject({
      name: "Faraj Almadina Hotel",
      arabicName: "فندق فرج المدينة",
      searchAliases: ["Faraj Al Madinah Hotel", "Faraj Al Madina Hotel", "فندق فرج المدينة"],
      status: "verified",
      proximityBand: "city",
      sourceUrl: "https://www.faraj-almadina-hotel.com/index.ar.html",
    });
    expect(faraj.mapAddress).toContain("Uthman Ibn Affan Road");
    expect(faraj.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(faraj)).toBe("property_location");
    expect(faraj.gallery).toEqual(["/manus-storage/faraj-almadina-room_7a0c1cfd.jpg", "/manus-storage/faraj-almadina-reception_7d99bd75.jpg", "/manus-storage/faraj-almadina-public-space_1345d74f.jpg"]);
    expect(faraj.content.en.amenities).toEqual([]);
    expect(faraj.nearestGate).toBeUndefined();
    expect(searchHotelsByName([faraj], "فرج")).toEqual([faraj]);
  });

  it("publishes Jawharat Al Rasheed as the exact current property identity without replacing the unresolved generic Jawhara planning record", () => {
    const jawharat = hotelProfiles.find(hotel => hotel.slug === "jawharat-al-rasheed-madinah")!;
    const genericJawhara = hotelProfiles.find(hotel => hotel.slug === "al-jawhara-madinah")!;
    expect(jawharat).toMatchObject({
      name: "Jawharat Al Rasheed Hotel",
      arabicName: "فندق جوهرة الرشيد",
      searchAliases: ["Jawhret Al Rashid Hotel", "Al Jawhara Hotel", "Al Jawhara Madinah", "فندق جوهرة الرشيد"],
      status: "verified",
      sourceUrl: "https://jawharatalrasheedhotel.com/",
    });
    expect(jawharat.mapAddress).toContain("2292 Al Salam Road");
    expect(jawharat.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(jawharat)).toBe("property_location");
    expect(jawharat.gallery).toEqual(["/manus-storage/jawharat-al-rasheed-room_34f22827.jpg", "/manus-storage/jawharat-al-rasheed-reception_9bf622aa.webp", "/manus-storage/jawharat-al-rasheed-lobby_07b04114.webp"]);
    expect(jawharat.content.en.amenities).toEqual([]);
    expect(jawharat.nearestGate).toBeUndefined();
    expect(genericJawhara.status).toBe("verification_pending");
    expect(searchHotelsByName([jawharat], "جوهرة الرشيد")).toEqual([jawharat]);
  });

  it("publishes Manarat Al Taj as an exact location-only identity without merging it into the unresolved generic Taj record", () => {
    const manarat = hotelProfiles.find(hotel => hotel.slug === "manarat-al-taj-madinah")!;
    const genericTaj = hotelProfiles.find(hotel => hotel.slug === "al-taj-madinah")!;
    expect(manarat).toMatchObject({
      name: "Manarat Al Taj Hotel",
      arabicName: "فندق منارة التاج",
      searchAliases: ["Manarat Al-Taj Hotel", "فندق منارة التاج"],
      status: "verified",
      sourceUrl: "https://www.traveloka.com/en-en/hotel/saudi-arabia/manarat-al-taj-hotel-9000000546994",
    });
    expect(manarat.mapAddress).toContain("FJ74+993");
    expect(manarat.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(manarat)).toBe("property_location");
    expect(manarat.gallery).toEqual(["/manus-storage/manarat-al-taj-lobby_2c6f6b02.jpg", "/manus-storage/manarat-al-taj-room_5539362d.jpg"]);
    expect(manarat.content.en.amenities).toEqual([]);
    expect(manarat.nearestGate).toBeUndefined();
    expect(genericTaj.status).toBe("verification_pending");
    expect(searchHotelsByName([manarat], "منارة التاج")).toEqual([manarat]);
  });

  it("publishes Manar Al Eiman with a reviewed map location only and no unsupported hotel facts", () => {
    const manar = hotelProfiles.find(hotel => hotel.slug === "manar-al-eiman-madinah")!;
    expect(manar).toMatchObject({
      name: "Manar Al Eiman Hotel",
      arabicName: "فندق منار الإيمان",
      searchAliases: ["Manar Aleiman Hotel", "Manar Al Iman Hotel", "فندق منار الإيمان"],
      status: "verified",
    });
    expect(manar.verification.evidenceLevel).toBe("map_listing");
    expect(manar.mapAddress).toContain("FJ75+VMG");
    expect(manar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(manar)).toBe("property_location");
    expect(manar.gallery).toEqual(["/manus-storage/manar-al-eiman-exterior_2abe022a.jpg", "/manus-storage/manar-al-eiman-room_762f0201.jpg", "/manus-storage/manar-al-eiman-reception_3c8fcd4d.jpg"]);
    expect(manar.content.en.amenities).toEqual([]);
    expect(manar.nearestGate).toBeUndefined();
    expect(searchHotelsByName([manar], "منار الإيمان")).toEqual([manar]);
  });

  it("publishes Bosphorus Hotel Medina with an official identity and reviewed property location only", () => {
    const bosphorus = hotelProfiles.find(hotel => hotel.slug === "bosphorus-hotel-medina")!;
    expect(bosphorus).toMatchObject({
      name: "Bosphorus Hotel Medina",
      arabicName: "فندق البوسفور المدينة",
      searchAliases: ["Le Bosphorus Al Madinah", "Bosphorus Hotel Madinah", "فندق البسفور المدينة"],
      status: "verified",
      sourceUrl: "https://bosphorus-group.com/",
    });
    expect(bosphorus.mapAddress).toContain("FJ83+RR");
    expect(bosphorus.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(bosphorus)).toBe("property_location");
    expect(bosphorus.gallery).toEqual(["/manus-storage/bosphorus-hotel-medina-exterior_e26196b8.jpg", "/manus-storage/bosphorus-hotel-medina-room_567b84cf.jpg", "/manus-storage/bosphorus-hotel-medina-lobby_81ea5be4.jpg"]);
    expect(bosphorus.content.en.amenities).toEqual([]);
    expect(bosphorus.nearestGate).toBeUndefined();
    expect(searchHotelsByName([bosphorus], "البوسفور")).toEqual([bosphorus]);
  });

  it("publishes Mirage Al Salam with a reviewed map location only and no unsupported hotel facts", () => {
    const mirage = hotelProfiles.find(hotel => hotel.slug === "mirage-al-salam-madinah")!;
    expect(mirage).toMatchObject({
      name: "Mirage Al Salam Hotel",
      arabicName: "فندق ميراج السلام",
      searchAliases: ["Mirage As Salam Hotel", "Mirage Al-Salam Hotel", "فندق ميراج السلام"],
      status: "verified",
    });
    expect(mirage.verification.evidenceLevel).toBe("map_listing");
    expect(mirage.mapAddress).toContain("FJ84+R6");
    expect(mirage.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(mirage)).toBe("property_location");
    expect(mirage.gallery).toEqual(["/manus-storage/mirage-al-salam-exterior_d7907a3e.jpg", "/manus-storage/mirage-al-salam-room_b8176cc3.jpg", "/manus-storage/mirage-al-salam-lobby_03895a4a.jpg"]);
    expect(mirage.content.en.amenities).toEqual([]);
    expect(mirage.nearestGate).toBeUndefined();
    expect(searchHotelsByName([mirage], "ميراج السلام")).toEqual([mirage]);
  });

  it("publishes Al Mokhtara Diamond with a reviewed map location only and no unsupported hotel facts", () => {
    const diamond = hotelProfiles.find(hotel => hotel.slug === "al-mukhtara-diamond-madinah")!;
    expect(diamond).toMatchObject({
      name: "Al Mokhtara Diamond Hotel",
      arabicName: "فندق المختارة الماسي",
      searchAliases: ["Al Mukhtara Almasi Hotel", "Mokhtara Diamond Hotel", "فندق المختارة الماسي"],
      status: "verified",
    });
    expect(diamond.verification.evidenceLevel).toBe("map_listing");
    expect(diamond.mapAddress).toContain("FJ83+MX9");
    expect(diamond.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(diamond)).toBe("property_location");
    expect(diamond.gallery).toEqual(["/manus-storage/al-mokhtara-diamond-exterior_755c5352.jpg", "/manus-storage/al-mokhtara-diamond-room_ad7cbe7d.jpg", "/manus-storage/al-mokhtara-diamond-lobby_eae74b23.jpg"]);
    expect(diamond.content.en.amenities).toEqual([]);
    expect(diamond.nearestGate).toBeUndefined();
    expect(searchHotelsByName([diamond], "المختارة الماسي")).toEqual([diamond]);
  });

  it("publishes Hayah Salam Silver with a reviewed map location only and no unsupported hotel facts", () => {
    const hayah = hotelProfiles.find(hotel => hotel.slug === "hayah-salam-silver-madinah")!;
    expect(hayah).toMatchObject({
      name: "Hayah Salam Silver Hotel",
      arabicName: "فندق حياة السلام الفضي",
      searchAliases: ["Hayah Al Salam Al Fadi Hotel", "Hayah Al Salam Silver Hotel", "فندق حياة السلام الفضي"],
      status: "verified",
    });
    expect(hayah.verification.evidenceLevel).toBe("map_listing");
    expect(hayah.mapAddress).toContain("FJ83+CV");
    expect(hayah.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(hayah)).toBe("property_location");
    expect(hayah.gallery).toEqual(["/manus-storage/hayah-salam-silver-exterior_dd9a41a4.jpg", "/manus-storage/hayah-salam-silver-room_bb94460c.jpg", "/manus-storage/hayah-salam-silver-reception_6727546c.jpg"]);
    expect(hayah.content.en.amenities).toEqual([]);
    expect(hayah.nearestGate).toBeUndefined();
    expect(searchHotelsByName([hayah], "حياة السلام الفضي")).toEqual([hayah]);
  });

  it("publishes Wardat Al Rayyan with a reviewed map location only and no unsupported hotel facts", () => {
    const wardat = hotelProfiles.find(hotel => hotel.slug === "wardat-al-rayyan-madinah")!;
    expect(wardat).toMatchObject({
      name: "Wardat Al Rayyan Hotel",
      arabicName: "فندق وردة الريان",
      searchAliases: ["Warda Al Rayan Hotel", "Wardat Al Rayan", "فندق وردة الريان"],
      status: "verified",
    });
    expect(wardat.verification.evidenceLevel).toBe("map_listing");
    expect(wardat.mapAddress).toContain("FJ94+J83");
    expect(wardat.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(wardat)).toBe("property_location");
    expect(wardat.gallery).toEqual(["/manus-storage/wardat-al-rayyan-exterior_73aa13d1.jpg", "/manus-storage/wardat-al-rayyan-room_bf920395.jpg", "/manus-storage/wardat-al-rayyan-family-room_56dcf20c.jpg"]);
    expect(wardat.content.en.amenities).toEqual([]);
    expect(wardat.nearestGate).toBeUndefined();
    expect(searchHotelsByName([wardat], "وردة الريان")).toEqual([wardat]);
  });

  it("publishes Al Jaad Madinah with a reviewed map location only and no unsupported hotel facts", () => {
    const jaad = hotelProfiles.find(hotel => hotel.slug === "al-jaad-madinah")!;
    expect(jaad).toMatchObject({
      name: "Al Jaad Madinah Hotel",
      arabicName: "فندق الجاد المدينة",
      searchAliases: ["Aljaad Madinah Hotel", "Jad Al Madinah Hotel", "فندق الجاد المدينة"],
      status: "verified",
    });
    expect(jaad.verification.evidenceLevel).toBe("map_listing");
    expect(jaad.mapAddress).toContain("FJ83+HF");
    expect(jaad.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(jaad)).toBe("property_location");
    expect(jaad.gallery).toEqual(["/manus-storage/al-jaad-madinah-exterior_e639324a.jpg", "/manus-storage/al-jaad-madinah-room_3a202d8e.jpg", "/manus-storage/al-jaad-madinah-lobby_e42a923d.jpg"]);
    expect(jaad.content.en.amenities).toEqual([]);
    expect(jaad.nearestGate).toBeUndefined();
    expect(searchHotelsByName([jaad], "الجاد المدينة")).toEqual([jaad]);
  });

  it("publishes Diyar Al Huda with a reviewed map location only and no unsupported hotel facts", () => {
    const huda = hotelProfiles.find(hotel => hotel.slug === "diyar-al-huda-madinah")!;
    expect(huda).toMatchObject({
      name: "Diyar Al Huda Hotel",
      arabicName: "فندق ديار الهدى",
      searchAliases: ["Diyar Al Hoda Hotel", "Diyar Al-Huda Hotel", "فندق ديار الهدى"],
      status: "verified",
    });
    expect(huda.verification.evidenceLevel).toBe("map_listing");
    expect(huda.mapAddress).toContain("FJ83+9C");
    expect(huda.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(huda)).toBe("property_location");
    expect(huda.gallery).toEqual(["/manus-storage/diyar-al-huda-exterior_1219522b.jpg", "/manus-storage/diyar-al-huda-room_d863e883.jpg", "/manus-storage/diyar-al-huda-lobby_129b280e.jpg"]);
    expect(huda.content.en.amenities).toEqual([]);
    expect(huda.nearestGate).toBeUndefined();
    expect(searchHotelsByName([huda], "ديار الهدى")).toEqual([huda]);
  });

  it("publishes Rawabi Al Zahra with a reviewed map location only and no unsupported hotel facts", () => {
    const rawabi = hotelProfiles.find(hotel => hotel.slug === "rawabi-al-zahra-madinah")!;
    expect(rawabi).toMatchObject({
      name: "Rawabi Al Zahra Hotel",
      arabicName: "فندق روابي الزهراء",
      searchAliases: ["Rawabi Al Zahraa Hotel", "Rawabi Al Zahrah Hotel", "فندق روابي الزهراء"],
      status: "verified",
    });
    expect(rawabi.verification.evidenceLevel).toBe("map_listing");
    expect(rawabi.mapAddress).toContain("FJ83+RH");
    expect(rawabi.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(rawabi)).toBe("property_location");
    expect(rawabi.gallery).toEqual(["/manus-storage/rawabi-al-zahra-lobby_fdc12dd5.jpg", "/manus-storage/rawabi-al-zahra-room_883d2751.jpg", "/manus-storage/rawabi-al-zahra-reception_d2a810b8.jpg"]);
    expect(rawabi.content.en.amenities).toEqual([]);
    expect(rawabi.nearestGate).toBeUndefined();
    expect(searchHotelsByName([rawabi], "روابي الزهراء")).toEqual([rawabi]);
  });

  it("publishes Bosphorus Hotel Al Salam as a distinct official location-only property", () => {
    const alSalam = hotelProfiles.find(hotel => hotel.slug === "bosphorus-hotel-al-salam")!;
    expect(alSalam).toMatchObject({
      name: "Bosphorus Hotel Al Salam",
      arabicName: "فندق البوسفور السلام",
      searchAliases: ["Bosphorus Al Salam Hotel", "Le Bosphorus Al Salam", "فندق البوسفور السلام"],
      status: "verified",
      sourceUrl: "https://bosphorus-group.com/",
    });
    expect(alSalam.mapAddress).toContain("Saad Ibn Abi Waqas Street");
    expect(alSalam.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(alSalam)).toBe("property_location");
    expect(alSalam.gallery).toEqual(["/manus-storage/bosphorus-al-salam-room_ece8d1fa.jpg", "/manus-storage/bosphorus-al-salam-lobby_835fb25f.jpg", "/manus-storage/bosphorus-al-salam-guest-room_d2b752a8.jpg"]);
    expect(alSalam.content.en.amenities).toEqual([]);
    expect(alSalam.nearestGate).toBeUndefined();
    expect(searchHotelsByName([alSalam], "البوسفور السلام")).toEqual([alSalam]);
  });

  it("publishes Arjwan Rose with a reviewed map location only and no unsupported hotel facts", () => {
    const arjwan = hotelProfiles.find(hotel => hotel.slug === "arjwan-rose-madinah")!;
    expect(arjwan).toMatchObject({
      name: "Arjwan Rose Hotel",
      arabicName: "فندق أرجوان روز",
      searchAliases: ["Arjwan Rose Hotel Madinah", "Arjwan Rose", "فندق ارجوان روز"],
      status: "verified",
    });
    expect(arjwan.verification.evidenceLevel).toBe("map_listing");
    expect(arjwan.mapAddress).toContain("FJ83+CCP");
    expect(arjwan.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(arjwan)).toBe("property_location");
    expect(arjwan.gallery).toEqual(["/manus-storage/arjwan-rose-exterior_1780db6d.jpg", "/manus-storage/arjwan-rose-room_63ec7629.jpg", "/manus-storage/arjwan-rose-lobby_a5dcc208.jpg"]);
    expect(arjwan.content.en.amenities).toEqual([]);
    expect(arjwan.nearestGate).toBeUndefined();
    expect(searchHotelsByName([arjwan], "أرجوان روز")).toEqual([arjwan]);
  });

  it("publishes Bosphorus Hotel Waqf Safi with its official group identity and reviewed property location only", () => {
    const waqfSafi = hotelProfiles.find(hotel => hotel.slug === "bosphorus-waqf-safi-madinah")!;
    expect(waqfSafi).toMatchObject({
      name: "Bosphorus Hotel Waqf Safi",
      arabicName: "فندق البوسفور وقف الصافي",
      searchAliases: ["Bosphorus Waqf Al Safi Hotel", "Le Bosphorus Waqf Al Safi", "فندق البسفور وقف الصافي"],
      status: "verified",
      sourceUrl: "https://bosphorus-group.com/",
    });
    expect(waqfSafi.mapAddress).toContain("FJC3+4Q");
    expect(waqfSafi.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(waqfSafi)).toBe("property_location");
    expect(waqfSafi.gallery).toEqual(["/manus-storage/bosphorus-waqf-safi-room_68fb17b3.jpg", "/manus-storage/bosphorus-waqf-safi-lobby_118aef4f.jpg", "/manus-storage/bosphorus-waqf-safi-guest-room_1c801637.jpg"]);
    expect(waqfSafi.content.en.amenities).toEqual([]);
    expect(waqfSafi.nearestGate).toBeUndefined();
    expect(searchHotelsByName([waqfSafi], "البوسفور وقف الصافي")).toEqual([waqfSafi]);
  });

  it("publishes Karam Taibah Almasi with a reviewed map location only and no unsupported hotel facts", () => {
    const karam = hotelProfiles.find(hotel => hotel.slug === "karam-taibah-almasi-madinah")!;
    expect(karam).toMatchObject({
      name: "Karam Taibah Almasi",
      arabicName: "فندق كرم طيبة الماسي",
      searchAliases: ["Karam Taibah Almasi Hotel", "Karam Taibah Al Masi", "فندق كرم طيبة الماسي"],
      status: "verified",
    });
    expect(karam.verification.evidenceLevel).toBe("map_listing");
    expect(karam.mapAddress).toContain("FJ93+RR");
    expect(karam.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(karam)).toBe("property_location");
    expect(karam.gallery).toEqual(["/manus-storage/karam-taibah-almasi-exterior_7923ee17.jpg", "/manus-storage/karam-taibah-almasi-room_97562dec.jpg", "/manus-storage/karam-taibah-almasi-lobby_cf986a55.jpg"]);
    expect(karam.content.en.amenities).toEqual([]);
    expect(karam.nearestGate).toBeUndefined();
    expect(searchHotelsByName([karam], "كرم طيبة")).toEqual([karam]);
  });

  it("publishes Holiday Villa Madinah with its official identity and reviewed property location only", () => {
    const holidayVilla = hotelProfiles.find(hotel => hotel.slug === "holiday-villa-madinah")!;
    expect(holidayVilla).toMatchObject({
      name: "Holiday Villa Madinah",
      arabicName: "فندق هوليداي فيلا المدينة",
      searchAliases: ["Holiday Villa Hotel Madinah", "Holiday Villa Medina", "فندق هوليداي فيلا المدينة"],
      status: "verified",
      sourceUrl: "https://www.holidayvillahotels.com/holiday-villa-madinah/",
    });
    expect(holidayVilla.mapAddress).toContain("FJF4+8G");
    expect(holidayVilla.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(holidayVilla)).toBe("property_location");
    expect(holidayVilla.gallery).toEqual(["/manus-storage/holiday-villa-madinah-exterior_5167df79.jpg", "/manus-storage/holiday-villa-madinah-lobby_b2a3a553.jpg", "/manus-storage/holiday-villa-madinah-room_2a0a6241.jpg"]);
    expect(holidayVilla.content.en.amenities).toEqual([]);
    expect(holidayVilla.nearestGate).toBeUndefined();
    expect(searchHotelsByName([holidayVilla], "هوليداي فيلا")).toEqual([holidayVilla]);
  });

  it("publishes Al Muna Kareem Hotel with its official identity and reviewed property location only", () => {
    const munaKareem = hotelProfiles.find(hotel => hotel.slug === "al-muna-kareem-madinah")!;
    expect(munaKareem).toMatchObject({
      name: "Al Muna Kareem Hotel",
      arabicName: "فندق المنى كريم",
      searchAliases: ["Al Muna Kareem", "Leader Al Muna Kareem Hotel", "فندق المنى كريم"],
      status: "verified",
      sourceUrl: "https://www.almunakareem.com/",
    });
    expect(munaKareem.mapAddress).toContain("FJF7+47");
    expect(munaKareem.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(munaKareem)).toBe("property_location");
    expect(munaKareem.gallery).toEqual(["/manus-storage/al-muna-kareem-exterior_51c249c5.jpg", "/manus-storage/al-muna-kareem-room_7c81c76f.jpg", "/manus-storage/al-muna-kareem-facade_8aabbab0.jpg"]);
    expect(munaKareem.content.en.amenities).toEqual([]);
    expect(munaKareem.nearestGate).toBeUndefined();
    expect(searchHotelsByName([munaKareem], "المنى كريم")).toEqual([munaKareem]);
  });

  it("publishes Dar Al Naeem Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const darAlNaeem = hotelProfiles.find(hotel => hotel.slug === "dar-al-naeem-madinah")!;
    expect(darAlNaeem).toMatchObject({
      name: "Dar Al Naeem Hotel",
      arabicName: "فندق دار النعيم",
      searchAliases: ["Dar Al-Naeem Hotel", "Dar Al Naem Hotel", "فندق دار النعيم"],
      status: "verified",
    });
    expect(darAlNaeem.verification.evidenceLevel).toBe("map_listing");
    expect(darAlNaeem.mapAddress).toContain("FJF7+C3");
    expect(darAlNaeem.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(darAlNaeem)).toBe("property_location");
    expect(darAlNaeem.gallery).toEqual(["/manus-storage/dar-al-naeem-exterior_b9f8751f.jpg", "/manus-storage/dar-al-naeem-room_885a96b0.jpg", "/manus-storage/dar-al-naeem-lobby_7f648d79.jpg"]);
    expect(darAlNaeem.content.en.amenities).toEqual([]);
    expect(darAlNaeem.nearestGate).toBeUndefined();
    expect(searchHotelsByName([darAlNaeem], "دار النعيم")).toEqual([darAlNaeem]);
  });

  it("publishes Zowar International Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const zowar = hotelProfiles.find(hotel => hotel.slug === "zowar-international-madinah")!;
    expect(zowar).toMatchObject({
      name: "Zowar International Hotel",
      arabicName: "فندق زوار إنترناشيونال",
      searchAliases: ["Zowar Alalami Hotel", "Zowar International", "فندق زوار العالمي", "فندق زوار إنترناشيونال"],
      status: "verified",
    });
    expect(zowar.verification.evidenceLevel).toBe("map_listing");
    expect(zowar.mapAddress).toContain("FJF5+8F");
    expect(zowar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(zowar)).toBe("property_location");
    expect(zowar.gallery).toEqual(["/manus-storage/zowar-international-exterior_79416168.jpg", "/manus-storage/zowar-international-room_948c2da7.jpg", "/manus-storage/zowar-international-lobby_bf154821.jpg"]);
    expect(zowar.content.en.amenities).toEqual([]);
    expect(zowar.nearestGate).toBeUndefined();
    expect(searchHotelsByName([zowar], "زوار العالمي")).toEqual([zowar]);
  });

  it("publishes Odst Al Madinah Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const odst = hotelProfiles.find(hotel => hotel.slug === "odst-al-madinah")!;
    expect(odst).toMatchObject({
      name: "Odst Al Madinah Hotel",
      arabicName: "فندق أودست المدينة",
      searchAliases: ["ODST AL Madinah Hotel", "Odst Almadinah Hotel", "فندق اودست المدينة", "فندق أودست المدينة"],
      status: "verified",
    });
    expect(odst.verification.evidenceLevel).toBe("map_listing");
    expect(odst.mapAddress).toContain("FJF5+F7");
    expect(odst.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(odst)).toBe("property_location");
    expect(odst.gallery).toEqual(["/manus-storage/odst-al-madinah-lobby_01eb9d86.jpg", "/manus-storage/odst-al-madinah-room_0518fcf4.jpg", "/manus-storage/odst-al-madinah-reception_e5707ab6.jpg"]);
    expect(odst.content.en.amenities).toEqual([]);
    expect(odst.nearestGate).toBeUndefined();
    expect(searchHotelsByName([odst], "اودست المدينة")).toEqual([odst]);
  });

  it("publishes Golden Tulip Al Ansar separately from Al Ansar Palace with official identity and reviewed location only", () => {
    const alAnsar = hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-ansar-madinah")!;
    const alAnsarPalace = hotelProfiles.find(hotel => hotel.slug === "al-ansar-madinah")!;
    expect(alAnsar).toMatchObject({
      name: "Golden Tulip Al Ansar",
      arabicName: "فندق الأنصار جولدن توليب",
      searchAliases: ["Al Ansar Golden Tulip", "Hotel Golden Tulip Al Ansar", "فندق الأنصار جولدن توليب"],
      status: "verified",
      sourceUrl: "https://al-ansar.goldentulip.com/en-us/",
    });
    expect(alAnsar.slug).not.toBe(alAnsarPalace.slug);
    expect(alAnsar.mapAddress).toContain("FJF5+38");
    expect(alAnsar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(alAnsar)).toBe("property_location");
    expect(alAnsar.gallery).toEqual(["/manus-storage/al-ansar-golden-tulip-lobby_41130aab.jpg", "/manus-storage/al-ansar-golden-tulip-interior_ca7ce72a.jpg"]);
    expect(alAnsar.gallery).not.toContain("/manus-storage/al-ansar-golden-tulip-exterior_0566de35.jpg");
    expect(alAnsar.content.en.amenities).toEqual([]);
    expect(alAnsar.nearestGate).toBeUndefined();
    expect(searchHotelsByName([alAnsar], "الأنصار جولدن توليب")).toEqual([alAnsar]);
  });

  it("publishes Emaar Elite Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const emaarElite = hotelProfiles.find(hotel => hotel.slug === "emaar-elite-madinah")!;
    expect(emaarElite).toMatchObject({
      name: "Emaar Elite Hotel",
      arabicName: "فندق إعمار إيليت",
      searchAliases: ["Emaar Elite Al Madina Hotel", "Emaar Elite Hotel Al Madinah", "فندق اعمار ايليت", "فندق إعمار إيليت"],
      status: "verified",
    });
    expect(emaarElite.verification.evidenceLevel).toBe("map_listing");
    expect(emaarElite.mapAddress).toContain("FJC4+FM");
    expect(emaarElite.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(emaarElite)).toBe("property_location");
    expect(emaarElite.gallery).toEqual(["/manus-storage/emaar-elite-exterior_9c6c7fd5.jpg", "/manus-storage/emaar-elite-room_11ff2236.jpg", "/manus-storage/emaar-elite-lobby_3dc9f58e.jpg"]);
    expect(emaarElite.content.en.amenities).toEqual([]);
    expect(emaarElite.nearestGate).toBeUndefined();
    expect(searchHotelsByName([emaarElite], "إعمار إيليت")).toEqual([emaarElite]);
  });

  it("publishes Hayah Golden Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const hayahGolden = hotelProfiles.find(hotel => hotel.slug === "hayah-golden-madinah")!;
    expect(hayahGolden).toMatchObject({
      name: "Hayah Golden Hotel",
      arabicName: "فندق الحياة الذهبي",
      searchAliases: ["Al Hayat Golden Hotel", "Al Hayah Golden Hotel", "Hayah Golden", "فندق الحياة الذهبي"],
      status: "verified",
    });
    expect(hayahGolden.verification.evidenceLevel).toBe("map_listing");
    expect(hayahGolden.mapAddress).toContain("FJ93+PV9");
    expect(hayahGolden.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(hayahGolden)).toBe("property_location");
    expect(hayahGolden.gallery).toEqual(["/manus-storage/hayah-golden-exterior_30d3097a.jpg", "/manus-storage/hayah-golden-room_6d9d51e4.webp", "/manus-storage/hayah-golden-lobby_791a5d22.jpg"]);
    expect(hayahGolden.content.en.amenities).toEqual([]);
    expect(hayahGolden.nearestGate).toBeUndefined();
    expect(searchHotelsByName([hayahGolden], "الحياة الذهبي")).toEqual([hayahGolden]);
  });

  it("publishes Grand Zowar Hotel with its operator identity and reviewed location only", () => {
    const grandZowar = hotelProfiles.find(hotel => hotel.slug === "grand-zowar-madinah")!;
    expect(grandZowar).toMatchObject({
      name: "Grand Zowar Hotel",
      arabicName: "فندق جراند الزوار",
      searchAliases: ["Grand Zowar", "Grand Zowar Hotel Madinah", "فندق جراند زوار", "جراند الزوار"],
      status: "verified",
      sourceUrl: "https://almokhtaragroup.com/ar/grand-zowar",
    });
    expect(grandZowar.mapAddress).toContain("FJ93+76");
    expect(grandZowar.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(grandZowar)).toBe("property_location");
    expect(grandZowar.gallery).toEqual(["/manus-storage/grand-zowar-lobby_f2dc01a1.jpg", "/manus-storage/grand-zowar-room_d304ff93.jpg", "/manus-storage/grand-zowar-exterior_9aceaa73.jpg"]);
    expect(grandZowar.content.en.amenities).toEqual([]);
    expect(grandZowar.nearestGate).toBeUndefined();
    expect(searchHotelsByName([grandZowar], "جراند زوار")).toEqual([grandZowar]);
  });

  it("publishes Hayah Al Huda Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const hayahAlHuda = hotelProfiles.find(hotel => hotel.slug === "hayah-al-huda-madinah")!;
    expect(hayahAlHuda).toMatchObject({
      name: "Hayah Al Huda Hotel",
      arabicName: "فندق حياة الهدى",
      searchAliases: ["Hayat Al Huda Hotel", "Hayah Al Huda", "فندق حياه الهدى", "فندق حياة الهدى"],
      status: "verified",
    });
    expect(hayahAlHuda.verification.evidenceLevel).toBe("map_listing");
    expect(hayahAlHuda.mapAddress).toContain("FJ93+9F");
    expect(hayahAlHuda.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(hayahAlHuda)).toBe("property_location");
    expect(hayahAlHuda.gallery).toEqual(["/manus-storage/hayah-al-huda-exterior_ebaddbd1.jpg", "/manus-storage/hayah-al-huda-lobby_6868152b.jpg", "/manus-storage/hayah-al-huda-room_70ce791b.jpg"]);
    expect(hayahAlHuda.content.en.amenities).toEqual([]);
    expect(hayahAlHuda.nearestGate).toBeUndefined();
    expect(searchHotelsByName([hayahAlHuda], "حياة الهدى")).toEqual([hayahAlHuda]);
  });

  it("publishes Riyadh Al Zahra Hotel with a reviewed map location only and no unsupported hotel facts", () => {
    const riyadhAlZahra = hotelProfiles.find(hotel => hotel.slug === "riyadh-al-zahra-madinah")!;
    expect(riyadhAlZahra).toMatchObject({
      name: "Riyadh Al Zahra Hotel",
      arabicName: "فندق رياض الزهراء",
      searchAliases: ["Riadh Al Zahra Hotel", "Riyadh Al Zahra", "فندق الرياض الزهراء", "فندق رياض الزهراء"],
      status: "verified",
    });
    expect(riyadhAlZahra.verification.evidenceLevel).toBe("map_listing");
    expect(riyadhAlZahra.mapAddress).toContain("FJ93+CP");
    expect(riyadhAlZahra.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(riyadhAlZahra)).toBe("property_location");
    expect(riyadhAlZahra.gallery).toEqual(["/manus-storage/riyadh-al-zahra-exterior_a867aed1.jpg", "/manus-storage/riyadh-al-zahra-room_9d4c6433.jpg", "/manus-storage/riyadh-al-zahra-lobby_7169a975.jpg"]);
    expect(riyadhAlZahra.content.en.amenities).toEqual([]);
    expect(riyadhAlZahra.nearestGate).toBeUndefined();
    expect(searchHotelsByName([riyadhAlZahra], "رياض الزهراء")).toEqual([riyadhAlZahra]);
  });

  it("publishes Waqt Al Nazeel with its operator identity and reviewed location only", () => {
    const waqtAlNazeel = hotelProfiles.find(hotel => hotel.slug === "waqt-al-nazeel-madinah")!;
    expect(waqtAlNazeel).toMatchObject({
      name: "Waqt Al Nazeel Hotel",
      arabicName: "فندق وقت النزيل",
      searchAliases: ["Waqt Al Nazeel", "فندق وقت النزيل", "وقت النزيل"],
      status: "verified",
      sourceUrl: "https://www.alzuhdigrouphotels.com/ar/hotels/8",
    });
    expect(waqtAlNazeel.verification.evidenceLevel).toBe("official_property");
    expect(waqtAlNazeel.mapAddress).toContain("FJ83+JH");
    expect(getPublicLocationState(waqtAlNazeel)).toBe("property_location");
    expect(waqtAlNazeel.gallery).toEqual(["/manus-storage/waqt-al-nazeel-madinah-lobby_86c96a14.jpg", "/manus-storage/waqt-al-nazeel-madinah-room_9931d75d.jpg", "/manus-storage/waqt-al-nazeel-madinah-room-alt_fe275acd.jpg"]);
    expect(waqtAlNazeel.content.en.amenities).toEqual([]);
    expect(waqtAlNazeel.nearestGate).toBeUndefined();
    expect(searchHotelsByName([waqtAlNazeel], "وقت النزيل")).toEqual([waqtAlNazeel]);
  });

  it("publishes Araek Taiba with a reviewed map location only and no unsupported hotel facts", () => {
    const araekTaiba = hotelProfiles.find(hotel => hotel.slug === "araek-taiba-madinah")!;
    expect(araekTaiba).toMatchObject({
      name: "Araek Taiba Hotel",
      arabicName: "فندق أرائك طيبة",
      searchAliases: ["Areek Taiba Hotel", "Araek Taiba", "فندق ارائك طيبة", "فندق أرائك طيبة"],
      status: "verified",
    });
    expect(araekTaiba.verification.evidenceLevel).toBe("map_listing");
    expect(araekTaiba.mapAddress).toContain("FJ93+VV");
    expect(araekTaiba.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(araekTaiba)).toBe("property_location");
    expect(araekTaiba.gallery).toEqual(["/manus-storage/araek-taiba-exterior_a6df6c5d.jpg", "/manus-storage/araek-taiba-room_95e2f420.jpg", "/manus-storage/araek-taiba-lobby_7ccd6852.jpg"]);
    expect(araekTaiba.content.en.amenities).toEqual([]);
    expect(araekTaiba.nearestGate).toBeUndefined();
    expect(searchHotelsByName([araekTaiba], "أرائك طيبة")).toEqual([araekTaiba]);
  });

  it("publishes Rabwat Al Safwa Golden with a reviewed map location only and no unsupported hotel facts", () => {
    const rabwatAlSafwa = hotelProfiles.find(hotel => hotel.slug === "rabwat-al-safwa-golden-madinah")!;
    expect(rabwatAlSafwa).toMatchObject({
      name: "Rabwat Al Safwa Golden Hotel",
      arabicName: "فندق ربوة الصفوة الذهبي",
      searchAliases: ["Rabwat Al Safwah Golden Hotel", "Rabwah Al Safwa Golden Hotel", "فندق ربوة الصفوة الذهبي"],
      status: "verified",
    });
    expect(rabwatAlSafwa.verification.evidenceLevel).toBe("map_listing");
    expect(rabwatAlSafwa.mapAddress).toContain("FJC3+2G");
    expect(getPublicLocationState(rabwatAlSafwa)).toBe("property_location");
    expect(rabwatAlSafwa.gallery).toEqual(["/manus-storage/rabwat-al-safwa-golden-exterior_9196b612.jpg", "/manus-storage/rabwat-al-safwa-golden-room_f9ccd1f6.jpg", "/manus-storage/rabwat-al-safwa-golden-lobby_781fe428.jpg"]);
    expect(rabwatAlSafwa.content.en.amenities).toEqual([]);
    expect(rabwatAlSafwa.nearestGate).toBeUndefined();
    expect(searchHotelsByName([rabwatAlSafwa], "ربوة الصفوة")).toEqual([rabwatAlSafwa]);
  });

  it("publishes Diyar Wahat Al Nazeel with a reviewed map location only and no unsupported hotel facts", () => {
    const diyarWahat = hotelProfiles.find(hotel => hotel.slug === "diyar-wahat-al-nazeel-madinah")!;
    expect(diyarWahat).toMatchObject({
      name: "Diyar Wahat Al Nazeel Hotel",
      arabicName: "فندق ديار واحة النزيل",
      searchAliases: ["DIYAR WAHT AL NAZZEL HOTEL", "Diyar Wahet Nazeel", "فندق ديار واحة النزيل"],
      status: "verified",
    });
    expect(diyarWahat.verification.evidenceLevel).toBe("map_listing");
    expect(diyarWahat.mapAddress).toContain("FJC3+6PV");
    expect(getPublicLocationState(diyarWahat)).toBe("property_location");
    expect(diyarWahat.gallery).toEqual(["/manus-storage/diyar-wahat-al-nazeel-exterior_98196255.jpg", "/manus-storage/diyar-wahat-al-nazeel-room_989fc269.jpg"]);
    expect(diyarWahat.content.en.amenities).toEqual([]);
    expect(diyarWahat.nearestGate).toBeUndefined();
    expect(searchHotelsByName([diyarWahat], "ديار واحة النزيل")).toEqual([diyarWahat]);
  });

  it("publishes Mias Hotel with its current operator-facing identity and reviewed location only", () => {
    const mias = hotelProfiles.find(hotel => hotel.slug === "mias-al-madinah")!;
    expect(mias).toMatchObject({
      name: "Mias Hotel",
      arabicName: "فندق مياس",
      searchAliases: ["Mias Al Madina Hotel", "Mias Al Madinah Hotel", "Mias Hotel", "فندق مياس المدينة", "فندق مياس"],
      status: "verified",
      sourceUrl: "http://www.miasmedina.com/",
    });
    expect(mias.verification.evidenceLevel).toBe("map_listing");
    expect(mias.mapAddress).toContain("FJ94+38");
    expect(getPublicLocationState(mias)).toBe("property_location");
    expect(mias.gallery).toEqual(["/manus-storage/mias-al-madinah-room-view_f37b4e5f.webp", "/manus-storage/mias-al-madinah-lobby_8fac0110.jpg", "/manus-storage/mias-al-madinah-reception_08ae7c13.jpg"]);
    expect(mias.content.en.amenities).toEqual([]);
    expect(mias.nearestGate).toBeUndefined();
    expect(searchHotelsByName([mias], "مياس")).toEqual([mias]);
  });

  it("publishes Al Mokhtara Al Gharbi with its operator identity and reviewed location only", () => {
    const alMokhtaraAlGharbi = hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-al-gharbi-madinah")!;
    expect(alMokhtaraAlGharbi).toMatchObject({
      name: "Al Mokhtara Al Gharbi Hotel",
      arabicName: "فندق المختارة الغربي",
      searchAliases: ["Al Mukhtara Al Gharbi Hotel", "Mokhtara Al Gharbi", "فندق المختارة الغربي"],
      status: "verified",
      sourceUrl: "https://mukhtarahotels.com/hotel?Hotel=677292a9727cb1f6f7400f99",
    });
    expect(alMokhtaraAlGharbi.verification.evidenceLevel).toBe("official_property");
    expect(alMokhtaraAlGharbi.mapAddress).toContain("FJ93+7C");
    expect(getPublicLocationState(alMokhtaraAlGharbi)).toBe("property_location");
    expect(alMokhtaraAlGharbi.gallery).toEqual(["/manus-storage/al-mokhtara-al-gharbi-exterior_548cbc0c.jpg", "/manus-storage/al-mokhtara-al-gharbi-room_15cdc474.jpg", "/manus-storage/al-mokhtara-al-gharbi-lobby_bbb534d1.jpg"]);
    expect(alMokhtaraAlGharbi.content.en.amenities).toEqual([]);
    expect(alMokhtaraAlGharbi.nearestGate).toBeUndefined();
    expect(searchHotelsByName([alMokhtaraAlGharbi], "المختارة الغربي")).toEqual([alMokhtaraAlGharbi]);
  });

  it("publishes Diyar Al Madinah with a reviewed map location only and no unsupported hotel facts", () => {
    const diyarAlMadinah = hotelProfiles.find(hotel => hotel.slug === "diyar-al-madinah-madinah")!;
    expect(diyarAlMadinah).toMatchObject({
      name: "Diyar Al Madinah Hotel",
      arabicName: "فندق ديار المدينة",
      searchAliases: ["Diyar Al Madina Hotel", "Diyar Al Madinah", "فندق ديار المدينة"],
      status: "verified",
    });
    expect(diyarAlMadinah.verification.evidenceLevel).toBe("map_listing");
    expect(diyarAlMadinah.mapAddress).toContain("FJ74+GG");
    expect(getPublicLocationState(diyarAlMadinah)).toBe("property_location");
    expect(diyarAlMadinah.gallery).toEqual(["/manus-storage/diyar-al-madinah-exterior_9a935f2e.jpg", "/manus-storage/diyar-al-madinah-room_a9653c1c.jpg", "/manus-storage/diyar-al-madinah-lobby_263d6033.jpg"]);
    expect(diyarAlMadinah.content.en.amenities).toEqual([]);
    expect(diyarAlMadinah.nearestGate).toBeUndefined();
    expect(searchHotelsByName([diyarAlMadinah], "ديار المدينة")).toEqual([diyarAlMadinah]);
  });

  it("publishes Mohamadia Al Zahra with a reviewed map location only and no unsupported hotel facts", () => {
    const mohamadiaAlZahra = hotelProfiles.find(hotel => hotel.slug === "mohamadia-al-zahra-madinah")!;
    expect(mohamadiaAlZahra).toMatchObject({
      name: "Mohamadia Al Zahra Hotel",
      arabicName: "فندق محمدية الزهراء",
      searchAliases: ["Mohammadiya Al Zahra Hotel", "Mohamadia Al Zahra", "فندق محمديه الزهراء", "فندق محمدية الزهراء"],
      status: "verified",
    });
    expect(mohamadiaAlZahra.verification.evidenceLevel).toBe("map_listing");
    expect(mohamadiaAlZahra.mapAddress).toContain("FJ74+P5");
    expect(getPublicLocationState(mohamadiaAlZahra)).toBe("property_location");
    expect(mohamadiaAlZahra.gallery).toEqual(["/manus-storage/mohamadia-al-zahra-exterior_970c819f.jpg", "/manus-storage/mohamadia-al-zahra-lobby_2e4510f5.jpg", "/manus-storage/mohamadia-al-zahra-room_0e2669c4.jpg"]);
    expect(mohamadiaAlZahra.content.en.amenities).toEqual([]);
    expect(mohamadiaAlZahra.nearestGate).toBeUndefined();
    expect(searchHotelsByName([mohamadiaAlZahra], "محمدية الزهراء")).toEqual([mohamadiaAlZahra]);
  });

  it("publishes Anwar Al Zahraa with its operator identity and reviewed location only", () => {
    const anwarAlZahraa = hotelProfiles.find(hotel => hotel.slug === "anwar-al-zahraa-madinah")!;
    expect(anwarAlZahraa).toMatchObject({
      name: "Anwar Al Zahraa Hotel",
      arabicName: "فندق أنوار الزهراء",
      searchAliases: ["Anwar Al Zahra Hotel", "Anwar Al-Zahra Hotel", "فندق انوار الزهراء", "فندق أنوار الزهراء"],
      status: "verified",
      sourceUrl: "https://www.anwaralzahrahotel.com/",
    });
    expect(anwarAlZahraa.verification.evidenceLevel).toBe("official_property");
    expect(anwarAlZahraa.mapAddress).toContain("FJ74+F5");
    expect(getPublicLocationState(anwarAlZahraa)).toBe("property_location");
    expect(anwarAlZahraa.gallery).toEqual(["/manus-storage/anwar-al-zahraa-lobby_6e37bb77.jpg", "/manus-storage/anwar-al-zahraa-exterior_68123fb1.jpg", "/manus-storage/anwar-al-zahraa-room_3d6bbab6.jpg"]);
    expect(anwarAlZahraa.content.en.amenities).toEqual([]);
    expect(anwarAlZahraa.nearestGate).toBeUndefined();
    expect(searchHotelsByName([anwarAlZahraa], "أنوار الزهراء")).toEqual([anwarAlZahraa]);
  });

  it("publishes Diyafa Al Mukhtara with its operator identity and reviewed location only", () => {
    const diyafaAlMukhtara = hotelProfiles.find(hotel => hotel.slug === "diyafa-al-mukhtara-madinah")!;
    expect(diyafaAlMukhtara).toMatchObject({
      name: "Diyafa Al Mukhtara Hotel",
      arabicName: "فندق ضيافة المختارة",
      searchAliases: ["Dyafat Al Mokhtara Hotel", "Diyafah Al Mukhtara", "فندق شركة ضيافة المختارة"],
      status: "verified",
      sourceUrl: "https://mukhtarahotels.com/hotel?Hotel=6772a802727cb1f6f740106a",
    });
    expect(diyafaAlMukhtara.verification.evidenceLevel).toBe("official_property");
    expect(diyafaAlMukhtara.mapAddress).toContain("FJ73+GX");
    expect(getPublicLocationState(diyafaAlMukhtara)).toBe("property_location");
    expect(diyafaAlMukhtara.gallery).toEqual(["/manus-storage/diyafa-al-mukhtara-madinah-exterior_9d718612.webp", "/manus-storage/diyafa-al-mukhtara-madinah-room_dd553dda.jpg", "/manus-storage/diyafa-al-mukhtara-madinah-lobby_133f1471.jpg"]);
    expect(diyafaAlMukhtara.content.en.amenities).toEqual([]);
    expect(diyafaAlMukhtara.nearestGate).toBeUndefined();
    expect(searchHotelsByName([diyafaAlMukhtara], "ضيافة المختارة")).toEqual([diyafaAlMukhtara]);
  });

  it("publishes Diyar Al Sater with a reviewed map location only and no unsupported hotel facts", () => {
    const diyarAlSater = hotelProfiles.find(hotel => hotel.slug === "diyar-al-sater-madinah")!;
    expect(diyarAlSater).toMatchObject({
      name: "Diyar Al Sater Hotel",
      arabicName: "فندق ديار الساتر",
      searchAliases: ["DIYAR AL SATER", "Diyar Al Sater", "فندق ديار الساتر"],
      status: "verified",
    });
    expect(diyarAlSater.verification.evidenceLevel).toBe("map_listing");
    expect(diyarAlSater.mapAddress).toContain("24.481597");
    expect(getPublicLocationState(diyarAlSater)).toBe("property_location");
    expect(diyarAlSater.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(diyarAlSater.galleryKind).toBe("destination_placeholder");
    expect(diyarAlSater.content.en.amenities).toEqual([]);
    expect(diyarAlSater.nearestGate).toBeUndefined();
    expect(searchHotelsByName([diyarAlSater], "ديار الساتر")).toEqual([diyarAlSater]);
  });

  it("publishes Diyar Al Salam separately from Diyar Al Salam Silver with a reviewed map location only", () => {
    const diyarAlSalam = hotelProfiles.find(hotel => hotel.slug === "diyar-al-salam-madinah")!;
    expect(diyarAlSalam).toMatchObject({
      name: "Diyar Al Salam Hotel",
      arabicName: "فندق ديار السلام",
      searchAliases: ["Diyar Al-Salam Hotel", "Diyar Al Salam", "فندق ديار السلام"],
      status: "verified",
    });
    expect(diyarAlSalam.verification.evidenceLevel).toBe("map_listing");
    expect(diyarAlSalam.mapAddress).toContain("FJ93+4M7");
    expect(getPublicLocationState(diyarAlSalam)).toBe("gate_route");
    expect(diyarAlSalam.gallery).toEqual(["/manus-storage/diyar-al-salam-room_0cbeb420.jpg", "/manus-storage/diyar-al-salam-exterior_676dcfd8.jpg", "/manus-storage/diyar-al-salam-lobby_115e9dc1.jpg"]);
    expect(diyarAlSalam.content.en.amenities).toEqual([]);
    expect(diyarAlSalam.nearestGate).toEqual({ name: "Al Salam Gate", address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" });
    expect(diyarAlSalam.verification.routeReviewedOn).toBe("2026-08-21");
    expect(searchHotelsByName([diyarAlSalam], "ديار السلام")).toEqual([diyarAlSalam]);
  });

  it("publishes Diyar Al Salam Silver with its distinct pin and the closest numbered courtyard-gate route", () => {
    const diyarAlSalamSilver = hotelProfiles.find(hotel => hotel.slug === "diyar-al-salam-silver-madinah")!;
    expect(diyarAlSalamSilver).toMatchObject({
      name: "Diyar Al Salam Silver Hotel",
      arabicName: "فندق ديار السلام الفضي",
      status: "verified",
    });
    expect(diyarAlSalamSilver.verification.evidenceLevel).toBe("map_listing");
    expect(diyarAlSalamSilver.mapAddress).toContain("FJ83+MGF");
    expect(getPublicLocationState(diyarAlSalamSilver)).toBe("gate_route");
    expect(diyarAlSalamSilver.gallery).toEqual(["/manus-storage/diyar-al-salam-silver-lobby_de339a55.jpg", "/manus-storage/diyar-al-salam-silver-exterior_bc6c01f9.jpg", "/manus-storage/diyar-al-salam-silver-room_898699ff.jpg"]);
    expect(diyarAlSalamSilver.content.en.amenities).toEqual([]);
    expect(diyarAlSalamSilver.nearestGate).toEqual({ name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" });
    expect(diyarAlSalamSilver.verification.routeReviewedOn).toBe("2026-08-21");
    expect(searchHotelsByName([diyarAlSalamSilver], "ديار السلام الفضي")).toEqual([diyarAlSalamSilver]);
  });

  it("publishes Anwar Al Madinah Mövenpick's closer reviewed courtyard-gate destination without mislabelling it as Al Salam Gate", () => {
    const anwar = hotelProfiles.find(hotel => hotel.slug === "anwar-al-madinah-movenpick")!;
    expect(getPublicLocationState(anwar)).toBe("gate_route");
    expect(anwar.nearestGate).toEqual({ name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" });
    expect(anwar.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("publishes InterContinental Dar Al Iman's closer reviewed courtyard-gate destination without mislabelling it as Al Salam Gate", () => {
    const darAlIman = hotelProfiles.find(hotel => hotel.slug === "dar-al-iman-intercontinental")!;
    expect(getPublicLocationState(darAlIman)).toBe("gate_route");
    expect(darAlIman.nearestGate).toEqual({ name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" });
    expect(darAlIman.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("publishes Madinah Hilton's closer reviewed courtyard-gate destination without mislabelling it as Al Salam Gate", () => {
    const hilton = hotelProfiles.find(hotel => hotel.slug === "hilton-madinah")!;
    expect(getPublicLocationState(hilton)).toBe("gate_route");
    expect(hilton.nearestGate).toEqual({ name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" });
    expect(hilton.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("publishes Crowne Plaza Madinah's shorter reviewed route to the named Al Salam Gate", () => {
    const crownePlaza = hotelProfiles.find(hotel => hotel.slug === "crowne-plaza-madinah")!;
    expect(getPublicLocationState(crownePlaza)).toBe("gate_route");
    expect(crownePlaza.nearestGate).toEqual({ name: "Al Salam Gate", address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" });
    expect(crownePlaza.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("keeps unresolved Madinah candidates visible only as verification-pending records without media, map, route, distance, or facility claims", () => {
    ["hilton-garden-inn-madinah", "four-points-by-sheraton-madinah", "almasa-grand", "ramada-madinah-al-qibla", "al-jawhara-madinah", "al-taj-madinah", "al-sultan-madinah", "al-waleed-madinah", "andalus-palace-madinah", "al-andalus-madinah", "al-aqsa-madinah", "al-eman-east", "al-jazira-madinah", "al-aliyah-madinah", "al-ferdous-madinah", "al-aziziyah-hotel-madinah", "quba-hotel-madinah", "sheraton-madinah", "marriott-madinah"].forEach(slug => {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel).toMatchObject({ status: "verification_pending", gallery: [], mapAddress: undefined, googleMapsPlaceUrl: undefined, nearestGate: undefined, proximityBand: "city" });
      expect(getPublicLocationState(hotel)).toBe("on_request");
      expect(getHotelAreaLabel(hotel, "ar")).toBe("الموقع قيد التأكيد");
      expect(getHotelContent(hotel, "en")).toMatchObject({ amenities: [], rooms: [] });
    });
  });

  it("uses the current Al Qibla Hotel identity while retaining the Ramada names as search aliases and excluding the mismatched Al Hamra map and media", () => {
    const alQibla = hotelProfiles.find(hotel => hotel.slug === "ramada-madinah-al-qibla")!;
    expect(alQibla).toMatchObject({ name: "Al Qibla Hotel", arabicName: "فندق القبلة", status: "verification_pending", gallery: [], mapAddress: undefined, googleMapsPlaceUrl: undefined, searchAliases: ["Ramada Madinah Al Qibla", "Ramada by Wyndham Madinah Al Qibla"] });
    expect(searchHotelsByName([alQibla], "Ramada Madinah Al Qibla")).toEqual([alQibla]);
  });

  it("uses the operator-preferred Mokhtara Golden Hotel identity while retaining prior spellings for hotel search", () => {
    const mokhtaraGolden = hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-golden")!;
    expect(mokhtaraGolden).toMatchObject({ name: "Mokhtara Golden Hotel", arabicName: "فندق المختارة الذهبي", searchAliases: ["Al Mokhtara Golden", "Al Mukhtara Golden Hotel"] });
    expect(searchHotelsByName([mokhtaraGolden], "Al Mukhtara Golden Hotel")).toEqual([mokhtaraGolden]);
  });

  it("uses the current Durra Al Madinah Hotel identity while retaining the Durrat spelling for hotel search", () => {
    const durra = hotelProfiles.find(hotel => hotel.slug === "al-durrah-madinah")!;
    expect(durra).toMatchObject({ name: "Durra Al Madinah Hotel", arabicName: "فندق درة المدينة", searchAliases: ["Durrat Al Madinah Hotel"] });
    expect(searchHotelsByName([durra], "Durrat Al Madinah Hotel")).toEqual([durra]);
  });

  it("replaces Dallah Taibah's planning record with a location-only profile and exact-property official gallery images", () => {
    const dallah = hotelProfiles.find(hotel => hotel.slug === "dallah-taibah");
    expect(dallah).toMatchObject({ status: "verified", sourceUrl: "https://www.google.com/travel/hotels/dallah-taibah-hotel-hotels" });
    expect(dallah?.gallery).toEqual([
      "/manus-storage/08_dallah_taibah__exterior__01_80cb409d.webp",
      "/manus-storage/2001_eaf41eea.jpg",
      "/manus-storage/2035_PDBL_e768d003.jpg",
    ]);
    expect(dallah?.mapAddress).toContain("3005 Abi Zar Street");
    expect(dallah?.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(dallah!)).toBe("property_location");
    expect(dallah?.nearestGate).toBeUndefined();
  });

  it("exposes Madinah Hilton's reviewed property point and numbered courtyard-gate route", () => {
    const hilton = hotelProfiles.find(hotel => hotel.slug === "hilton-madinah")!;
    expect(hilton.mapAddress).toContain("King Fahd Road");
    expect(hilton.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(hilton)).toBe("gate_route");
    expect(hilton.nearestGate?.name).toBe("Haram Courtyard Gate No. 316");
  });

  it("exposes Millennium Al Aqeeq's reviewed property point and King Fahad Gate route", () => {
    const millennium = hotelProfiles.find(hotel => hotel.slug === "millennium-madinah")!;
    expect(millennium.mapAddress).toContain("Musab bin Omeir Street");
    expect(millennium.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(millennium)).toBe("gate_route");
    expect(millennium.nearestGate?.name).toBe("King Fahad Gate");
    expect(millennium.verification.routeReviewedOn).toBe("2026-08-21");
  });

  it("exposes the independently reviewed Saja by Warwick property point without a named walking-gate route", () => {
    const saja = hotelProfiles.find(hotel => hotel.slug === "saja-by-warwick-madinah")!;
    expect(saja.mapAddress).toContain("King Faisal Road");
    expect(saja.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(saja)).toBe("property_location");
    expect(saja.nearestGate).toBeUndefined();
  });

  it("exposes the independently reviewed Golden Tulip Al Zahabi property point without a named walking-gate route", () => {
    const goldenTulip = hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-zahabi")!;
    expect(goldenTulip.mapAddress).toContain("Suhayb Bin Sinan Street");
    expect(goldenTulip.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(goldenTulip)).toBe("property_location");
    expect(goldenTulip.nearestGate).toBeUndefined();
  });

  it("exposes the independently reviewed Biltmore property point without a named walking-gate route", () => {
    const biltmore = hotelProfiles.find(hotel => hotel.slug === "biltmore-al-madinah")!;
    expect(biltmore.mapAddress).toContain("Zaid Bin Sabit Street");
    expect(biltmore.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(biltmore)).toBe("property_location");
    expect(biltmore.nearestGate).toBeUndefined();
  });

  it("exposes the independently reviewed Radisson property point without implying a walking-gate route", () => {
    const radisson = hotelProfiles.find(hotel => hotel.slug === "radisson-hotel-madinah")!;
    expect(radisson.mapAddress).toContain("Khallad Ibn Suwaid Street");
    expect(radisson.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(radisson)).toBe("property_location");
    expect(radisson.nearestGate).toBeUndefined();
  });

  it("exposes the independently reviewed DoubleTree Madinah Gate property point without implying a walking-gate route", () => {
    const doubleTree = hotelProfiles.find(hotel => hotel.slug === "doubletree-by-hilton-madinah-gate")!;
    expect(doubleTree.mapAddress).toContain("King Abdul Aziz Road");
    expect(doubleTree.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(doubleTree)).toBe("property_location");
    expect(doubleTree.nearestGate).toBeUndefined();
  });

  it("exposes the independently reviewed Al Mukhtara International property point without a named walking-gate route", () => {
    const mokhtara = hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-international")!;
    expect(mokhtara.mapAddress).toContain("King Faisal Road");
    expect(mokhtara.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(mokhtara)).toBe("property_location");
    expect(mokhtara.nearestGate).toBeUndefined();
  });

  it("replaces the legacy Radisson Blu planning identity with the current first-party listed Radisson Hotel Madinah profile", () => {
    const radisson = hotelProfiles.find(hotel => hotel.slug === "radisson-hotel-madinah");
    expect(radisson).toMatchObject({ status: "verified", address: expect.stringContaining("Khallad Ibn Suwaid Street") });
    expect(radisson?.gallery).toHaveLength(4);
    expect(hotelProfiles.some(hotel => hotel.slug === "radisson-blu-madinah")).toBe(false);
  });

  it("replaces the Crowne Plaza planning record with an official profile and reviewed Al Salam Gate route", () => {
    const crownePlaza = hotelProfiles.find(hotel => hotel.slug === "crowne-plaza-madinah");
    expect(crownePlaza).toMatchObject({ status: "verified", address: expect.stringContaining("King Faisal Street") });
    expect(crownePlaza?.gallery).toHaveLength(6);
    expect(crownePlaza?.mapAddress).toContain("1st Ring Road");
    expect(crownePlaza?.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(crownePlaza!)).toBe("gate_route");
    expect(crownePlaza?.nearestGate?.name).toBe("Al Salam Gate");
  });

  it("replaces the DoubleTree planning record with the official Madinah Gate profile without implying a walking route", () => {
    const doubleTree = hotelProfiles.find(hotel => hotel.slug === "doubletree-by-hilton-madinah-gate");
    expect(doubleTree).toMatchObject({ status: "verified", address: expect.stringContaining("King Abdul Aziz Road") });
    expect(doubleTree?.gallery).toHaveLength(4);
    expect(doubleTree?.nearestGate).toBeUndefined();
    expect(hotelProfiles.some(hotel => hotel.slug === "doubletree-by-hilton-madinah")).toBe(false);
  });

  it("uses the current Mokhtara International identity for the existing operator-confirmed property without inferring new location or facility claims", () => {
    const alMukhtara = hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-international");
    expect(alMukhtara).toMatchObject({ status: "verified", name: "Mokhtara International Hotel", arabicName: "فندق المختارة العالمي", searchAliases: ["Al Mukhtara International Hotel", "Mokhtara International Hotel", "فندق المختارة العالمي"] });
    expect(alMukhtara?.gallery).toHaveLength(4);
    expect(alMukhtara?.mapAddress).toContain("King Faisal Road");
    expect(alMukhtara?.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(alMukhtara?.nearestGate).toBeUndefined();
    expect(alMukhtara?.content.en.amenities).toEqual([]);
  });

  it("adds the operator-listed Al Ritz property with verified on-page facts and without a map route or testimonial data", () => {
    const alRitz = hotelProfiles.find(hotel => hotel.slug === "al-ritz-al-madinah");
    expect(alRitz).toMatchObject({ status: "verified", address: expect.stringContaining("Abdul Rahman Ibn Awf Street") });
    expect(alRitz?.sourceUrl).toContain("mukhtarahotels.com/hotel");
    expect(alRitz?.content.en.rooms).toHaveLength(5);
    expect(alRitz?.content.en.amenities).toEqual(expect.arrayContaining(["Parking", "Free Wi-Fi", "Accessibility facilities"]));
    expect(alRitz?.mapAddress).toContain("FJF5+5WH");
    expect(alRitz?.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(alRitz!)).toBe("property_location");
    expect(alRitz?.nearestGate).toBeUndefined();
  });

  it("replaces the Waqf planning record with the operator-confirmed Waqf Uthman profile and withholds an unreviewed gate route", () => {
    const waqf = hotelProfiles.find(hotel => hotel.slug === "al-waqf-serviced-apartments");
    expect(waqf).toMatchObject({ status: "verified", name: "Waqf Uthman Bin Affan Hotel", address: expect.stringContaining("Abu Dujana Al-Ansari Street") });
    expect(waqf?.sourceUrl).toBe("https://mokhtaragroup.com/hotels/waqf-uthman-bin-affan");
    expect(waqf?.gallery).toHaveLength(3);
    expect(waqf?.content.en.highlights).toEqual(expect.arrayContaining(["236 rooms", "1,150 beds"]));
    expect(waqf?.content.en.amenities).toEqual(expect.arrayContaining(["Restaurant", "Coffee shop", "Free Wi-Fi", "24-hour room service", "Parking"]));
    expect(waqf?.mapAddress).toContain("King Faisal Road");
    expect(waqf?.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationState(waqf!)).toBe("property_location");
    expect(waqf?.nearestGate).toBeUndefined();
  });

  it("consolidates Millennium Al Aqeeq into one public profile and keeps the former planning slug as an internal route alias", () => {
    const millenniumProfiles = hotelProfiles.filter(hotel => hotel.name === "Millennium Al Aqeeq Hotel");
    expect(millenniumProfiles).toHaveLength(1);
    expect(millenniumProfiles[0]).toMatchObject({ slug: "millennium-madinah", status: "verified", searchAliases: expect.arrayContaining(["Al Aqeeq Madinah", "Al Aqeeq Hotel"]) });
    expect(hotelProfiles.some(hotel => hotel.slug === "al-aqiq-madinah")).toBe(false);
    expect(legacyHotelSlugAliases["al-aqiq-madinah"]).toBe("millennium-madinah");
  });

  it("adds three independently matched hotels from the supplied list without copying its ratings, distances, or unverified media", () => {
    const grandPlaza = hotelProfiles.find(hotel => hotel.slug === "grand-plaza-al-madinah")!;
    const badrAlMaqam = hotelProfiles.find(hotel => hotel.slug === "grand-plaza-badr-al-maqam")!;
    const diyarAjwa = hotelProfiles.find(hotel => hotel.slug === "diyar-ajwa-tapestry-hilton")!;
    expect(grandPlaza).toMatchObject({ name: "Grand Plaza Al Madinah", arabicName: "فندق جراند بلازا المدينة المنورة", status: "verified" });
    expect(grandPlaza.searchAliases).toContain("Al Salihiya Taibah");
    expect(grandPlaza.mapAddress).toContain("FJ87+42");
    expect(badrAlMaqam).toMatchObject({ name: "Grand Plaza Badr Al Maqam", arabicName: "فندق جراند بلازا بدر المقام", status: "verified" });
    expect(badrAlMaqam.sourceUrl).toContain("maysangroup.com");
    expect(diyarAjwa).toMatchObject({ name: "Diyar Ajwa, Tapestry Collection by Hilton", arabicName: "فندق ديار عجوة، مجموعة تابستري من هيلتون", status: "verified" });
    expect(diyarAjwa.mapAddress).toContain("FJC5+Q9");
    expect(grandPlaza.gallery).toEqual(["/manus-storage/grand-plaza-exterior_7c73b3b2.jpg", "/manus-storage/grand-plaza-room_12204036.jpg", "/manus-storage/grand-plaza-lobby_2e1878cb.jpg"]);
    expect(diyarAjwa.gallery).toEqual(["/manus-storage/diyar-ajwa-lobby_1ffce765.jpg", "/manus-storage/diyar-ajwa-facade_73040270.jpg", "/manus-storage/diyar-ajwa-room_74dba180.jpg"]);
    expect(badrAlMaqam.gallery).toEqual(["/manus-storage/grand-plaza-badr-exterior_90ae9db2.jpg", "/manus-storage/grand-plaza-badr-room_e8a07366.jpg", "/manus-storage/grand-plaza-badr-lounge_19add0f5.jpg"]);
    expect(badrAlMaqam.nearestGate).toBeUndefined();
    expect(badrAlMaqam.content.en.amenities).toEqual([]);
  });

  it("uses only the clearly matched authorized image batch for its named hotel profiles", () => {
    expect(hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/03_pullman_zamzam_madina__view__01_37e4f69c.webp",
      "/manus-storage/pullman-zamzam-madinah-room-2026_a609d9bb.jpg",
      "/manus-storage/pullman-zamzam-madinah-lobby-2026_cedd2947.jpg",
      "/manus-storage/03_pullman_zamzam_madina__view__01_bd38e8a2.webp",
      "/manus-storage/03_pullman_zamzam_madina__room__01_5dfda350.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "le-meridien-madinah")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/le-meridien-madinah-exterior-2026_57705004.jpg",
      "/manus-storage/le-meridien-madinah-room-2026_94f3204e.jpg",
      "/manus-storage/le-meridien-madinah-restaurant-2026_396bee31.jpg",
      "/manus-storage/07_le_meridien_madinah__exterior__01_1aea5fd9.webp",
      "/manus-storage/07_le_meridien_madinah__exterior__02_386f6b68.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "rawdah-al-aqiq")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/rawdah-al-aqeeq-exterior-2026_64cd07c8.jpg",
      "/manus-storage/rawdah-al-aqeeq-room-2026_3b4a1978.jpg",
      "/manus-storage/rawdah-al-aqeeq-lobby-2026_ef5cb649.jpg",
      "/manus-storage/20_rawda_al_aqeeq__exterior__01_73f8def9.webp",
      "/manus-storage/20_rawda_al_aqeeq__exterior__02_a4d99731.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "hilton-madinah")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/06_hilton_madinah__exterior__01_1980d1b9.webp",
      "/manus-storage/hilton-madinah-room-2026_ea7e1d25.jpg",
      "/manus-storage/hilton-madinah-lounge-2026_44577b3d.jpg",
      "/manus-storage/06_hilton_madinah__exterior__01_c2270329.webp",
      "/manus-storage/06_hilton_madinah__room__01_1ebf8f7b.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "dar-al-iman-intercontinental")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/01_dar_al_iman_intercontinental__exterior__02_7503a7d3.webp",
      "/manus-storage/dar-al-iman-madinah-room-2026_6462e1c6.jpg",
      "/manus-storage/dar-al-iman-madinah-lounge-2026_0038b5bd.jpg",
      "/manus-storage/01_dar_al_iman_intercontinental__exterior__01_a773e3cf.webp",
      "/manus-storage/01_dar_al_iman_intercontinental__exterior__02_b46049ce.webp",
      "/manus-storage/01_dar_al_iman_intercontinental__room__01_1993f8d5.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "anwar-al-madinah-movenpick")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/05_anwar_al_madinah_movenpick__exterior__01_67815a5e.webp",
      "/manus-storage/anwar-al-madinah-movenpick-room-2026_c2da374e.jpg",
      "/manus-storage/anwar-al-madinah-movenpick-dining-2026_5929c04d.jpg",
      "/manus-storage/05_anwar_al_madinah_movenpick__exterior__01_15400a7b.webp",
      "/manus-storage/05_anwar_al_madinah_movenpick__room__01_572fb92b.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "dallah-taibah")?.gallery).toEqual([
      "/manus-storage/08_dallah_taibah__exterior__01_80cb409d.webp",
      "/manus-storage/2001_eaf41eea.jpg",
      "/manus-storage/2035_PDBL_e768d003.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "crowne-plaza-madinah")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/27_crowne_plaza_madinah__exterior__01_8c5800be.webp",
      "/manus-storage/crowne-plaza-madinah-room-2026_3f671de9.jpg",
      "/manus-storage/crowne-plaza-madinah-dining-2026_e5165fff.jpg",
      "/manus-storage/crowne-plaza-madinah-lobby-2026_63fd0d11.jpg",
      "/manus-storage/27_crowne_plaza_madinah__exterior__01_2438f63d.webp",
      "/manus-storage/27_crowne_plaza_madinah__room__01_158bda6d.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "doubletree-by-hilton-madinah-gate")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/doubletree-madinah-gate-room-2026_d74126a5.jpg",
      "/manus-storage/doubletree-madinah-gate-dining-2026_59045298.jpg",
      "/manus-storage/doubletree-madinah-gate-lobby-2026_922440b3.jpg",
      "/manus-storage/29_doubletree_madinah_gate__room__01_8751ec5f.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "millennium-madinah")?.gallery).toEqual([
      "/manus-storage/millennium-al-aqeeq-exterior-2026_239eb0d4.webp",
      "/manus-storage/millennium-al-aqeeq-room-2026_e0b7640d.jpg",
      "/manus-storage/millennium-al-aqeeq-lobby-2026_19f63fbb.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-international")?.gallery).toEqual([
      "/manus-storage/15_mokhtara_international__exterior__01_3cee8d58.webp",
      "/manus-storage/15_mokhtara_international__exterior__02_01a4cd8c.webp",
      "/manus-storage/al-mukhtara-international-room-2026_cc0ede0b.jpg",
      "/manus-storage/al-mukhtara-international-lobby-2026_73129fbc.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-waqf-serviced-apartments")?.gallery).toEqual([
      "/manus-storage/waqf-uthman-bin-affan-exterior-2026_d8b0f683.jpg",
      "/manus-storage/24_waqf_othman_bin_affan__room__01_2de361b4.webp",
      "/manus-storage/waqf-uthman-bin-affan-lobby-2026_2382ecd1.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-ritz-al-madinah")?.gallery).toEqual([
      "/manus-storage/al-ritz-al-madinah-exterior-2026_758f5568.jpg",
      "/manus-storage/al-ritz-al-madinah-room-2026_377c0346.jpg",
      "/manus-storage/al-ritz-al-madinah-lobby-2026_f3c36798.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-zahabi")?.gallery).toEqual([
      "/manus-storage/golden-tulip-al-zahabi-exterior-2026_d05c6586.jpg",
      "/manus-storage/golden-tulip-al-zahabi-room-2026_4c05ab99.jpg",
      "/manus-storage/golden-tulip-al-zahabi-lobby-2026_b18b2647.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "saja-by-warwick-madinah")?.gallery).toEqual([
      "/manus-storage/saja-by-warwick-madinah-exterior-2026_e4e1947b.jpg",
      "/manus-storage/saja-by-warwick-madinah-room-2026_515df4e9.jpg",
      "/manus-storage/saja-by-warwick-madinah-lobby-2026_2944db32.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "biltmore-al-madinah")?.gallery).toEqual([
      "/manus-storage/biltmore-al-madinah-suite-2026_d7a31330.jpg",
      "/manus-storage/biltmore-al-madinah-dining-2026_02ff6ba3.jpg",
      "/manus-storage/biltmore-al-madinah-lobby-2026_7ff24bc8.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "new-madinah-hotel")?.gallery).toEqual([
      "/manus-storage/new-madinah-hotel-exterior-2026_29c83619.jpg",
      "/manus-storage/new-madinah-hotel-room-2026_360a7f4f.jpg",
      "/manus-storage/new-madinah-hotel-lobby-2026_47c1e336.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "radisson-hotel-madinah")?.gallery).toEqual(expect.arrayContaining([
      "/manus-storage/radisson-hotel-madinah-exterior-2026_b832254a.jpg",
      "/manus-storage/radisson-hotel-madinah-room-2026_a26a9e92.jpg",
      "/manus-storage/radisson-hotel-madinah-lobby-2026_d0770aeb.jpg",
      "/manus-storage/30_radisson_blu_madinah__exterior__01_dfed9fee.webp",
    ]));
    expect(hotelProfiles.find(hotel => hotel.slug === "millennium-madinah")?.gallery).toEqual([
      "/manus-storage/millennium-al-aqeeq-exterior-2026_239eb0d4.webp",
      "/manus-storage/millennium-al-aqeeq-room-2026_e0b7640d.jpg",
      "/manus-storage/millennium-al-aqeeq-lobby-2026_19f63fbb.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "dar-al-taqwa-madinah")?.gallery).toEqual([
      "/manus-storage/dar-al-taqwa-madinah-room-2026_a6636fc2.jpg",
      "/manus-storage/dar-al-taqwa-madinah-lobby-2026_88c6b228.jpg",
      "/manus-storage/dar-al-taqwa-madinah-dining-2026_29d983e4.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "eman-royal")?.gallery).toEqual([
      "/manus-storage/10_eiman_royal_madinah__exterior__01_53ee85e5.webp",
      "/manus-storage/10_eiman_royal_madinah__exterior__02_acbccd01.webp",
      "/manus-storage/eman-royal-madinah-lobby-2026_d3c2ae46.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "ramada-madinah-al-qibla")?.gallery).toEqual([]);
    expect(hotelProfiles.find(hotel => hotel.slug === "shaza-madinah")).toMatchObject({ name: "Shaza Regency Plaza Al Madinah", arabicName: "فندق شذا ريجنسي بلازا المدينة المنورة" });
    expect(hotelProfiles.find(hotel => hotel.slug === "shaza-madinah")?.gallery).toEqual([
      "/manus-storage/shaza-regency-plaza-exterior-2026_ed25e7c0.webp",
      "/manus-storage/shaza-regency-plaza-room-2026_c98d40b7.jpg",
      "/manus-storage/shaza-regency-plaza-lobby-2026_a89bf720.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-ansar-madinah")).toMatchObject({ name: "Al Ansar Palace Golden Tulip Hotel", arabicName: "فندق قصر الأنصار جولدن توليب" });
    expect(hotelProfiles.find(hotel => hotel.slug === "al-ansar-madinah")?.gallery).toEqual([
      "/manus-storage/al-ansar-palace-golden-tulip-exterior-2026_323a3f6c.jpg",
      "/manus-storage/al-ansar-palace-golden-tulip-room-2026_183cb509.jpg",
      "/manus-storage/al-ansar-palace-golden-tulip-lobby-2026_5b8abc0e.jpg",
      "/manus-storage/qasr-al-ansar-golden-tulip-exterior-night-owner-2026-08-27_8a225d90.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-reception-owner-2026-08-27_dcf32099.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-lobby-owner-2026-08-27_0832ab00.jpg",
      "/manus-storage/qasr-al-ansar-golden-tulip-corridor-owner-2026-08-27_a2096a36.jpg",
      "/manus-storage/qasr-al-ansar-golden-tulip-facade-owner-2026-08-27_ffebae33.jpg",
      "/manus-storage/qasr-al-ansar-golden-tulip-tower-facade-owner-2026-08-27_b8bbdc3b.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-triple-room-a-owner-2026-08-27_20becd0b.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-triple-room-b-owner-2026-08-27_b22f7bfd.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-twin-room-a-owner-2026-08-27_cf09e0a3.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-twin-room-b-owner-2026-08-27_d669d001.png",
      "/manus-storage/qasr-al-ansar-golden-tulip-double-room-owner-2026-08-27_b8362bc9.png",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-ansar-madinah")?.gallery).not.toContain("/manus-storage/qasr-al-ansar-golden-tulip-facade-owner-2026-08-27_ffebae33.jpg");
    expect(hotelProfiles.some(hotel => hotel.slug.includes("ruaa") || hotel.slug.includes("roya-al-alami"))).toBe(false);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-golden")?.gallery).toEqual([
      "/manus-storage/al-mokhtara-golden-exterior-2026_790739f0.jpg",
      "/manus-storage/al-mokhtara-golden-room-2026_87c19459.jpg",
      "/manus-storage/al-mokhtara-golden-lobby-2026_358d2fef.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "al-waha-hotel-madinah")).toMatchObject({ name: "Hayah Al Waha Hotel", arabicName: "فندق حياة الواحة" });
    expect(hotelProfiles.find(hotel => hotel.slug === "al-waha-hotel-madinah")?.gallery).toEqual([
      "/manus-storage/hayah-al-waha-exterior-2026_99887d95.jpg",
      "/manus-storage/hayah-al-waha-room-2026_7e986d6c.jpg",
      "/manus-storage/hayah-al-waha-lobby-2026_bf161e3d.jpg",
    ]);
    expect(hotelProfiles.find(hotel => hotel.slug === "hilton-madinah")?.gallery).toHaveLength(5);
    expect(hotelProfiles.flatMap(hotel => hotel.gallery).every(url => url.startsWith("/manus-storage/"))).toBe(true);
  });

  it("attaches later authorized image groups by exact planning-slug match without changing confirmed hotel planning statuses", () => {
    for (const slug of ["le-meridien-madinah", "eman-royal", "coral-madinah", "al-nokhba-madinah", "rawdah-al-aqiq", "al-rehab-madinah"]) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug);
      expect(hotel?.status).toBe("planning_record");
      expect(hotel?.gallery.length).toBeGreaterThan(0);
    }
  });

  it("uses the linked Rehab Taba and Rehab Harmony operating identity with a matched three-image gallery", () => {
    const rehab = hotelProfiles.find(profile => profile.slug === "al-rehab-madinah")!;
    expect(rehab).toMatchObject({ name: "Rehab Taba Hotel (Rehab Harmony)", arabicName: "فندق رحاب طابة (رحاب هارموني)", status: "planning_record" });
    expect(rehab.gallery).toEqual([
      "/manus-storage/rehab-taba-hotel-exterior-2026_1ca0c523.jpg",
      "/manus-storage/rehab-taba-hotel-room-2026_6baf5b1b.jpg",
      "/manus-storage/rehab-taba-hotel-lobby-2026_36ea37de.jpg",
    ]);
    expect(rehab.nearestGate).toBeUndefined();
  });

  it("retains the already complete Al Mukhtara International exterior, room, and reception gallery", () => {
    const mokhtara = hotelProfiles.find(profile => profile.slug === "al-mokhtara-international")!;
    expect(mokhtara.gallery).toEqual([
      "/manus-storage/15_mokhtara_international__exterior__01_3cee8d58.webp",
      "/manus-storage/15_mokhtara_international__exterior__02_01a4cd8c.webp",
      "/manus-storage/al-mukhtara-international-room-2026_cc0ede0b.jpg",
      "/manus-storage/al-mukhtara-international-lobby-2026_73129fbc.jpg",
    ]);
    expect(mokhtara.nearestGate).toBeUndefined();
  });

  it("exposes reviewed property locations for exact planning-record identities without implying a named gate route", () => {
    for (const slug of ["le-meridien-madinah", "eman-royal", "al-nokhba-madinah", "rawdah-al-aqiq"]) {
      const hotel = hotelProfiles.find(profile => profile.slug === slug)!;
      expect(hotel.status).toBe("planning_record");
      expect(hotel.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
      expect(getPublicLocationState(hotel)).toBe("property_location");
      expect(hotel.nearestGate).toBeUndefined();
    }
  });

  it("attaches verification metadata to every planning and first-party hotel profile", () => {
    expect(hotelProfiles.every(hotel => hotel.verification.evidenceLevel && hotel.verification.locationStatus && hotel.verification.editorialNote)).toBe(true);
    expect(hotelProfiles.find(hotel => hotel.slug === "millennium-madinah")?.verification.evidenceLevel).toBe("official_property");
    expect(hotelProfiles.find(hotel => hotel.slug === "dar-al-iman-intercontinental")?.verification.locationStatus).toBe("named_gate_verified");
  });

  it("exposes reviewed property locations and verified routes while withholding unreviewed locations", () => {
    const darAlIman = hotelProfiles.find(hotel => hotel.slug === "dar-al-iman-intercontinental")!;
    expect(getPublicLocationState(darAlIman)).toBe("gate_route");
    expect(darAlIman.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(getPublicLocationUrl(darAlIman)).toBeUndefined();
    expect(getPublicLocationState(hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!)).toBe("gate_route");
    expect(getPublicLocationUrl(hotelProfiles.find(hotel => hotel.slug === "pullman-zamzam-madinah")!)).toBeUndefined();
    expect(getPublicLocationState(hotelProfiles.find(hotel => hotel.slug === "al-haram-hotel")!)).toBe("on_request");
  });

  it("retains the complete professional Madinah district taxonomy and separates access from transfer arrangements", () => {
    const zoneLabels = planningCopy.en.zones;
    expect(Object.values(zoneLabels)).toEqual(expect.arrayContaining(["Central Area — North", "Central Area — East", "Central Area — South", "Central Area — West", "North Madinah / King Fahad Road", "Madinah districts"]));
    expect(planningCopy.en.access.walkable).toBe("Central Madinah access");
    expect(planningCopy.en.access.transfer_advised).toBe("Transfer arrangements available");
  });

  it("keeps public planning profiles free from unverified distance, walking-time, and source-review language", () => {
    const publicPlanningText = Object.values(planningCopy).flatMap(copy => [copy.planning, copy.source, copy.distance, copy.walking, copy.summary("Sample Hotel")]).join(" ");
    expect(publicPlanningText).not.toMatch(/planning record|planning distance|estimated walk|source review|سجل تخطيطي|المسافة التقديرية|المشي التقديري|مراجعة المصدر/i);
    const darAlTaqwa = hotelProfiles.find(hotel => hotel.slug === "dar-al-taqwa-madinah");
    expect(getHotelContent(darAlTaqwa!, "en").summary).not.toMatch(/source-reviewed|official website/i);
    const newMadinah = hotelProfiles.find(hotel => hotel.slug === "new-madinah-hotel");
    for (const locale of locales) {
      expect(getHotelContent(newMadinah!, locale).summary).not.toMatch(/^(?:A source-reviewed|ملف فندقي تمت مراجعته|Profil hotel Madinah yang disemak|مدینہ ہوٹل کا یہ پروفائل|Profil hotel Madinah yang ditinjau|यह मदीना होटल प्रोफ़ाइल)/i);
      for (const slug of ["saja-by-warwick-madinah", "golden-tulip-al-zahabi"]) {
        const summary = getHotelContent(hotelProfiles.find(hotel => hotel.slug === slug)!, locale).summary;
        expect(summary).not.toMatch(/pending independent|route remains pending|قيد المراجعة|جائزے کے منتظر|tinjauan peta independen|tinjauan.*tertunda|समीक्षा की प्रतीक्षा|मार्ग अभी लंबित/i);
      }
    }
  });

  it("uses The Venue Al Harithia as the public current identity and retains Maysan and Frontel only as search aliases", () => {
    const venue = hotelProfiles.find(hotel => hotel.slug === "the-venue-al-harithia")!;
    expect(venue).toMatchObject({ name: "The Venue Al Harithia Hotel", arabicName: "فندق ذا فينيو الحارثية", status: "verified" });
    expect(venue.searchAliases).toEqual(expect.arrayContaining(["Maysan Al Harithia Hotel", "Frontel Al Harithia"]));
    expect(venue.sourceUrl).toContain("maysangroup.com");
    expect(venue.googleMapsPlaceUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search/);
    expect(venue.gallery).toEqual(["/manus-storage/the-venue-al-harithia-lobby_f5ec87b0.jpeg", "/manus-storage/the-venue-al-harithia-hallway_3f737e05.jpeg", "/manus-storage/the-venue-al-harithia-lounge_419ca182.jpeg"]);
    expect(venue.nearestGate).toBeUndefined();
    expect(hotelProfiles.filter(hotel => /(?:venue|maysan al harithia)/i.test(`${hotel.name} ${hotel.searchAliases?.join(" ")}`)).filter(hotel => hotel.slug !== "the-venue-al-harithia")).toHaveLength(0);
  });

  it("adds Al Saha Hotel from its independent Maps property point without publishing unsupported facilities, media, or a gate route", () => {
    const alSaha = hotelProfiles.find(hotel => hotel.slug === "al-saha-hotel-madinah")!;
    expect(alSaha).toMatchObject({ name: "Al Saha Hotel", arabicName: "فندق الساحة", status: "verified" });
    expect(alSaha.mapAddress).toContain("FJF7+22");
    expect(alSaha.verification.evidenceLevel).toBe("map_listing");
    expect(alSaha.gallery).toEqual(["/manus-storage/al-saha-hotel-exterior_b05f0eac.jpg", "/manus-storage/al-saha-hotel-room_8c873841.jpg", "/manus-storage/al-saha-hotel-lobby_a1385626.jpg"]);
    expect(alSaha.nearestGate).toBeUndefined();
    expect(alSaha.content.en.amenities).toEqual([]);
  });

  it("adds Safwat Almadinah Hotel from its independent Maps property point without implying an operator relationship or a gate route", () => {
    const safwat = hotelProfiles.find(hotel => hotel.slug === "safwat-al-madinah")!;
    expect(safwat).toMatchObject({ name: "Safwat Almadinah Hotel", arabicName: "فندق صفوة المدينة", status: "verified" });
    expect(safwat.mapAddress).toContain("FJF6+4X");
    expect(safwat.verification.evidenceLevel).toBe("map_listing");
    expect(safwat.gallery).toEqual(["/manus-storage/safwat-al-madinah-exterior_795c7ebc.jpg", "/manus-storage/safwat-al-madinah-room_2c877aa0.jpg", "/manus-storage/safwat-al-madinah-lobby_c1bfd1d4.jpg"]);
    expect(safwat.nearestGate).toBeUndefined();
    expect(safwat.content.en.amenities).toEqual([]);
  });

  it("adds Artal Al-Monawwarah Hotel from its independent Maps property point without merging it with Artal International", () => {
    const artal = hotelProfiles.find(hotel => hotel.slug === "artal-al-monawwarah")!;
    expect(artal).toMatchObject({ name: "Artal Al-Monawwarah Hotel", arabicName: "فندق أرتال المنورة", status: "verified" });
    expect(artal.mapAddress).toContain("FJF7+943");
    expect(artal.verification.evidenceLevel).toBe("map_listing");
    expect(artal.gallery).toEqual(["/manus-storage/artal-al-monawwarah-lobby_f554974b.jpg", "/manus-storage/artal-al-monawwarah-exterior_0d52259c.jpg"]);
    expect(artal.nearestGate).toBeUndefined();
    expect(artal.content.en.amenities).toEqual([]);
    expect(hotelProfiles.some(hotel => hotel.slug === "artal-international-madinah")).toBe(false);
  });

  it("adds Maysan Al Taqwa Hotel from matching Maysan and Maps evidence without publishing rooms, amenities, imagery, or a gate route", () => {
    const maysanTaqwa = hotelProfiles.find(hotel => hotel.slug === "maysan-al-taqwa")!;
    expect(maysanTaqwa).toMatchObject({ name: "Maysan Al Taqwa Hotel", arabicName: "فندق ميسان التقوى", status: "verified" });
    expect(maysanTaqwa.mapAddress).toContain("FJ77+FP");
    expect(maysanTaqwa.sourceUrl).toContain("maysangroup.com");
    expect(maysanTaqwa.gallery).toEqual(["/manus-storage/maysan-al-taqwa-exterior_19e967ed.jpg", "/manus-storage/maysan-al-taqwa-room_2b429b08.jpg"]);
    expect(maysanTaqwa.nearestGate).toBeUndefined();
    expect(maysanTaqwa.content.en.amenities).toEqual([]);
  });

  it("adds Ruve Hotel Medinah from its independent Maps card without importing platform ratings, distances, amenities, imagery, or a gate route", () => {
    const ruve = hotelProfiles.find(hotel => hotel.slug === "ruve-al-madinah")!;
    expect(ruve).toMatchObject({ name: "Ruve Hotel Medinah", arabicName: "فندق روف المدينة", status: "verified" });
    expect(ruve.mapAddress).toContain("FJF7+34");
    expect(ruve.verification.evidenceLevel).toBe("map_listing");
    expect(ruve.gallery).toEqual(["/manus-storage/ruve-al-madinah-official-1_b30d8745.jpg", "/manus-storage/ruve-al-madinah-official-2_0a80d468.jpg", "/manus-storage/ruve-al-madinah-official-3_921f4c92.jpg"]);
    expect(ruve.nearestGate).toBeUndefined();
    expect(ruve.content.en.amenities).toEqual([]);
  });

  it("uses the current AncyrA Rose Hotel by Continent Madinah identity with matching official and Maps evidence while withholding unsupported details", () => {
    const ancyra = hotelProfiles.find(hotel => hotel.slug === "ancyra-rose-madinah")!;
    expect(ancyra).toMatchObject({ name: "AncyrA Rose Hotel by Continent Madinah", arabicName: "فندق أنكيرا روز المدينة بإدارة كونتيننت", status: "verified" });
    expect(ancyra.mapAddress).toContain("FJ77+F2");
    expect(ancyra.sourceUrl).toBe("https://www.ancyramadinahotel.com/");
    expect(ancyra.verification.evidenceLevel).toBe("official_property");
    expect(ancyra.gallery).toEqual(["/manus-storage/ancyra-rose-official-exterior_98eaac35.jpg", "/manus-storage/ancyra-rose-official-family-room_649947a8.jpg"]);
    expect(ancyra.nearestGate).toBeUndefined();
    expect(ancyra.content.en.amenities).toEqual([]);
  });

  it("adds Worth Peninsula Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const worth = hotelProfiles.find(hotel => hotel.slug === "worth-peninsula-madinah")!;
    expect(worth).toMatchObject({ name: "Worth Peninsula Hotel", arabicName: "فندق وورث بيننسولا", status: "verified", category: "premium" });
    expect(worth.mapAddress).toContain("FJF6+HGF");
    expect(worth.verification.evidenceLevel).toBe("map_listing");
    expect(worth.gallery).toEqual(["/manus-storage/worth-peninsula-madinah-exterior_82c6f72e.jpg", "/manus-storage/worth-peninsula-madinah-room_3a557abc.jpg", "/manus-storage/worth-peninsula-madinah-lobby_f5c4d204.jpg"]);
    expect(worth.nearestGate).toBeUndefined();
    expect(worth.content.en.amenities).toEqual([]);
  });

  it("uses the current Tulip Inn Al Daar Rawafid identity with matching Golden Tulip and Maps evidence while withholding unreviewed route and media details", () => {
    const tulip = hotelProfiles.find(hotel => hotel.slug === "tulip-inn-al-daar-rawafid")!;
    expect(tulip).toMatchObject({ name: "Tulip Inn Al Daar Rawafid", arabicName: "فندق توليب إن الدار روافد", status: "verified" });
    expect(tulip.mapAddress).toContain("FJ93+VW");
    expect(tulip.sourceUrl).toContain("goldentulip.com");
    expect(tulip.verification.evidenceLevel).toBe("official_property");
    expect(tulip.gallery).toEqual(["/manus-storage/tulip-inn-al-daar-rawafid-room_9fca4742.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-lobby_41fe7e17.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-guest-room_9e3545a2.jpg"]);
    expect(tulip.nearestGate).toBeUndefined();
    expect(tulip.content.en.amenities).toEqual([]);
  });

  it("uses the Maien Taiba Hotel identity from the Maien group source and matching Maps point while withholding unsupported profile details", () => {
    const maien = hotelProfiles.find(hotel => hotel.slug === "maien-taiba")!;
    expect(maien).toMatchObject({ name: "Maien Taiba Hotel", arabicName: "فندق معين طيبة", status: "verified" });
    expect(maien.mapAddress).toContain("FJ77+M7");
    expect(maien.sourceUrl).toBe("https://www.maienalmadina.com/");
    expect(maien.verification.evidenceLevel).toBe("official_property");
    expect(maien.gallery).toEqual(["/manus-storage/maien-taiba-reception_eed933d9.jpg", "/manus-storage/maien-taiba-twin-room_c66df46c.jpg", "/manus-storage/maien-taiba-quint-room_3c03df4e.jpg"]);
    expect(maien.nearestGate).toBeUndefined();
    expect(maien.content.en.amenities).toEqual([]);
  });

  it("adds Diyar Al Taqwa Hotel from its independent Maps card without importing platform ratings, facilities, imagery, or a gate route", () => {
    const diyarTaqwa = hotelProfiles.find(hotel => hotel.slug === "diyar-al-taqwa-madinah")!;
    expect(diyarTaqwa).toMatchObject({ name: "Diyar Al Taqwa Hotel", arabicName: "فندق ديار التقوى", status: "verified" });
    expect(diyarTaqwa.mapAddress).toContain("FJ93+GW");
    expect(diyarTaqwa.verification.evidenceLevel).toBe("map_listing");
    expect(diyarTaqwa.gallery).toEqual(["/manus-storage/diyar-al-taqwa-lobby_48740534.jpg", "/manus-storage/diyar-al-taqwa-exterior_6f207a66.jpg", "/manus-storage/diyar-al-taqwa-room_f9ee8974.jpg"]);
    expect(diyarTaqwa.nearestGate).toBeUndefined();
    expect(diyarTaqwa.content.en.amenities).toEqual([]);
  });

  it("uses the Assaafa Hotel identity and correct Arabic name from the hotel source and matching Maps point while withholding unsupported details", () => {
    const assaafa = hotelProfiles.find(hotel => hotel.slug === "assaafa-hotel-madinah")!;
    expect(assaafa).toMatchObject({ name: "Assaafa Hotel", arabicName: "فندق السعفة", status: "verified" });
    expect(searchHotelsByName([assaafa], "فندق الصفاء")).toEqual([assaafa]);
    expect(assaafa.mapAddress).toContain("FJ73+W9");
    expect(assaafa.sourceUrl).toBe("https://assaafahotels.com/");
    expect(assaafa.verification.evidenceLevel).toBe("official_property");
    expect(assaafa.gallery).toEqual(["/manus-storage/assaafa-hotel-madinah-exterior_abeae964.jpeg", "/manus-storage/assaafa-hotel-madinah-room_5c06d01c.jpg", "/manus-storage/assaafa-hotel-madinah-lobby_8bc45b80.jpg"]);
    expect(assaafa.nearestGate).toBeUndefined();
    expect(assaafa.content.en.amenities).toEqual([]);
  });

  it("adds Nusk Al Hijrah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const nuskHijrah = hotelProfiles.find(hotel => hotel.slug === "nusk-al-hijrah-madinah")!;
    expect(nuskHijrah).toMatchObject({ name: "Nusk Al Hijrah Hotel", arabicName: "فندق نسك الهجرة", status: "verified" });
    expect(nuskHijrah.mapAddress).toContain("FJ75+WV");
    expect(nuskHijrah.verification.evidenceLevel).toBe("map_listing");
    expect(nuskHijrah.gallery).toEqual(["/manus-storage/nusk-al-hijrah-lobby_bb7ebc30.jpg", "/manus-storage/nusk-al-hijrah-room_a740dbd6.jpg", "/manus-storage/nusk-al-hijrah-entrance_fc96e013.jpg"]);
    expect(nuskHijrah.nearestGate).toBeUndefined();
    expect(nuskHijrah.content.en.amenities).toEqual([]);
  });

  it("uses the current Castle Hotel identity from Maps while retaining the supplied Arabic castle wording only for search and withholding unsupported details", () => {
    const castle = hotelProfiles.find(hotel => hotel.slug === "castle-hotel-madinah")!;
    expect(castle).toMatchObject({ name: "Castle Hotel", arabicName: "فندق كاسيل", status: "verified" });
    expect(searchHotelsByName([castle], "فندق القلعة")).toEqual([castle]);
    expect(castle.mapAddress).toContain("FJ75+H2");
    expect(castle.verification.evidenceLevel).toBe("map_listing");
    expect(castle.gallery).toEqual(["/manus-storage/castle-hotel-madinah-exterior_c8553e20.jpg", "/manus-storage/castle-hotel-madinah-room_dde8502e.jpg", "/manus-storage/castle-hotel-madinah-lobby_7225e888.jpg"]);
    expect(castle.nearestGate).toBeUndefined();
    expect(castle.content.en.amenities).toEqual([]);
  });

  it("adds Plaza Inn Ohud from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const plazaOhud = hotelProfiles.find(hotel => hotel.slug === "plaza-inn-ohud-madinah")!;
    expect(plazaOhud).toMatchObject({ name: "Plaza Inn Ohud", arabicName: "فندق بلازا إن أحد", status: "verified" });
    expect(plazaOhud.mapAddress).toContain("FJ83+G8");
    expect(plazaOhud.verification.evidenceLevel).toBe("map_listing");
    expect(plazaOhud.gallery).toEqual(["/manus-storage/plaza-inn-ohud-dining_e08fde1e.jpg", "/manus-storage/plaza-inn-ohud-room_ce131503.jpg", "/manus-storage/plaza-inn-ohud-lobby_9ad4db66.jpg"]);
    expect(plazaOhud.nearestGate).toBeUndefined();
    expect(plazaOhud.content.en.amenities).toEqual([]);
  });

  it("uses the current Belvedere Hotel identity from Maps while retaining the former Tuma'ninah wording only for search and withholding unsupported details", () => {
    const belvedere = hotelProfiles.find(hotel => hotel.slug === "belvedere-hotel-madinah")!;
    expect(belvedere).toMatchObject({ name: "Belvedere Hotel", arabicName: "فندق بيلفيديري", status: "verified", proximityBand: "city" });
    expect(searchHotelsByName([belvedere], "فندق طمأنينة")).toEqual([belvedere]);
    expect(belvedere.mapAddress).toContain("FJJQ+X6");
    expect(belvedere.verification.evidenceLevel).toBe("map_listing");
    expect(belvedere.gallery).toEqual(["/manus-storage/belvedere-hotel-madinah-lobby_a664a0c2.jpg", "/manus-storage/belvedere-hotel-madinah-room_88df16de.jpg", "/manus-storage/belvedere-hotel-madinah-suite_130e06fb.jpg"]);
    expect(belvedere.nearestGate).toBeUndefined();
    expect(belvedere.content.en.amenities).toEqual([]);
  });

  it("adds AURION Hotel Al-Aqeeq from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const aurion = hotelProfiles.find(hotel => hotel.slug === "aurion-al-aqeeq-madinah")!;
    expect(aurion).toMatchObject({ name: "AURION Hotel Al-Aqeeq", arabicName: "فندق أوريون العقيق", status: "verified", proximityBand: "city" });
    expect(aurion.mapAddress).toContain("FH7F+6V");
    expect(aurion.verification.evidenceLevel).toBe("map_listing");
    expect(aurion.gallery).toEqual(["/manus-storage/aurion-al-aqeeq-room_97c2a1da.jpg", "/manus-storage/aurion-al-aqeeq-suite_f3ffc623.jpg", "/manus-storage/aurion-al-aqeeq-bedroom_0f73b8f7.jpg"]);
    expect(aurion.nearestGate).toBeUndefined();
    expect(aurion.content.en.amenities).toEqual([]);
  });

  it("adds AVAL Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const aval = hotelProfiles.find(hotel => hotel.slug === "aval-hotel-madinah")!;
    expect(aval).toMatchObject({ name: "AVAL Hotel", arabicName: "فندق أفال", status: "verified", proximityBand: "city" });
    expect(aval.mapAddress).toContain("FM76+4C");
    expect(aval.verification.evidenceLevel).toBe("map_listing");
    expect(aval.gallery).toEqual(["/manus-storage/aval-hotel-madinah-exterior_275c7880.jpg", "/manus-storage/aval-hotel-madinah-lobby_5b89a276.jpg", "/manus-storage/aval-hotel-madinah-room_0160ed2b.jpg"]);
    expect(aval.nearestGate).toBeUndefined();
    expect(aval.content.en.amenities).toEqual([]);
  });

  it("publishes Assaafa Hotel with exact-identity gallery imagery while keeping Assaafa Golden separate", () => {
    const assaafa = hotelProfiles.find(hotel => hotel.slug === "assaafa-hotel-madinah")!;
    expect(assaafa).toMatchObject({ name: "Assaafa Hotel", arabicName: "فندق السعفة", status: "verified" });
    expect(assaafa.gallery).toEqual(["/manus-storage/assaafa-hotel-madinah-exterior_abeae964.jpeg", "/manus-storage/assaafa-hotel-madinah-room_5c06d01c.jpg", "/manus-storage/assaafa-hotel-madinah-lobby_8bc45b80.jpg"]);
    expect(assaafa.content.en.amenities).toEqual([]);
    expect(assaafa.nearestGate).toBeUndefined();
  });

  it("publishes Diyafa Al Mukhtara and Castle Hotel with gallery media only and no imported listing facts", () => {
    const diyafa = hotelProfiles.find(hotel => hotel.slug === "diyafa-al-mukhtara-madinah")!;
    const castle = hotelProfiles.find(hotel => hotel.slug === "castle-hotel-madinah")!;
    expect(diyafa.gallery).toEqual(["/manus-storage/diyafa-al-mukhtara-madinah-exterior_9d718612.webp", "/manus-storage/diyafa-al-mukhtara-madinah-room_dd553dda.jpg", "/manus-storage/diyafa-al-mukhtara-madinah-lobby_133f1471.jpg"]);
    expect(castle.gallery).toEqual(["/manus-storage/castle-hotel-madinah-exterior_c8553e20.jpg", "/manus-storage/castle-hotel-madinah-room_dde8502e.jpg", "/manus-storage/castle-hotel-madinah-lobby_7225e888.jpg"]);
    expect(diyafa.content.en.amenities).toEqual([]);
    expect(castle.content.en.amenities).toEqual([]);
    expect(diyafa.nearestGate).toBeUndefined();
    expect(castle.nearestGate).toBeUndefined();
  });

  it("uses the Al Sada Al Masi name displayed by Maps while keeping the supplied Sama Al Masi wording searchable and withholding unsupported details", () => {
    const alSada = hotelProfiles.find(hotel => hotel.slug === "al-sada-al-masi-madinah")!;
    expect(alSada).toMatchObject({ name: "Al Sada Al Masi Hotel", arabicName: "فندق السادة الماسي", status: "verified" });
    expect(searchHotelsByName([alSada], "فندق سما الماسي")).toEqual([alSada]);
    expect(alSada.mapAddress).toContain("FH8X+5QJ");
    expect(alSada.verification.evidenceLevel).toBe("map_listing");
    expect(alSada.gallery).toEqual(["/manus-storage/al-sada-al-masi-exterior_64764373.jpg", "/manus-storage/al-sada-al-masi-room_0a886411.jpg", "/manus-storage/al-sada-al-masi-lobby_bf1d13f3.jpg"]);
    expect(alSada.nearestGate).toBeUndefined();
    expect(alSada.content.en.amenities).toEqual([]);
  });

  it("adds Maysan Rihab Al Misk from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const rihabMisk = hotelProfiles.find(hotel => hotel.slug === "maysan-rihab-al-misk-madinah")!;
    expect(rihabMisk).toMatchObject({ name: "Maysan Rihab Al Misk", arabicName: "فندق ميسان رحاب المسك", status: "verified" });
    expect(rihabMisk.mapAddress).toContain("FJ75+Q2");
    expect(rihabMisk.verification.evidenceLevel).toBe("map_listing");
    expect(rihabMisk.gallery).toEqual(["/manus-storage/maysan-rihab-al-misk-room_e30b875c.jpg", "/manus-storage/maysan-rihab-al-misk-exterior_f110b3b6.jpg", "/manus-storage/maysan-rihab-al-misk-lobby_dd315d03.jpg"]);
    expect(rihabMisk.nearestGate).toBeUndefined();
    expect(rihabMisk.content.en.amenities).toEqual([]);
  });

  it("uses the current Durrah Al Eiman identity from Maps while retaining the supplied Kingsgate Durra wording only for search and withholding unsupported details", () => {
    const durrahEiman = hotelProfiles.find(hotel => hotel.slug === "durrah-al-eiman-madinah")!;
    expect(durrahEiman).toMatchObject({ name: "Durrah Al Eiman Hotel", arabicName: "فندق درة الإيمان", status: "verified" });
    expect(searchHotelsByName([durrahEiman], "Kingsgate Durra")).toEqual([durrahEiman]);
    expect(durrahEiman.mapAddress).toContain("FJF4+5H");
    expect(durrahEiman.verification.evidenceLevel).toBe("map_listing");
    expect(durrahEiman.gallery).toEqual(["/manus-storage/durrah-al-eiman-exterior_95196c97.jpg", "/manus-storage/durrah-al-eiman-lobby_372f2b5c.jpg", "/manus-storage/durrah-al-eiman-room_6a93e299.jpg"]);
    expect(durrahEiman.nearestGate).toBeUndefined();
    expect(durrahEiman.content.en.amenities).toEqual([]);
  });

  it("adds Saraya Taba Hotel A from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const sarayaTaba = hotelProfiles.find(hotel => hotel.slug === "saraya-taba-hotel-a-madinah")!;
    expect(sarayaTaba).toMatchObject({ name: "Saraya Taba Hotel A", arabicName: "فندق سرايا طابة A", status: "verified" });
    expect(sarayaTaba.mapAddress).toContain("FJ77+QHR");
    expect(sarayaTaba.verification.evidenceLevel).toBe("map_listing");
    expect(sarayaTaba.gallery).toEqual(["/manus-storage/saraya-taba-room_a679b92b.jpg", "/manus-storage/saraya-taba-lobby_c6206689.jpg", "/manus-storage/saraya-taba-guest-room_e41880bf.jpg"]);
    expect(sarayaTaba.nearestGate).toBeUndefined();
    expect(sarayaTaba.content.en.amenities).toEqual([]);
  });

  it("adds Manazeli Al Madinah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const manazeli = hotelProfiles.find(hotel => hotel.slug === "manazeli-al-madinah")!;
    expect(manazeli).toMatchObject({ name: "Manazeli Al Madinah Hotel", arabicName: "فندق منازلي المدينة", status: "verified" });
    expect(manazeli.mapAddress).toContain("FJ86+34F");
    expect(manazeli.verification.evidenceLevel).toBe("map_listing");
    expect(manazeli.gallery).toEqual(["/manus-storage/manazeli-al-madinah-room_9022665b.jpg", "/manus-storage/manazeli-al-madinah-reception_1fd9afc7.jpg", "/manus-storage/manazeli-al-madinah-suite_71987019.jpg"]);
    expect(manazeli.nearestGate).toBeUndefined();
    expect(manazeli.content.en.amenities).toEqual([]);
  });

  it("adds Hayah Plaza Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const hayahPlaza = hotelProfiles.find(hotel => hotel.slug === "hayah-plaza-madinah")!;
    expect(hayahPlaza).toMatchObject({ name: "Hayah Plaza Hotel", arabicName: "فندق الحياة بلازا", status: "verified" });
    expect(hayahPlaza.mapAddress).toContain("FJ75+XG");
    expect(hayahPlaza.verification.evidenceLevel).toBe("map_listing");
    expect(hayahPlaza.gallery).toEqual(["/manus-storage/hayah-plaza-room_c528be45.jpg", "/manus-storage/hayah-plaza-lobby_1e18b400.jpg", "/manus-storage/hayah-plaza-reception_2f0b284a.jpg"]);
    expect(hayahPlaza.nearestGate).toBeUndefined();
    expect(hayahPlaza.content.en.amenities).toEqual([]);
  });

  it("adds Qasr Al Andalus Golden Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const qasrAndalus = hotelProfiles.find(hotel => hotel.slug === "qasr-al-andalus-golden-madinah")!;
    expect(qasrAndalus).toMatchObject({ name: "Qasr Al Andalus Golden Hotel", arabicName: "فندق قصر الأندلس الذهبي", status: "verified" });
    expect(qasrAndalus.mapAddress).toContain("FJF5+72");
    expect(qasrAndalus.verification.evidenceLevel).toBe("map_listing");
    expect(qasrAndalus.gallery).toEqual(["/manus-storage/qasr-al-andalus-golden-room_4ac41372.jpg", "/manus-storage/qasr-al-andalus-golden-lobby_d9c1e9e3.jpg", "/manus-storage/qasr-al-andalus-golden-exterior_ecaeca4c.jpg"]);
    expect(qasrAndalus.nearestGate).toBeUndefined();
    expect(qasrAndalus.content.en.amenities).toEqual([]);
  });

  it("adds Al Waha Rawdah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const wahaRawdah = hotelProfiles.find(hotel => hotel.slug === "al-waha-rawdah-madinah")!;
    expect(wahaRawdah).toMatchObject({ name: "Al Waha Rawdah Hotel", arabicName: "فندق الواحة الروضة", status: "verified" });
    expect(wahaRawdah.mapAddress).toContain("FJ74+GXR");
    expect(wahaRawdah.verification.evidenceLevel).toBe("map_listing");
    expect(wahaRawdah.gallery).toEqual(["/manus-storage/al-waha-rawdah-lobby_a793a776.jpg", "/manus-storage/al-waha-rawdah-room_4b2a5070.jpg", "/manus-storage/al-waha-rawdah-reception_b5821b96.jpg"]);
    expect(wahaRawdah.nearestGate).toBeUndefined();
    expect(wahaRawdah.content.en.amenities).toEqual([]);
  });

  it("adds Manazel Al Aswaf Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const manazelAswaf = hotelProfiles.find(hotel => hotel.slug === "manazel-al-aswaf-madinah")!;
    expect(manazelAswaf).toMatchObject({ name: "Manazel Al Aswaf Hotel", arabicName: "فندق منازل الأسواف", status: "verified" });
    expect(manazelAswaf.mapAddress).toContain("FJ75+HP");
    expect(manazelAswaf.verification.evidenceLevel).toBe("map_listing");
    expect(manazelAswaf.gallery).toEqual(["/manus-storage/manazel-al-aswaf-exterior_6d002802.jpg", "/manus-storage/manazel-al-aswaf-room_c5aaefa5.jpg", "/manus-storage/manazel-al-aswaf-lobby_f62c7798.jpg"]);
    expect(manazelAswaf.nearestGate).toBeUndefined();
    expect(manazelAswaf.content.en.amenities).toEqual([]);
  });

  it("adds Rotana Al Misk Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const rotanaMisk = hotelProfiles.find(hotel => hotel.slug === "rotana-al-misk-madinah")!;
    expect(rotanaMisk).toMatchObject({ name: "Rotana Al Misk Hotel", arabicName: "فندق روتانا المسك", status: "verified" });
    expect(rotanaMisk.mapAddress).toContain("FJ75+MMH");
    expect(rotanaMisk.verification.evidenceLevel).toBe("map_listing");
    expect(rotanaMisk.gallery).toEqual(["/manus-storage/rotana-al-misk-exterior_42958503.jpg", "/manus-storage/rotana-al-misk-room_612d2ebf.jpg", "/manus-storage/rotana-al-misk-lobby_6e5147f5.jpg"]);
    expect(rotanaMisk.nearestGate).toBeUndefined();
    expect(rotanaMisk.content.en.amenities).toEqual([]);
  });

  it("adds Golden Madinah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const goldenMadinah = hotelProfiles.find(hotel => hotel.slug === "golden-madinah-hotel")!;
    expect(goldenMadinah).toMatchObject({ name: "Golden Madinah Hotel", arabicName: "فندق المدينة الذهبي", status: "verified" });
    expect(goldenMadinah.mapAddress).toContain("FJ85+4X");
    expect(goldenMadinah.verification.evidenceLevel).toBe("map_listing");
    expect(goldenMadinah.gallery).toEqual(["/manus-storage/golden-madinah-hotel-exterior_02f50b8b.jpg", "/manus-storage/golden-madinah-hotel-room_fea1fe0c.jpg", "/manus-storage/golden-madinah-hotel-lobby_fa1b088d.jpg"]);
    expect(goldenMadinah.nearestGate).toBeUndefined();
    expect(goldenMadinah.content.en.amenities).toEqual([]);
  });

  it("adds Dar Al Eiman Grand Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const eimanGrand = hotelProfiles.find(hotel => hotel.slug === "dar-al-eiman-grand-madinah")!;
    expect(eimanGrand).toMatchObject({ name: "Dar Al Eiman Grand Hotel", arabicName: "فندق دار الإيمان جراند", status: "verified" });
    expect(eimanGrand.mapAddress).toContain("FJ75+QR");
    expect(eimanGrand.verification.evidenceLevel).toBe("map_listing");
    expect(eimanGrand.gallery).toEqual(["/manus-storage/exterior-trip-medina_03d41764.jpg"]);
    expect(eimanGrand.nearestGate).toBeUndefined();
    expect(eimanGrand.content.en.amenities).toEqual([]);
  });

  it("adds Nusk Al Madinah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const nuskMadinah = hotelProfiles.find(hotel => hotel.slug === "nusk-al-madinah-hotel")!;
    expect(nuskMadinah).toMatchObject({ name: "Nusk Al Madinah Hotel", arabicName: "فندق نسك المدينة", status: "verified" });
    expect(nuskMadinah.mapAddress).toContain("FJ75+QR");
    expect(nuskMadinah.verification.evidenceLevel).toBe("map_listing");
    expect(nuskMadinah.gallery).toEqual(["/manus-storage/nusk-al-madinah-room_863b9541.jpg", "/manus-storage/nusk-al-madinah-lobby_5adb1aef.jpg", "/manus-storage/nusk-al-madinah-guest-room_76652261.webp"]);
    expect(nuskMadinah.nearestGate).toBeUndefined();
    expect(nuskMadinah.content.en.amenities).toEqual([]);
  });

  it("adds Nusk Al Eman as a distinct current hotel with its reviewed property point and Ramada Al Qibla search alias", () => {
    const nuskEman = hotelProfiles.find(hotel => hotel.slug === "nusk-al-eman-hotel")!;
    const nuskMadinah = hotelProfiles.find(hotel => hotel.slug === "nusk-al-madinah-hotel")!;
    expect(nuskEman).toMatchObject({ name: "Nusk Al Eman Hotel", arabicName: "فندق نسك الإيمان", status: "verified" });
    expect(nuskEman.mapAddress).toContain("24.465418");
    expect(nuskEman.googleMapsPlaceUrl).toContain("24.465418");
    expect(nuskEman.gallery).toEqual(["/manus-storage/nusk-al-eman-exterior_4d999c54.jpg"]);
    expect(nuskEman.galleryKind).not.toBe("destination_placeholder");
    expect(nuskEman.galleryNote).toBe("Hotel exterior image");
    expect(nuskEman.nearestGate).toBeUndefined();
    expect(searchHotelsByName([nuskEman], "Ramada Al Qibla")).toEqual([nuskEman]);
    expect(searchHotelsByName([nuskEman], "نسك الإيمان")).toEqual([nuskEman]);
    expect(nuskEman.slug).not.toBe(nuskMadinah.slug);
  });

  it("adds Rama Al Madinah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const ramaMadinah = hotelProfiles.find(hotel => hotel.slug === "rama-al-madinah-hotel")!;
    expect(ramaMadinah).toMatchObject({ name: "Rama Al Madinah Hotel", arabicName: "فندق راما المدينة", status: "verified" });
    expect(ramaMadinah.mapAddress).toContain("FJ75+HR");
    expect(ramaMadinah.verification.evidenceLevel).toBe("map_listing");
    expect(ramaMadinah.gallery).toEqual(["/manus-storage/rama-al-madinah-exterior_92924b1b.jpg", "/manus-storage/rama-al-madinah-room_21b59319.jpg", "/manus-storage/rama-al-madinah-lobby_5f74f7ea.jpg"]);
    expect(ramaMadinah.nearestGate).toBeUndefined();
    expect(ramaMadinah.content.en.amenities).toEqual([]);
  });

  it("adds Jiwar Taiba Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const jiwarTaiba = hotelProfiles.find(hotel => hotel.slug === "jiwar-taiba-madinah")!;
    expect(jiwarTaiba).toMatchObject({ name: "Jiwar Taiba Hotel", arabicName: "فندق جوار طيبة", status: "verified" });
    expect(jiwarTaiba.mapAddress).toContain("FJ74+FRM");
    expect(jiwarTaiba.verification.evidenceLevel).toBe("map_listing");
    expect(jiwarTaiba.gallery).toEqual(["/manus-storage/jiwar-taiba-madinah-exterior_9e2bbc5d.jpg", "/manus-storage/jiwar-taiba-madinah-room_ce340cf6.jpg", "/manus-storage/jiwar-taiba-madinah-lobby_310d83cd.jpg"]);
    expect(jiwarTaiba.nearestGate).toBeUndefined();
    expect(jiwarTaiba.content.en.amenities).toEqual([]);
  });

  it("adds Luluat Al Diyafa Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const luluatAlDiyafa = hotelProfiles.find(hotel => hotel.slug === "luluat-al-diyafa-madinah")!;
    expect(luluatAlDiyafa).toMatchObject({ name: "Luluat Al Diyafa Hotel", arabicName: "فندق لؤلؤة الضيافة", status: "verified" });
    expect(luluatAlDiyafa.mapAddress).toContain("FJ83+3R");
    expect(luluatAlDiyafa.verification.evidenceLevel).toBe("map_listing");
    expect(luluatAlDiyafa.gallery).toEqual(["/manus-storage/luluat-al-diyafa-madinah-exterior_f5768722.jpg", "/manus-storage/luluat-al-diyafa-madinah-room_a146bf76.jpg", "/manus-storage/luluat-al-diyafa-madinah-room-alt_5b84b4e8.jpg"]);
    expect(luluatAlDiyafa.nearestGate).toBeUndefined();
    expect(luluatAlDiyafa.content.en.amenities).toEqual([]);
  });

  it("adds Abraj Al Diyafah Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const abrajAlDiyafah = hotelProfiles.find(hotel => hotel.slug === "abraj-al-diyafah-madinah")!;
    expect(abrajAlDiyafah).toMatchObject({ name: "Abraj Al Diyafah Hotel", arabicName: "فندق أبراج الضيافة", status: "verified" });
    expect(abrajAlDiyafah.mapAddress).toContain("FJJ8+X5");
    expect(abrajAlDiyafah.verification.evidenceLevel).toBe("map_listing");
    expect(abrajAlDiyafah.gallery).toEqual(["/manus-storage/abraj-al-diyafah-lobby_fdebf33e.jpg", "/manus-storage/abraj-al-diyafah-room_ab9d4634.jpg", "/manus-storage/abraj-al-diyafah-reception_1be81ab2.jpg"]);
    expect(abrajAlDiyafah.nearestGate).toBeUndefined();
    expect(abrajAlDiyafah.content.en.amenities).toEqual([]);
  });

  it("adds Hotel Lulu Al Arab from its independent Maps card without importing property imagery, ratings, facilities, or a gate route", () => {
    const luluAlArab = hotelProfiles.find(hotel => hotel.slug === "lulu-al-arab-madinah")!;
    expect(luluAlArab).toMatchObject({ name: "Hotel Lulu Al Arab", arabicName: "فندق لولو العرب", status: "verified" });
    expect(luluAlArab.mapAddress).toContain("FJ92+55");
    expect(luluAlArab.verification.evidenceLevel).toBe("map_listing");
    expect(luluAlArab.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(luluAlArab.galleryKind).toBe("destination_placeholder");
    expect(luluAlArab.nearestGate).toBeUndefined();
    expect(luluAlArab.content.en.amenities).toEqual([]);
  });

  it("adds Luluat Quba Hotel from its independent Maps card without importing property imagery, ratings, facilities, or a gate route", () => {
    const luluatQuba = hotelProfiles.find(hotel => hotel.slug === "luluat-quba-madinah")!;
    expect(luluatQuba).toMatchObject({ name: "Luluat Quba Hotel", arabicName: "فندق لؤلؤة قباء", status: "verified" });
    expect(luluatQuba.mapAddress).toContain("FJ66+28Q");
    expect(luluatQuba.verification.evidenceLevel).toBe("map_listing");
    expect(luluatQuba.gallery).toEqual(["/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"]);
    expect(luluatQuba.galleryKind).toBe("destination_placeholder");
    expect(luluatQuba.nearestGate).toBeUndefined();
    expect(luluatQuba.content.en.amenities).toEqual([]);
  });

  it("adds Zaha Taiba Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const zahaTaiba = hotelProfiles.find(hotel => hotel.slug === "zaha-taiba-madinah")!;
    expect(zahaTaiba).toMatchObject({ name: "Zaha Taiba Hotel", arabicName: "فندق زها طيبة", status: "verified" });
    expect(zahaTaiba.mapAddress).toContain("FJH7+QR");
    expect(zahaTaiba.verification.evidenceLevel).toBe("map_listing");
    expect(zahaTaiba.gallery).toEqual(["/manus-storage/zaha-taiba-official-exterior_8d3e449a.jpg", "/manus-storage/zaha-taiba-official-lobby_296d28b3.jpg"]);
    expect(zahaTaiba.nearestGate).toBeUndefined();
    expect(zahaTaiba.content.en.amenities).toEqual([]);
  });

  it("adds Afaq Al Masi Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const afaqAlMasi = hotelProfiles.find(hotel => hotel.slug === "afaq-al-masi-madinah")!;
    expect(afaqAlMasi).toMatchObject({ name: "Afaq Al Masi Hotel", arabicName: "فندق آفاق الماسي", status: "verified" });
    expect(afaqAlMasi.mapAddress).toContain("CJXC+PW");
    expect(afaqAlMasi.verification.evidenceLevel).toBe("map_listing");
    expect(afaqAlMasi.gallery).toEqual(["/manus-storage/afaq-al-masi-lobby_c43ead7c.jpg", "/manus-storage/afaq-al-masi-exterior_a80e6afb.jpg", "/manus-storage/afaq-al-masi-reception_f9833a04.jpg"]);
    expect(afaqAlMasi.nearestGate).toBeUndefined();
    expect(afaqAlMasi.content.en.amenities).toEqual([]);
  });

  it("adds Afaq Al Salam Golden Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const afaqAlSalam = hotelProfiles.find(hotel => hotel.slug === "afaq-al-salam-golden-madinah")!;
    expect(afaqAlSalam).toMatchObject({ name: "Afaq Al Salam Golden Hotel", arabicName: "فندق آفاق السلام الذهبي", status: "verified" });
    expect(afaqAlSalam.mapAddress).toContain("FH8X+J3");
    expect(afaqAlSalam.verification.evidenceLevel).toBe("map_listing");
    expect(afaqAlSalam.gallery).toEqual(["/manus-storage/afaq-al-salam-golden-exterior-day_04830d57.jpg", "/manus-storage/afaq-al-salam-golden-exterior-night_7d3b1b1d.jpg", "/manus-storage/afaq-al-salam-golden-lobby_df8684f2.jpg"]);
    expect(afaqAlSalam.nearestGate).toBeUndefined();
    expect(afaqAlSalam.content.en.amenities).toEqual([]);
  });

  it("adds Cladium Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const cladium = hotelProfiles.find(hotel => hotel.slug === "cladium-hotel-madinah")!;
    expect(cladium).toMatchObject({ name: "Cladium Hotel", arabicName: "فندق كلاديوم", status: "verified" });
    expect(cladium.mapAddress).toContain("FJCM+F5R");
    expect(cladium.verification.evidenceLevel).toBe("map_listing");
    expect(cladium.gallery).toEqual(["/manus-storage/cladium-room_6bfa7b5e.jpg", "/manus-storage/cladium-lobby_44603903.webp", "/manus-storage/cladium-exterior_d7128667.jpg"]);
    expect(cladium.nearestGate).toBeUndefined();
    expect(cladium.content.en.amenities).toEqual([]);
  });

  it("adds Shaza Al Baraka Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const shazaAlBaraka = hotelProfiles.find(hotel => hotel.slug === "shaza-al-baraka-madinah")!;
    expect(shazaAlBaraka).toMatchObject({ name: "Shaza Al Baraka Hotel", arabicName: "فندق شذا البركة", status: "verified" });
    expect(shazaAlBaraka.mapAddress).toContain("FH6X+X9");
    expect(shazaAlBaraka.verification.evidenceLevel).toBe("map_listing");
    expect(shazaAlBaraka.gallery).toEqual(["/manus-storage/shaza-al-baraka-room_aefb2321.jpg", "/manus-storage/shaza-al-baraka-exterior_76a99251.jpg", "/manus-storage/shaza-al-baraka-lobby_e269f363.jpg"]);
    expect(shazaAlBaraka.nearestGate).toBeUndefined();
    expect(shazaAlBaraka.content.en.amenities).toEqual([]);
  });

  it("adds Zaha Al Munawara Hotel separately from Zaha Taiba after confirming different Maps property points", () => {
    const zahaAlMunawara = hotelProfiles.find(hotel => hotel.slug === "zaha-al-munawara-madinah")!;
    const zahaTaiba = hotelProfiles.find(hotel => hotel.slug === "zaha-taiba-madinah")!;
    expect(zahaAlMunawara).toMatchObject({ name: "Zaha Al Munawara Hotel", arabicName: "فندق زها المنورة", status: "verified" });
    expect(zahaAlMunawara.mapAddress).toContain("FH8X+PQ");
    expect(zahaAlMunawara.verification.evidenceLevel).toBe("map_listing");
    expect(zahaAlMunawara.mapAddress).not.toContain("FJH7+QR");
    expect(zahaAlMunawara.slug).not.toBe(zahaTaiba.slug);
    expect(zahaAlMunawara.gallery).toEqual(["/manus-storage/zaha-al-munawara-lobby_89d655d0.jpg", "/manus-storage/zaha-al-munawara-exterior_0cbf8d76.jpg", "/manus-storage/zaha-al-munawara-corridor_8445d402.jpg"]);
    expect(zahaAlMunawara.nearestGate).toBeUndefined();
    expect(zahaAlMunawara.content.en.amenities).toEqual([]);
  });

  it("adds Shaza Regency Plaza Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const shazaRegency = hotelProfiles.find(hotel => hotel.slug === "shaza-regency-plaza-madinah")!;
    expect(shazaRegency).toMatchObject({ name: "Shaza Regency Plaza Hotel", arabicName: "فندق شذا ريجنسي بلازا", status: "verified" });
    expect(shazaRegency.mapAddress).toContain("FJF6+G3");
    expect(shazaRegency.verification.evidenceLevel).toBe("map_listing");
    expect(shazaRegency.gallery).toEqual(["/manus-storage/shaza-regency-plaza-lobby_ff5b7f4e.jpg", "/manus-storage/shaza-regency-plaza-exterior_0d4b4931.jpg", "/manus-storage/shaza-regency-plaza-room_c7068f18.jpg"]);
    expect(shazaRegency.nearestGate).toBeUndefined();
    expect(shazaRegency.content.en.amenities).toEqual([]);
  });

  it("adds Rabwat Al Safwa 7 Hotel separately from Rabwat Al Safwa Golden after confirming different Maps property points", () => {
    const rabwatSeven = hotelProfiles.find(hotel => hotel.slug === "rabwat-al-safwa-7-madinah")!;
    const rabwatGolden = hotelProfiles.find(hotel => hotel.slug === "rabwat-al-safwa-golden-madinah")!;
    expect(rabwatSeven).toMatchObject({ name: "Rabwat Al Safwa 7 Hotel", arabicName: "فندق ربوة الصفوة 7", status: "verified" });
    expect(rabwatSeven.mapAddress).toContain("FJHF+PQ");
    expect(rabwatSeven.verification.evidenceLevel).toBe("map_listing");
    expect(rabwatSeven.mapAddress).not.toContain("FJC3+2G");
    expect(rabwatSeven.slug).not.toBe(rabwatGolden.slug);
    expect(rabwatSeven.gallery).toEqual(["/manus-storage/rabwat-al-safwa-7-exterior-day_07bf3ebc.webp", "/manus-storage/rabwat-al-safwa-7-sign_6329e40b.jpg", "/manus-storage/rabwat-al-safwa-7-exterior-night_0adf9120.jpg"]);
    expect(rabwatSeven.nearestGate).toBeUndefined();
    expect(rabwatSeven.content.en.amenities).toEqual([]);
  });

  it("adds Abraj Al Marzam Hotel from its independent Maps card without importing the listing’s ratings, facilities, imagery, or a gate route", () => {
    const abrajAlMarzam = hotelProfiles.find(hotel => hotel.slug === "abraj-al-marzam-madinah")!;
    expect(abrajAlMarzam).toMatchObject({ name: "Abraj Al Marzam Hotel", arabicName: "فندق أبراج المرزم", status: "verified" });
    expect(abrajAlMarzam.mapAddress).toContain("FJPM+99");
    expect(abrajAlMarzam.verification.evidenceLevel).toBe("map_listing");
    expect(abrajAlMarzam.gallery).toEqual(["/manus-storage/abraj-al-marzam-madinah-exterior_05a1f451.jpg", "/manus-storage/abraj-al-marzam-madinah-room_8950e35d.jpg", "/manus-storage/abraj-al-marzam-madinah-lobby_360389ea.jpg"]);
    expect(abrajAlMarzam.nearestGate).toBeUndefined();
    expect(abrajAlMarzam.content.en.amenities).toEqual([]);
  });

  it("appends supplied, identity-matched hotel galleries without removing existing media or publishing them for unresolved profiles", () => {
    const darAlEimanGrand = hotelProfiles.find(hotel => hotel.slug === "dar-al-eiman-grand-madinah")!;
    const luluatAlDiyafa = hotelProfiles.find(hotel => hotel.slug === "luluat-al-diyafa-madinah")!;
    const jiwarTaiba = hotelProfiles.find(hotel => hotel.slug === "jiwar-taiba-madinah")!;
    const belvedereHotel = hotelProfiles.find(hotel => hotel.slug === "belvedere-hotel-madinah")!;
    const worthPeninsula = hotelProfiles.find(hotel => hotel.slug === "worth-peninsula-madinah")!;
    const goldenMadinah = hotelProfiles.find(hotel => hotel.slug === "golden-madinah-hotel")!;
    const abrajAlMarzam = hotelProfiles.find(hotel => hotel.slug === "abraj-al-marzam-madinah")!;
    const assaafa = hotelProfiles.find(hotel => hotel.slug === "assaafa-hotel-madinah")!;
    const diyafaAlMukhtara = hotelProfiles.find(hotel => hotel.slug === "diyafa-al-mukhtara-madinah")!;
    const castleHotel = hotelProfiles.find(hotel => hotel.slug === "castle-hotel-madinah")!;
    const holidayVilla = hotelProfiles.find(hotel => hotel.slug === "holiday-villa-madinah")!;
    const waqtAlNazeel = hotelProfiles.find(hotel => hotel.slug === "waqt-al-nazeel-madinah")!;
    const avalHotel = hotelProfiles.find(hotel => hotel.slug === "aval-hotel-madinah")!;
    const diyarWahatAlNazeel = hotelProfiles.find(hotel => hotel.slug === "diyar-wahat-al-nazeel-madinah")!;
    const mohamadiaAlZahra = hotelProfiles.find(hotel => hotel.slug === "mohamadia-al-zahra-madinah")!;
    const anwarAlZahraa = hotelProfiles.find(hotel => hotel.slug === "anwar-al-zahraa-madinah")!;
    const alAnsarGoldenTulip = hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-ansar-madinah")!;
    const grandZowar = hotelProfiles.find(hotel => hotel.slug === "grand-zowar-madinah")!;
    const rabwatSafwaSeven = hotelProfiles.find(hotel => hotel.slug === "rabwat-al-safwa-7-madinah")!;
    const shazaAlBaraka = hotelProfiles.find(hotel => hotel.slug === "shaza-al-baraka-madinah")!;
    const zahaAlMunawara = hotelProfiles.find(hotel => hotel.slug === "zaha-al-munawara-madinah")!;
    const shazaRegencyPlaza = hotelProfiles.find(hotel => hotel.slug === "shaza-regency-plaza-madinah")!;
    const diyarAlSalam = hotelProfiles.find(hotel => hotel.slug === "diyar-al-salam-madinah")!;
    const diyarAlSalamSilver = hotelProfiles.find(hotel => hotel.slug === "diyar-al-salam-silver-madinah")!;
    const cladiumHotel = hotelProfiles.find(hotel => hotel.slug === "cladium-hotel-madinah")!;
    const zahaTaiba = hotelProfiles.find(hotel => hotel.slug === "zaha-taiba-madinah")!;
    const afaqAlMasi = hotelProfiles.find(hotel => hotel.slug === "afaq-al-masi-madinah")!;
    const afaqAlSalamGolden = hotelProfiles.find(hotel => hotel.slug === "afaq-al-salam-golden-madinah")!;
    const diyarAlTaqwa = hotelProfiles.find(hotel => hotel.slug === "diyar-al-taqwa-madinah")!;
    const plazaInnOhud = hotelProfiles.find(hotel => hotel.slug === "plaza-inn-ohud-madinah")!;
    const aurionAlAqeeq = hotelProfiles.find(hotel => hotel.slug === "aurion-al-aqeeq-madinah")!;
    const ancyraRose = hotelProfiles.find(hotel => hotel.slug === "ancyra-rose-madinah")!;
    const tulipInnAlDaarRawafid = hotelProfiles.find(hotel => hotel.slug === "tulip-inn-al-daar-rawafid")!;
    const maienTaiba = hotelProfiles.find(hotel => hotel.slug === "maien-taiba")!;
    const venueAlHarithia = hotelProfiles.find(hotel => hotel.slug === "the-venue-al-harithia")!;
    const maysanAlTaqwa = hotelProfiles.find(hotel => hotel.slug === "maysan-al-taqwa")!;
    const ruveAlMadinah = hotelProfiles.find(hotel => hotel.slug === "ruve-al-madinah")!;
    const safwatAlMadinah = hotelProfiles.find(hotel => hotel.slug === "safwat-al-madinah")!;
    const artalAlMonawwarah = hotelProfiles.find(hotel => hotel.slug === "artal-al-monawwarah")!;
    const nuskAlHijrah = hotelProfiles.find(hotel => hotel.slug === "nusk-al-hijrah-madinah")!;
    const alSahaHotel = hotelProfiles.find(hotel => hotel.slug === "al-saha-hotel-madinah")!;
    const alWahaRawdah = hotelProfiles.find(hotel => hotel.slug === "al-waha-rawdah-madinah")!;
    const manazelAlAswaf = hotelProfiles.find(hotel => hotel.slug === "manazel-al-aswaf-madinah")!;
    const maysanRihabAlMisk = hotelProfiles.find(hotel => hotel.slug === "maysan-rihab-al-misk-madinah")!;
    const durrahAlEiman = hotelProfiles.find(hotel => hotel.slug === "durrah-al-eiman-madinah")!;
    const sarayaTaba = hotelProfiles.find(hotel => hotel.slug === "saraya-taba-hotel-a-madinah")!;
    const hayahPlaza = hotelProfiles.find(hotel => hotel.slug === "hayah-plaza-madinah")!;
    const qasrAlAndalusGolden = hotelProfiles.find(hotel => hotel.slug === "qasr-al-andalus-golden-madinah")!;
    const rotanaAlMisk = hotelProfiles.find(hotel => hotel.slug === "rotana-al-misk-madinah")!;
    const abrajAlDiyafah = hotelProfiles.find(hotel => hotel.slug === "abraj-al-diyafah-madinah")!;
    const alMokhtaraAlGharbi = hotelProfiles.find(hotel => hotel.slug === "al-mokhtara-al-gharbi-madinah")!;
    const manazeliAlMadinah = hotelProfiles.find(hotel => hotel.slug === "manazeli-al-madinah")!;
    const alSadaAlMasi = hotelProfiles.find(hotel => hotel.slug === "al-sada-al-masi-madinah")!;
    const nuskAlMadinah = hotelProfiles.find(hotel => hotel.slug === "nusk-al-madinah-hotel")!;
    const ramaAlMadinah = hotelProfiles.find(hotel => hotel.slug === "rama-al-madinah-hotel")!;
    const rabwatAlSafwaGolden = hotelProfiles.find(hotel => hotel.slug === "rabwat-al-safwa-golden-madinah")!;
    const miasAlMadinah = hotelProfiles.find(hotel => hotel.slug === "mias-al-madinah")!;
    const diyarAlMadinah = hotelProfiles.find(hotel => hotel.slug === "diyar-al-madinah-madinah")!;
    const hayahAlHuda = hotelProfiles.find(hotel => hotel.slug === "hayah-al-huda-madinah")!;
    const riyadhAlZahra = hotelProfiles.find(hotel => hotel.slug === "riyadh-al-zahra-madinah")!;
    const araekTaiba = hotelProfiles.find(hotel => hotel.slug === "araek-taiba-madinah")!;
    const zowarInternational = hotelProfiles.find(hotel => hotel.slug === "zowar-international-madinah")!;
    const odstAlMadinah = hotelProfiles.find(hotel => hotel.slug === "odst-al-madinah")!;
    const hayahGolden = hotelProfiles.find(hotel => hotel.slug === "hayah-golden-madinah")!;
    const bosphorusWaqfSafi = hotelProfiles.find(hotel => hotel.slug === "bosphorus-waqf-safi-madinah")!;
    const karamTaibahAlmasi = hotelProfiles.find(hotel => hotel.slug === "karam-taibah-almasi-madinah")!;
    const darAlNaeem = hotelProfiles.find(hotel => hotel.slug === "dar-al-naeem-madinah")!;
    const rawabiAlZahra = hotelProfiles.find(hotel => hotel.slug === "rawabi-al-zahra-madinah")!;
    const bosphorusAlSalam = hotelProfiles.find(hotel => hotel.slug === "bosphorus-hotel-al-salam")!;
    const arjwanRose = hotelProfiles.find(hotel => hotel.slug === "arjwan-rose-madinah")!;
    const wardatAlRayyan = hotelProfiles.find(hotel => hotel.slug === "wardat-al-rayyan-madinah")!;
    const alJaadMadinah = hotelProfiles.find(hotel => hotel.slug === "al-jaad-madinah")!;
    const diyarAlHuda = hotelProfiles.find(hotel => hotel.slug === "diyar-al-huda-madinah")!;
    const mirageAlSalam = hotelProfiles.find(hotel => hotel.slug === "mirage-al-salam-madinah")!;
    const alMokhtaraDiamond = hotelProfiles.find(hotel => hotel.slug === "al-mukhtara-diamond-madinah")!;
    const hayahSalamSilver = hotelProfiles.find(hotel => hotel.slug === "hayah-salam-silver-madinah")!;
    const manaratAlTaj = hotelProfiles.find(hotel => hotel.slug === "manarat-al-taj-madinah")!;
    const manarAlEiman = hotelProfiles.find(hotel => hotel.slug === "manar-al-eiman-madinah")!;
    const bosphorusHotelMedina = hotelProfiles.find(hotel => hotel.slug === "bosphorus-hotel-medina")!;
    const madenAlRawda = hotelProfiles.find(hotel => hotel.slug === "maden-al-rawda-madinah")!;
    const farajAlmadina = hotelProfiles.find(hotel => hotel.slug === "faraj-almadina-hotel")!;
    const jawharatAlRasheed = hotelProfiles.find(hotel => hotel.slug === "jawharat-al-rasheed-madinah")!;
    const emaarTaibah = hotelProfiles.find(hotel => hotel.slug === "emaar-taibah-madinah")!;
    const emaarMaktan = hotelProfiles.find(hotel => hotel.slug === "emaar-maktan-madinah")!;
    const jiwarAlMadina = hotelProfiles.find(hotel => hotel.slug === "jiwar-al-madina")!;
    const myskAlBalad = hotelProfiles.find(hotel => hotel.slug === "mysk-al-balad-madinah")!;
    const elafTaiba = hotelProfiles.find(hotel => hotel.slug === "elaf-taiba-madinah")!;
    const taibaFront = hotelProfiles.find(hotel => hotel.slug === "taiba-front-madinah")!;
    const swissTabaAlSalam = hotelProfiles.find(hotel => hotel.slug === "swiss-international-taba-al-salam")!;
    const elafAlTaqwa = hotelProfiles.find(hotel => hotel.slug === "elaf-al-taqwa-madinah")!;
    const manakhaRotana = hotelProfiles.find(hotel => hotel.slug === "al-manakha-rotana-madinah")!;
    const madenHotel = hotelProfiles.find(hotel => hotel.slug === "maden-hotel-madinah")!;
    const kayanInternational = hotelProfiles.find(hotel => hotel.slug === "kayan-international-hotel")!;
    const novotel = hotelProfiles.find(hotel => hotel.slug === "novotel-madinah")!;
    const sofitelShahd = hotelProfiles.find(hotel => hotel.slug === "sofitel-shahd-al-madinah")!;
    const emaarElite = hotelProfiles.find(hotel => hotel.slug === "emaar-elite-madinah")!;
    const darAlEimanAlHaram = hotelProfiles.find(hotel => hotel.slug === "al-haram-hotel")!;
    const alMunaKareem = hotelProfiles.find(hotel => hotel.slug === "al-muna-kareem-madinah")!;
    const grandPlaza = hotelProfiles.find(hotel => hotel.slug === "grand-plaza-al-madinah")!;
    const badrAlMaqam = hotelProfiles.find(hotel => hotel.slug === "grand-plaza-badr-al-maqam")!;
    const harmony = hotelProfiles.find(hotel => hotel.slug === "madinah-harmony")!;
    const fourPoints = hotelProfiles.find(hotel => hotel.slug === "four-points-by-sheraton-madinah")!;
    expect(darAlEimanAlHaram.gallery).toContain("/manus-storage/09_dar_al_eiman_al_haram__exterior__01_e8c8d659.webp");
    expect(darAlEimanAlHaram.gallery).toContain("/manus-storage/dar-al-eiman-al-haram-exterior_2404c84d.jpg");
    expect(alSahaHotel.gallery).toEqual(["/manus-storage/al-saha-hotel-exterior_b05f0eac.jpg", "/manus-storage/al-saha-hotel-room_8c873841.jpg", "/manus-storage/al-saha-hotel-lobby_a1385626.jpg"]);
    expect(darAlEimanGrand.gallery).toEqual(["/manus-storage/exterior-trip-medina_03d41764.jpg"]);
    expect(luluatAlDiyafa.gallery).toEqual(["/manus-storage/luluat-al-diyafa-madinah-exterior_f5768722.jpg", "/manus-storage/luluat-al-diyafa-madinah-room_a146bf76.jpg", "/manus-storage/luluat-al-diyafa-madinah-room-alt_5b84b4e8.jpg"]);
    expect(jiwarTaiba.gallery).toEqual(["/manus-storage/jiwar-taiba-madinah-exterior_9e2bbc5d.jpg", "/manus-storage/jiwar-taiba-madinah-room_ce340cf6.jpg", "/manus-storage/jiwar-taiba-madinah-lobby_310d83cd.jpg"]);
    expect(belvedereHotel.gallery).toEqual(["/manus-storage/belvedere-hotel-madinah-lobby_a664a0c2.jpg", "/manus-storage/belvedere-hotel-madinah-room_88df16de.jpg", "/manus-storage/belvedere-hotel-madinah-suite_130e06fb.jpg"]);
    expect(worthPeninsula.gallery).toEqual(["/manus-storage/worth-peninsula-madinah-exterior_82c6f72e.jpg", "/manus-storage/worth-peninsula-madinah-room_3a557abc.jpg", "/manus-storage/worth-peninsula-madinah-lobby_f5c4d204.jpg"]);
    expect(goldenMadinah.gallery).toEqual(["/manus-storage/golden-madinah-hotel-exterior_02f50b8b.jpg", "/manus-storage/golden-madinah-hotel-room_fea1fe0c.jpg", "/manus-storage/golden-madinah-hotel-lobby_fa1b088d.jpg"]);
    expect(abrajAlMarzam.gallery).toEqual(["/manus-storage/abraj-al-marzam-madinah-exterior_05a1f451.jpg", "/manus-storage/abraj-al-marzam-madinah-room_8950e35d.jpg", "/manus-storage/abraj-al-marzam-madinah-lobby_360389ea.jpg"]);
    expect(assaafa.gallery).toEqual(["/manus-storage/assaafa-hotel-madinah-exterior_abeae964.jpeg", "/manus-storage/assaafa-hotel-madinah-room_5c06d01c.jpg", "/manus-storage/assaafa-hotel-madinah-lobby_8bc45b80.jpg"]);
    expect(diyafaAlMukhtara.gallery).toEqual(["/manus-storage/diyafa-al-mukhtara-madinah-exterior_9d718612.webp", "/manus-storage/diyafa-al-mukhtara-madinah-room_dd553dda.jpg", "/manus-storage/diyafa-al-mukhtara-madinah-lobby_133f1471.jpg"]);
    expect(castleHotel.gallery).toEqual(["/manus-storage/castle-hotel-madinah-exterior_c8553e20.jpg", "/manus-storage/castle-hotel-madinah-room_dde8502e.jpg", "/manus-storage/castle-hotel-madinah-lobby_7225e888.jpg"]);
    expect(holidayVilla.gallery).toEqual(["/manus-storage/holiday-villa-madinah-exterior_5167df79.jpg", "/manus-storage/holiday-villa-madinah-lobby_b2a3a553.jpg", "/manus-storage/holiday-villa-madinah-room_2a0a6241.jpg"]);
    expect(waqtAlNazeel.gallery).toEqual(["/manus-storage/waqt-al-nazeel-madinah-lobby_86c96a14.jpg", "/manus-storage/waqt-al-nazeel-madinah-room_9931d75d.jpg", "/manus-storage/waqt-al-nazeel-madinah-room-alt_fe275acd.jpg"]);
    expect(avalHotel.gallery).toEqual(["/manus-storage/aval-hotel-madinah-exterior_275c7880.jpg", "/manus-storage/aval-hotel-madinah-lobby_5b89a276.jpg", "/manus-storage/aval-hotel-madinah-room_0160ed2b.jpg"]);
    expect(diyarWahatAlNazeel.gallery).toEqual(["/manus-storage/diyar-wahat-al-nazeel-exterior_98196255.jpg", "/manus-storage/diyar-wahat-al-nazeel-room_989fc269.jpg"]);
    expect(mohamadiaAlZahra.gallery).toEqual(["/manus-storage/mohamadia-al-zahra-exterior_970c819f.jpg", "/manus-storage/mohamadia-al-zahra-lobby_2e4510f5.jpg", "/manus-storage/mohamadia-al-zahra-room_0e2669c4.jpg"]);
    expect(anwarAlZahraa.gallery).toEqual(["/manus-storage/anwar-al-zahraa-lobby_6e37bb77.jpg", "/manus-storage/anwar-al-zahraa-exterior_68123fb1.jpg", "/manus-storage/anwar-al-zahraa-room_3d6bbab6.jpg"]);
    expect(alAnsarGoldenTulip.gallery).toEqual(["/manus-storage/al-ansar-golden-tulip-lobby_41130aab.jpg", "/manus-storage/al-ansar-golden-tulip-interior_ca7ce72a.jpg"]);
    expect(grandZowar.gallery).toEqual(["/manus-storage/grand-zowar-lobby_f2dc01a1.jpg", "/manus-storage/grand-zowar-room_d304ff93.jpg", "/manus-storage/grand-zowar-exterior_9aceaa73.jpg"]);
    expect(rabwatSafwaSeven.gallery).toEqual(["/manus-storage/rabwat-al-safwa-7-exterior-day_07bf3ebc.webp", "/manus-storage/rabwat-al-safwa-7-sign_6329e40b.jpg", "/manus-storage/rabwat-al-safwa-7-exterior-night_0adf9120.jpg"]);
    expect(shazaAlBaraka.gallery).toEqual(["/manus-storage/shaza-al-baraka-room_aefb2321.jpg", "/manus-storage/shaza-al-baraka-exterior_76a99251.jpg", "/manus-storage/shaza-al-baraka-lobby_e269f363.jpg"]);
    expect(zahaAlMunawara.gallery).toEqual(["/manus-storage/zaha-al-munawara-lobby_89d655d0.jpg", "/manus-storage/zaha-al-munawara-exterior_0cbf8d76.jpg", "/manus-storage/zaha-al-munawara-corridor_8445d402.jpg"]);
    expect(shazaRegencyPlaza.gallery).toEqual(["/manus-storage/shaza-regency-plaza-lobby_ff5b7f4e.jpg", "/manus-storage/shaza-regency-plaza-exterior_0d4b4931.jpg", "/manus-storage/shaza-regency-plaza-room_c7068f18.jpg"]);
    expect(diyarAlSalam.gallery).toEqual(["/manus-storage/diyar-al-salam-room_0cbeb420.jpg", "/manus-storage/diyar-al-salam-exterior_676dcfd8.jpg", "/manus-storage/diyar-al-salam-lobby_115e9dc1.jpg"]);
    expect(diyarAlSalamSilver.gallery).toEqual(["/manus-storage/diyar-al-salam-silver-lobby_de339a55.jpg", "/manus-storage/diyar-al-salam-silver-exterior_bc6c01f9.jpg", "/manus-storage/diyar-al-salam-silver-room_898699ff.jpg"]);
    expect(cladiumHotel.gallery).toEqual(["/manus-storage/cladium-room_6bfa7b5e.jpg", "/manus-storage/cladium-lobby_44603903.webp", "/manus-storage/cladium-exterior_d7128667.jpg"]);
    expect(zahaTaiba.gallery).toEqual(["/manus-storage/zaha-taiba-official-exterior_8d3e449a.jpg", "/manus-storage/zaha-taiba-official-lobby_296d28b3.jpg"]);
    expect(afaqAlMasi.gallery).toEqual(["/manus-storage/afaq-al-masi-lobby_c43ead7c.jpg", "/manus-storage/afaq-al-masi-exterior_a80e6afb.jpg", "/manus-storage/afaq-al-masi-reception_f9833a04.jpg"]);
    expect(afaqAlSalamGolden.gallery).toEqual(["/manus-storage/afaq-al-salam-golden-exterior-day_04830d57.jpg", "/manus-storage/afaq-al-salam-golden-exterior-night_7d3b1b1d.jpg", "/manus-storage/afaq-al-salam-golden-lobby_df8684f2.jpg"]);
    expect(diyarAlTaqwa.gallery).toEqual(["/manus-storage/diyar-al-taqwa-lobby_48740534.jpg", "/manus-storage/diyar-al-taqwa-exterior_6f207a66.jpg", "/manus-storage/diyar-al-taqwa-room_f9ee8974.jpg"]);
    expect(plazaInnOhud.gallery).toEqual(["/manus-storage/plaza-inn-ohud-dining_e08fde1e.jpg", "/manus-storage/plaza-inn-ohud-room_ce131503.jpg", "/manus-storage/plaza-inn-ohud-lobby_9ad4db66.jpg"]);
    expect(aurionAlAqeeq.gallery).toEqual(["/manus-storage/aurion-al-aqeeq-room_97c2a1da.jpg", "/manus-storage/aurion-al-aqeeq-suite_f3ffc623.jpg", "/manus-storage/aurion-al-aqeeq-bedroom_0f73b8f7.jpg"]);
    expect(ancyraRose.gallery).toEqual(["/manus-storage/ancyra-rose-official-exterior_98eaac35.jpg", "/manus-storage/ancyra-rose-official-family-room_649947a8.jpg"]);
    expect(tulipInnAlDaarRawafid.gallery).toEqual(["/manus-storage/tulip-inn-al-daar-rawafid-room_9fca4742.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-lobby_41fe7e17.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-guest-room_9e3545a2.jpg"]);
    expect(maienTaiba.gallery).toEqual(["/manus-storage/maien-taiba-reception_eed933d9.jpg", "/manus-storage/maien-taiba-twin-room_c66df46c.jpg", "/manus-storage/maien-taiba-quint-room_3c03df4e.jpg"]);
    expect(venueAlHarithia.gallery).toEqual(["/manus-storage/the-venue-al-harithia-lobby_f5ec87b0.jpeg", "/manus-storage/the-venue-al-harithia-hallway_3f737e05.jpeg", "/manus-storage/the-venue-al-harithia-lounge_419ca182.jpeg"]);
    expect(maysanAlTaqwa.gallery).toEqual(["/manus-storage/maysan-al-taqwa-exterior_19e967ed.jpg", "/manus-storage/maysan-al-taqwa-room_2b429b08.jpg"]);
    expect(ruveAlMadinah.gallery).toEqual(["/manus-storage/ruve-al-madinah-official-1_b30d8745.jpg", "/manus-storage/ruve-al-madinah-official-2_0a80d468.jpg", "/manus-storage/ruve-al-madinah-official-3_921f4c92.jpg"]);
    expect(safwatAlMadinah.gallery).toEqual(["/manus-storage/safwat-al-madinah-exterior_795c7ebc.jpg", "/manus-storage/safwat-al-madinah-room_2c877aa0.jpg", "/manus-storage/safwat-al-madinah-lobby_c1bfd1d4.jpg"]);
    expect(artalAlMonawwarah.gallery).toEqual(["/manus-storage/artal-al-monawwarah-lobby_f554974b.jpg", "/manus-storage/artal-al-monawwarah-exterior_0d52259c.jpg"]);
    expect(nuskAlHijrah.gallery).toEqual(["/manus-storage/nusk-al-hijrah-lobby_bb7ebc30.jpg", "/manus-storage/nusk-al-hijrah-room_a740dbd6.jpg", "/manus-storage/nusk-al-hijrah-entrance_fc96e013.jpg"]);
    expect(alWahaRawdah.gallery).toEqual(["/manus-storage/al-waha-rawdah-lobby_a793a776.jpg", "/manus-storage/al-waha-rawdah-room_4b2a5070.jpg", "/manus-storage/al-waha-rawdah-reception_b5821b96.jpg"]);
    expect(manazelAlAswaf.gallery).toEqual(["/manus-storage/manazel-al-aswaf-exterior_6d002802.jpg", "/manus-storage/manazel-al-aswaf-room_c5aaefa5.jpg", "/manus-storage/manazel-al-aswaf-lobby_f62c7798.jpg"]);
    expect(maysanRihabAlMisk.gallery).toEqual(["/manus-storage/maysan-rihab-al-misk-room_e30b875c.jpg", "/manus-storage/maysan-rihab-al-misk-exterior_f110b3b6.jpg", "/manus-storage/maysan-rihab-al-misk-lobby_dd315d03.jpg"]);
    expect(durrahAlEiman.gallery).toEqual(["/manus-storage/durrah-al-eiman-exterior_95196c97.jpg", "/manus-storage/durrah-al-eiman-lobby_372f2b5c.jpg", "/manus-storage/durrah-al-eiman-room_6a93e299.jpg"]);
    expect(sarayaTaba.gallery).toEqual(["/manus-storage/saraya-taba-room_a679b92b.jpg", "/manus-storage/saraya-taba-lobby_c6206689.jpg", "/manus-storage/saraya-taba-guest-room_e41880bf.jpg"]);
    expect(hayahPlaza.gallery).toEqual(["/manus-storage/hayah-plaza-room_c528be45.jpg", "/manus-storage/hayah-plaza-lobby_1e18b400.jpg", "/manus-storage/hayah-plaza-reception_2f0b284a.jpg"]);
    expect(qasrAlAndalusGolden.gallery).toEqual(["/manus-storage/qasr-al-andalus-golden-room_4ac41372.jpg", "/manus-storage/qasr-al-andalus-golden-lobby_d9c1e9e3.jpg", "/manus-storage/qasr-al-andalus-golden-exterior_ecaeca4c.jpg"]);
    expect(rotanaAlMisk.gallery).toEqual(["/manus-storage/rotana-al-misk-exterior_42958503.jpg", "/manus-storage/rotana-al-misk-room_612d2ebf.jpg", "/manus-storage/rotana-al-misk-lobby_6e5147f5.jpg"]);
    expect(abrajAlDiyafah.gallery).toEqual(["/manus-storage/abraj-al-diyafah-lobby_fdebf33e.jpg", "/manus-storage/abraj-al-diyafah-room_ab9d4634.jpg", "/manus-storage/abraj-al-diyafah-reception_1be81ab2.jpg"]);
    expect(alMokhtaraAlGharbi.gallery).toEqual(["/manus-storage/al-mokhtara-al-gharbi-exterior_548cbc0c.jpg", "/manus-storage/al-mokhtara-al-gharbi-room_15cdc474.jpg", "/manus-storage/al-mokhtara-al-gharbi-lobby_bbb534d1.jpg"]);
    expect(manazeliAlMadinah.gallery).toEqual(["/manus-storage/manazeli-al-madinah-room_9022665b.jpg", "/manus-storage/manazeli-al-madinah-reception_1fd9afc7.jpg", "/manus-storage/manazeli-al-madinah-suite_71987019.jpg"]);
    expect(alSadaAlMasi.gallery).toEqual(["/manus-storage/al-sada-al-masi-exterior_64764373.jpg", "/manus-storage/al-sada-al-masi-room_0a886411.jpg", "/manus-storage/al-sada-al-masi-lobby_bf1d13f3.jpg"]);
    expect(nuskAlMadinah.gallery).toEqual(["/manus-storage/nusk-al-madinah-room_863b9541.jpg", "/manus-storage/nusk-al-madinah-lobby_5adb1aef.jpg", "/manus-storage/nusk-al-madinah-guest-room_76652261.webp"]);
    expect(ramaAlMadinah.gallery).toEqual(["/manus-storage/rama-al-madinah-exterior_92924b1b.jpg", "/manus-storage/rama-al-madinah-room_21b59319.jpg", "/manus-storage/rama-al-madinah-lobby_5f74f7ea.jpg"]);
    expect(rabwatAlSafwaGolden.gallery).toEqual(["/manus-storage/rabwat-al-safwa-golden-exterior_9196b612.jpg", "/manus-storage/rabwat-al-safwa-golden-room_f9ccd1f6.jpg", "/manus-storage/rabwat-al-safwa-golden-lobby_781fe428.jpg"]);
    expect(miasAlMadinah.gallery).toEqual(["/manus-storage/mias-al-madinah-room-view_f37b4e5f.webp", "/manus-storage/mias-al-madinah-lobby_8fac0110.jpg", "/manus-storage/mias-al-madinah-reception_08ae7c13.jpg"]);
    expect(diyarAlMadinah.gallery).toEqual(["/manus-storage/diyar-al-madinah-exterior_9a935f2e.jpg", "/manus-storage/diyar-al-madinah-room_a9653c1c.jpg", "/manus-storage/diyar-al-madinah-lobby_263d6033.jpg"]);
    expect(hayahAlHuda.gallery).toEqual(["/manus-storage/hayah-al-huda-exterior_ebaddbd1.jpg", "/manus-storage/hayah-al-huda-lobby_6868152b.jpg", "/manus-storage/hayah-al-huda-room_70ce791b.jpg"]);
    expect(riyadhAlZahra.gallery).toEqual(["/manus-storage/riyadh-al-zahra-exterior_a867aed1.jpg", "/manus-storage/riyadh-al-zahra-room_9d4c6433.jpg", "/manus-storage/riyadh-al-zahra-lobby_7169a975.jpg"]);
    expect(araekTaiba.gallery).toEqual(["/manus-storage/araek-taiba-exterior_a6df6c5d.jpg", "/manus-storage/araek-taiba-room_95e2f420.jpg", "/manus-storage/araek-taiba-lobby_7ccd6852.jpg"]);
    expect(zowarInternational.gallery).toEqual(["/manus-storage/zowar-international-exterior_79416168.jpg", "/manus-storage/zowar-international-room_948c2da7.jpg", "/manus-storage/zowar-international-lobby_bf154821.jpg"]);
    expect(odstAlMadinah.gallery).toEqual(["/manus-storage/odst-al-madinah-lobby_01eb9d86.jpg", "/manus-storage/odst-al-madinah-room_0518fcf4.jpg", "/manus-storage/odst-al-madinah-reception_e5707ab6.jpg"]);
    expect(hayahGolden.gallery).toEqual(["/manus-storage/hayah-golden-exterior_30d3097a.jpg", "/manus-storage/hayah-golden-room_6d9d51e4.webp", "/manus-storage/hayah-golden-lobby_791a5d22.jpg"]);
    expect(bosphorusWaqfSafi.gallery).toEqual(["/manus-storage/bosphorus-waqf-safi-room_68fb17b3.jpg", "/manus-storage/bosphorus-waqf-safi-lobby_118aef4f.jpg", "/manus-storage/bosphorus-waqf-safi-guest-room_1c801637.jpg"]);
    expect(karamTaibahAlmasi.gallery).toEqual(["/manus-storage/karam-taibah-almasi-exterior_7923ee17.jpg", "/manus-storage/karam-taibah-almasi-room_97562dec.jpg", "/manus-storage/karam-taibah-almasi-lobby_cf986a55.jpg"]);
    expect(darAlNaeem.gallery).toEqual(["/manus-storage/dar-al-naeem-exterior_b9f8751f.jpg", "/manus-storage/dar-al-naeem-room_885a96b0.jpg", "/manus-storage/dar-al-naeem-lobby_7f648d79.jpg"]);
    expect(rawabiAlZahra.gallery).toEqual(["/manus-storage/rawabi-al-zahra-lobby_fdc12dd5.jpg", "/manus-storage/rawabi-al-zahra-room_883d2751.jpg", "/manus-storage/rawabi-al-zahra-reception_d2a810b8.jpg"]);
    expect(bosphorusAlSalam.gallery).toEqual(["/manus-storage/bosphorus-al-salam-room_ece8d1fa.jpg", "/manus-storage/bosphorus-al-salam-lobby_835fb25f.jpg", "/manus-storage/bosphorus-al-salam-guest-room_d2b752a8.jpg"]);
    expect(arjwanRose.gallery).toEqual(["/manus-storage/arjwan-rose-exterior_1780db6d.jpg", "/manus-storage/arjwan-rose-room_63ec7629.jpg", "/manus-storage/arjwan-rose-lobby_a5dcc208.jpg"]);
    expect(wardatAlRayyan.gallery).toEqual(["/manus-storage/wardat-al-rayyan-exterior_73aa13d1.jpg", "/manus-storage/wardat-al-rayyan-room_bf920395.jpg", "/manus-storage/wardat-al-rayyan-family-room_56dcf20c.jpg"]);
    expect(alJaadMadinah.gallery).toEqual(["/manus-storage/al-jaad-madinah-exterior_e639324a.jpg", "/manus-storage/al-jaad-madinah-room_3a202d8e.jpg", "/manus-storage/al-jaad-madinah-lobby_e42a923d.jpg"]);
    expect(diyarAlHuda.gallery).toEqual(["/manus-storage/diyar-al-huda-exterior_1219522b.jpg", "/manus-storage/diyar-al-huda-room_d863e883.jpg", "/manus-storage/diyar-al-huda-lobby_129b280e.jpg"]);
    expect(mirageAlSalam.gallery).toEqual(["/manus-storage/mirage-al-salam-exterior_d7907a3e.jpg", "/manus-storage/mirage-al-salam-room_b8176cc3.jpg", "/manus-storage/mirage-al-salam-lobby_03895a4a.jpg"]);
    expect(alMokhtaraDiamond.gallery).toEqual(["/manus-storage/al-mokhtara-diamond-exterior_755c5352.jpg", "/manus-storage/al-mokhtara-diamond-room_ad7cbe7d.jpg", "/manus-storage/al-mokhtara-diamond-lobby_eae74b23.jpg"]);
    expect(hayahSalamSilver.gallery).toEqual(["/manus-storage/hayah-salam-silver-exterior_dd9a41a4.jpg", "/manus-storage/hayah-salam-silver-room_bb94460c.jpg", "/manus-storage/hayah-salam-silver-reception_6727546c.jpg"]);
    expect(manaratAlTaj.gallery).toEqual(["/manus-storage/manarat-al-taj-lobby_2c6f6b02.jpg", "/manus-storage/manarat-al-taj-room_5539362d.jpg"]);
    expect(manarAlEiman.gallery).toEqual(["/manus-storage/manar-al-eiman-exterior_2abe022a.jpg", "/manus-storage/manar-al-eiman-room_762f0201.jpg", "/manus-storage/manar-al-eiman-reception_3c8fcd4d.jpg"]);
    expect(bosphorusHotelMedina.gallery).toEqual(["/manus-storage/bosphorus-hotel-medina-exterior_e26196b8.jpg", "/manus-storage/bosphorus-hotel-medina-room_567b84cf.jpg", "/manus-storage/bosphorus-hotel-medina-lobby_81ea5be4.jpg"]);
    expect(madenAlRawda.gallery).toEqual(["/manus-storage/maden-al-rawda-exterior_c586f683.jpg", "/manus-storage/maden-al-rawda-room_208f94ca.jpg", "/manus-storage/maden-al-rawda-lobby_c760748b.jpg"]);
    expect(farajAlmadina.gallery).toEqual(["/manus-storage/faraj-almadina-room_7a0c1cfd.jpg", "/manus-storage/faraj-almadina-reception_7d99bd75.jpg", "/manus-storage/faraj-almadina-public-space_1345d74f.jpg"]);
    expect(jawharatAlRasheed.gallery).toEqual(["/manus-storage/jawharat-al-rasheed-room_34f22827.jpg", "/manus-storage/jawharat-al-rasheed-reception_9bf622aa.webp", "/manus-storage/jawharat-al-rasheed-lobby_07b04114.webp"]);
    expect(emaarTaibah.gallery).toEqual(["/manus-storage/emaar-taibah-exterior_78f231be.jpg", "/manus-storage/emaar-taibah-room_ba21390c.jpg", "/manus-storage/emaar-taibah-lobby_ec02733b.jpg"]);
    expect(emaarMaktan.gallery).toEqual(["/manus-storage/emaar-maktan-exterior_d35561f3.jpg", "/manus-storage/emaar-maktan-room_8ca68d7f.jpg", "/manus-storage/emaar-maktan-lobby_bc65f6b5.jpg"]);
    expect(jiwarAlMadina.gallery).toEqual(["/manus-storage/jiwar-al-madina-exterior_7523dcfc.jpg", "/manus-storage/jiwar-al-madina-room_33da0c94.jpg", "/manus-storage/jiwar-al-madina-lobby_72bdeb66.jpg"]);
    expect(myskAlBalad.gallery).toEqual(["/manus-storage/mysk-al-balad-exterior_863ce27f.jpg", "/manus-storage/mysk-al-balad-room_2289e1e4.jpg", "/manus-storage/mysk-al-balad-lobby_a5d8d726.jpg"]);
    expect(elafTaiba.gallery).toEqual(["/manus-storage/elaf-taiba-lobby_c986b5f3.jpg", "/manus-storage/elaf-taiba-reception_cc5dce9c.jpg", "/manus-storage/elaf-taiba-room_873488b0.jpg"]);
    expect(taibaFront.gallery).toEqual(["/manus-storage/taiba-front-exterior_6c74a068.jpg", "/manus-storage/taiba-front-lobby_090a4373.jpg", "/manus-storage/taiba-front-room_afe547c2.jpg"]);
    expect(swissTabaAlSalam.gallery).toEqual(["/manus-storage/swiss-taba-al-salam-exterior_01a3803f.jpg", "/manus-storage/swiss-taba-al-salam-reception_2c2b7136.jpg", "/manus-storage/swiss-taba-al-salam-room_5756efbb.jpg"]);
    expect(elafAlTaqwa.gallery).toEqual(["/manus-storage/elaf-al-taqwa-exterior_4c92e46b.jpg", "/manus-storage/elaf-al-taqwa-room_f75acbe8.jpg", "/manus-storage/elaf-al-taqwa-facade_c97b6e12.webp"]);
    expect(manakhaRotana.gallery).toEqual(["/manus-storage/al-manakha-rotana-exterior_f54f77cc.jpg", "/manus-storage/al-manakha-rotana-lobby_2d5a3042.jpg", "/manus-storage/al-manakha-rotana-room_3c0e81b2.jpg"]);
    expect(madenHotel.gallery).toEqual(["/manus-storage/maden-hotel-exterior_24163449.jpg", "/manus-storage/maden-hotel-lobby_6a050a38.jpg", "/manus-storage/maden-hotel-room_3ff43321.jpg"]);
    expect(kayanInternational.gallery).toEqual(["/manus-storage/kayan-international-lobby_793e81fa.png", "/manus-storage/kayan-international-room_9dcd4d06.jpg", "/manus-storage/kayan-international-exterior_b735c7b0.jpg"]);
    expect(novotel.gallery).toEqual(["/manus-storage/novotel-madinah-room_5c83530d.jpg", "/manus-storage/novotel-madinah-exterior_557edb7c.jpg", "/manus-storage/novotel-madinah-lobby_f621b6cb.jpg"]);
    expect(sofitelShahd.gallery).toEqual(["/manus-storage/sofitel-shahd-exterior_e36b9568.jpg", "/manus-storage/sofitel-shahd-room_ead5cfae.jpg", "/manus-storage/sofitel-shahd-skyline_a1cf3910.jpg"]);
    expect(emaarElite.gallery).toEqual(["/manus-storage/emaar-elite-exterior_9c6c7fd5.jpg", "/manus-storage/emaar-elite-room_11ff2236.jpg", "/manus-storage/emaar-elite-lobby_3dc9f58e.jpg"]);
    expect(emaarElite.content.en.amenities).toEqual([]);
    expect(emaarElite.nearestGate).toBeUndefined();
    expect(alMunaKareem.gallery).toEqual(["/manus-storage/al-muna-kareem-exterior_51c249c5.jpg", "/manus-storage/al-muna-kareem-room_7c81c76f.jpg", "/manus-storage/al-muna-kareem-facade_8aabbab0.jpg"]);
    expect(grandPlaza.gallery).toEqual(["/manus-storage/grand-plaza-exterior_7c73b3b2.jpg", "/manus-storage/grand-plaza-room_12204036.jpg", "/manus-storage/grand-plaza-lobby_2e1878cb.jpg"]);
    expect(badrAlMaqam.gallery).toEqual(["/manus-storage/grand-plaza-badr-exterior_90ae9db2.jpg", "/manus-storage/grand-plaza-badr-room_e8a07366.jpg", "/manus-storage/grand-plaza-badr-lounge_19add0f5.jpg"]);
    expect(harmony.gallery).toEqual(["/manus-storage/23_madinah_harmony__exterior__01_e40dd3fe.webp", "/manus-storage/23_madinah_harmony__room__01_2d2025c0.webp"]);
    expect(fourPoints.gallery).toEqual([]);
  });
});
