/* ==========================================================================
   INVITATION SETTINGS  —  edit everything about the invitation HERE.
   You never need to touch index.html to change names, dates or links.
   ========================================================================== */
window.INVITE_CONFIG = {

  /* ---- The celebrant ---------------------------------------------------- */
  childName: "CALLIE",

  /* ---- Date & time -------------------------------------------------------
     eventDate drives the countdown AND the date/time shown on the card.
     Use the format  YYYY-MM-DDTHH:MM:SS+08:00  (the +08:00 is the Philippines).
     SAMPLE DATE BELOW — replace it with the real party date.                */
  eventDate: "2026-11-13T17:00:00+08:00",
  timeZone: "Asia/Manila",
  durationHours: 3,          // used for the "Add to calendar" file
  dateDisplay: "",           // leave "" to auto-format from eventDate, or type your own, e.g. "Saturday, December 12, 2026"
  timeDisplay: "",           // leave "" to auto-format, or type your own, e.g. "3:00 PM onwards"

  /* ---- Venue ------------------------------------------------------------ */
  venue: "Pahuway Mountain View Resort",
  address: "Sampaguita St, 2200 Olongapo City, Philippines, Olongapo, Philippines, 2200",
  // Paste your Google Maps share link here (Maps > Share > Copy link).
  mapsUrl: "https://www.google.com/maps/place/Pahuway+Mountain+Resorts/@14.850762,120.3326408,17.25z/data=!4m6!3m5!1s0x339671307e7a8c01:0xc9d493e0f1474fe8!8m2!3d14.8507917!4d120.332744!16s%2Fg%2F11pzkkgtlf?entry=ttu&g_ep=EgoyMDI2MTEwNC4wIKXMDSoASAFQAw%3D%3D",

  /* ---- Words ------------------------------------------------------------ */
  message: "One year of giggles, love, and countless precious memories! Our little one is turning ONE, and we'd be delighted to have you join us as we celebrate this special milestone. Let's make this day filled with laughter, joy, and unforgettable memories!",
  hostNames: "Cecille & Carlo",

  /* ---- RSVP ------------------------------------------------------------- */
  rsvpDeadline: "[RSVP DEADLINE]",
  contactName: "Cecille Gallego",
  contactNumber: "+6393-8860-2502",       // shown on the card
  contactPhoneLink: "+639388602502",                    // digits for tap-to-call / SMS, e.g. "+639171234567" (leave "" to hide those buttons)
  maxGuests: 10,
  // Where RSVPs are sent. Leave "" to only keep them on the guest's own device
  // (see README.md > "Saving RSVPs permanently" for a free Google Sheets setup).
  rsvpEndpoint: "",
  rsvpNoCors: true,                        // true for Google Apps Script; false for services like Formspree

  /* ---- Photos ----------------------------------------------------------- */
  // Main portrait. Replace the file in assets/images/ (or change this path).
  photo: "assets/images/portrait.png",
  // Extra photos for the gallery. Remove all entries to hide the gallery.
  gallery: [
    { src: "assets/images/sub-photo-1.jpg", alt: "Celebrant photo 1" },
    { src: "assets/images/sub-photo-2.jpg", alt: "Celebrant photo 2" },
    { src: "assets/images/sub-photo-3.jpg", alt: "Celebrant photo 3" },
    { src: "assets/images/sub-photo-4.jpg", alt: "Celebrant photo 4" }
  ],

  /* ---- Music ------------------------------------------------------------
     musicSrc: path to your own mp3 (e.g. "assets/audio/lullaby.mp3").
     Leave "" to use the built-in soft music-box melody (no file needed).
     Music NEVER plays before the guest taps; musicStartsOnOpen starts it
     right after they tap the gift (they can mute it with the ♪ button).     */
  musicSrc: "",
  musicStartsOnOpen: true
};
