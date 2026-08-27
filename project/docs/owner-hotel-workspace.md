# Owner Hotel Content Workspace

The protected workspace is available to an authenticated Al Ghanem Travel administrator at **`/admin/hotels`**. It is designed for ongoing content operations after launch without editing application code.

| Owner action | How the workspace handles it |
|---|---|
| Add a hotel | Save a new, unique slug as a private draft, then upload corporate pre-authorized media and add verified content. |
| Update an existing hotel | اختر السجل من القائمة ثم اضغط **Edit** لتحميل بياناته في النموذج، وعدّلها واحفظها من دون إنشاء نسخة مكررة. |
| Update Google Maps details | Update the Maps URL, coordinates if available, location-review date, and route evidence. |
| Add a named walking route | Enter the practical gate name, its Maps address, and a route-review date. The system rejects incomplete named-gate data. |
| Upload or replace images | Select the saved hotel record, choose a WebP, JPEG, or PNG file, then select **Upload Image**. Assets are stored in managed storage and only approved media is used publicly. |
| Publish a record | Select **Published — public directory** only after the record has official or partner-verified evidence plus a reviewed Google Maps place URL and location-review date. |
| Remove a record from public view | غيّر حالة النشر إلى **Draft — private** أو **Verified — private** ثم احفظ السجل. |
| Delete a record permanently | استخدم **Remove** من قائمة السجلات، ثم أكد الاسم المختصر الصحيح. تُحذف الترجمات والصور والملاحظات والغرف والمرافق التابعة من قاعدة البيانات؛ لا يمكن التراجع عن ذلك من الواجهة. |

> Public publication is deliberately controlled. The workspace prevents planning-only records and records without a reviewed Google Maps point from being published. A named Haram-gate route remains unavailable until its gate address and route-review date are recorded.

The public portfolio and hotel-detail route read only records with the **published** state. Private drafts and verified-but-private records remain inaccessible to public visitors. The public display falls back to English where another translation has not yet been added; complete six-language copy should be added before broad international promotion.

Images are uploaded as WebP, JPEG, or PNG to managed storage rather than `client/public`. The protected internal workspace records the organisation's corporate pre-authorisation policy automatically, so the operator does not enter a licence reference for each file. This is required so images continue to work after a deployment and do not bloat the project bundle. Removing a hotel only removes database references to its managed files; it does not try to delete the underlying storage object.
