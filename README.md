# "Two Sweet!" — Interactive 2nd Birthday Invitation

A mobile-first digital invitation that opens like a gift. Plain HTML, CSS and JavaScript:
no build step, no frameworks, no dependencies (fonts come from Google Fonts).

## Quick start

1. Open `js/config.js` and fill in the child's name, date, venue, contact and links.
2. Replace the photos in `assets/images/` (see below).
3. Open `index.html` in a browser to preview, then upload the whole folder to any static host.

> Everything a guest sees is controlled from **`js/config.js`**. You should not need to edit `index.html`.

## Folder layout

```
index.html              page structure (gift box, invitation, RSVP dialog)
css/base.css            colours, fonts, buttons, dialogs, form styles
css/intro.css           gift box + the opening animation
css/invitation.css      invitation layout, portrait frame, countdown, gallery
js/config.js            ★ YOUR DETAILS LIVE HERE
js/particles.js         floating sparkles + the burst when the gift opens
js/music.js             music toggle (music box lullaby, or your own mp3)
js/intro.js             opening timeline + replay
js/invitation.js        countdown, scroll animations, gallery, calendar, RSVP
assets/images/          placeholder portrait + 4 gallery photos
```

## Customising

| What | Where |
|---|---|
| Name, venue, address, message, host names | `js/config.js` |
| Date / time / countdown | `eventDate` (format `2026-12-12T15:00:00+08:00`; `+08:00` = Philippines). Date and time on the card are generated from it, or override with `dateDisplay` / `timeDisplay` |
| Google Maps button | `mapsUrl`: Google Maps → Share → Copy link |
| RSVP deadline, contact name & number | `rsvpDeadline`, `contactName`, `contactNumber`; add `contactPhoneLink` (e.g. `+639171234567`) to show tap-to-call and text buttons |
| Colours | CSS variables at the top of `css/base.css` |

**Photos.** Save the real portrait as `assets/images/child-portrait.jpg` (portrait orientation, about 800×1000, under ~300 KB) and set `photo: "assets/images/child-portrait.jpg"`. Do the same for the gallery list. Delete the `gallery` entries to hide that section. If an image path is wrong, the placeholder shows instead of a broken icon.

**Music.** By default a soft music-box lullaby is synthesised in the browser (no file needed). To use your own song, put an mp3 in `assets/audio/` and set `musicSrc: "assets/audio/lullaby.mp3"`. Music never plays until the guest taps the gift, and the ♪ button mutes it. (Use music you have the rights to use.)

## Saving RSVPs permanently

The RSVP form is fully working on the front end: it validates, shows a thank-you, and keeps a copy in the guest's own browser (`localStorage`). **That copy is not visible to you.** Until you connect a place to send responses, nothing reaches the host. A static web page cannot store data by itself, so you need a small backend. Options, easiest first:

### Option A — Google Sheets (free, ~5 minutes)
1. Create a Google Sheet. Add headers in row 1: `submittedAt, name, attending, guests, message`.
2. In the sheet: **Extensions → Apps Script**, replace the code with:
   ```js
   function doPost(e) {
     var d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSheet().appendRow(
       [d.submittedAt, d.name, d.attending, d.guests, d.message]);
     return ContentService.createTextOutput("ok");
   }
   ```
3. **Deploy → New deployment → Web app**. Execute as: *Me*. Who has access: *Anyone*. Copy the Web app URL.
4. In `js/config.js` set `rsvpEndpoint` to that URL and keep `rsvpNoCors: true`.

Every RSVP now appears as a new row. You can also add email notifications from the Sheet.

### Option B — Form service (Formspree, Getform, Basin…)
Create a form, copy its endpoint URL into `rsvpEndpoint`, and set `rsvpNoCors: false`. The service emails you each response and keeps a dashboard.

### Option C — Your own backend / database
Provide an HTTPS endpoint that accepts `POST` with JSON `{ name, attending, guests, message, submittedAt, child }`, validates it, and stores it (Firebase/Firestore, Supabase, or a Node/PHP API with a database). Enable CORS for your invitation's domain and set `rsvpNoCors: false`. For public invitations, add rate limiting or a CAPTCHA (the form already includes a hidden spam-trap field).

**Privacy note:** RSVPs contain guests' names, so keep the Sheet/dashboard private and don't expose it publicly.

## Hosting (so you can share one link)

Upload the folder to any static host. Free options: Netlify Drop (drag and drop the folder), GitHub Pages, Cloudflare Pages. Then share the link by Messenger/Viber/WhatsApp. Features that rely on HTTPS (such as the calendar download on some phones) work best on a hosted link rather than a local file.

## Notes

- The countdown uses the guest's clock against `eventDate`; after the date it shows "The celebration has begun!".
- Animations respect the phone's "reduce motion" setting (the gift opens quickly with no motion effects).
- Tested in Chromium at phone (390 px) and desktop (1280 px) widths: gift opening, countdown, RSVP validation and submit, decline flow, gallery viewer, calendar file, music toggle and replay. Please also do a quick check on your own phone (especially Safari on iPhone) before sharing.
