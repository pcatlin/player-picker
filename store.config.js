/**
 * EAS Metadata store configuration (Apple App Store).
 *
 * Used by:
 *   eas metadata:push
 *   eas submit (via metadataPath in eas.json)
 *
 * Google Play listings are not supported by EAS Metadata — configure those in Play Console.
 *
 * Required (set in local `.env`, not committed — see `.env.example`):
 *   STORE_REVIEW_EMAIL
 *   STORE_REVIEW_PHONE
 *
 * Optional environment overrides:
 *   STORE_SUPPORT_URL
 *   STORE_PRIVACY_POLICY_URL
 *   STORE_MARKETING_URL
 *   STORE_REVIEW_FIRST_NAME
 *   STORE_REVIEW_LAST_NAME
 *   STORE_COPYRIGHT_HOLDER
 *   STORE_RELEASE_NOTES
 */

const fs = require("fs");
const path = require("path");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(path.join(__dirname, ".env"));

const requireEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${key}. Add it to your local .env file (see .env.example).`,
    );
  }
  return value;
};

const appConfig = require("./app.json").expo;

const SUPPORT_URL =
  process.env.STORE_SUPPORT_URL ?? "https://github.com/pcatlin/player-picker/issues";
const PRIVACY_POLICY_URL =
  process.env.STORE_PRIVACY_POLICY_URL ??
  "https://www.ecatlin.com/privacy-notice/player-picker";
const MARKETING_URL =
  process.env.STORE_MARKETING_URL ?? "https://github.com/pcatlin/player-picker";

const REVIEW_CONTACT = {
  firstName: process.env.STORE_REVIEW_FIRST_NAME ?? "Paul",
  lastName: process.env.STORE_REVIEW_LAST_NAME ?? "Catlin",
  email: requireEnv("STORE_REVIEW_EMAIL"),
  phone: requireEnv("STORE_REVIEW_PHONE"),
};

const COPYRIGHT_HOLDER = process.env.STORE_COPYRIGHT_HOLDER ?? "Paul Catlin";

const RELEASE_NOTES =
  process.env.STORE_RELEASE_NOTES ??
  "Initial TestFlight release. Multi-touch player picker with optional unlock for up to 8 players.";

const sharedListing = {
  title: "Player Picker",
  subtitle: "Pick a player in seconds",
  promoText: "Everyone holds a finger — the app picks who goes first.",
  description: [
    "Player Picker helps board-game groups choose who goes first — no arguments, no extra bits of paper.",
    "",
    "How it works:",
    "• Everyone places one finger on the screen",
    "• Hold steady for 5 seconds",
    "• The app randomly selects one player with a playful reveal animation",
    "",
    "Features:",
    "• Multi-touch tracking with a coloured circle per finger",
    "• Configurable player colours in Settings",
    "• Optional haptic feedback",
    "• Unlock support for up to 8 players (in-app purchase)",
    "",
    "Best experienced on a physical phone or tablet — multi-touch is not available in the simulator.",
    "",
    "No account required. Settings are stored on your device.",
  ].join("\n"),
  keywords: [
    "board game",
    "player picker",
    "random",
    "who goes first",
    "party game",
    "multi touch",
    "finger chooser",
    "turn order",
  ],
  marketingUrl: MARKETING_URL,
  supportUrl: SUPPORT_URL,
  privacyPolicyUrl: PRIVACY_POLICY_URL,
  releaseNotes: RELEASE_NOTES,
};

const listingEnGb = {
  ...sharedListing,
  subtitle: "Pick a player in seconds",
  promoText: "Everyone holds a finger — the app picks who goes first.",
  description: [
    "Player Picker helps board-game groups choose who goes first — no arguments, no extra bits of paper.",
    "",
    "How it works:",
    "• Everyone places one finger on the screen",
    "• Hold steady for 5 seconds",
    "• The app randomly selects one player with a playful reveal animation",
    "",
    "Features:",
    "• Multi-touch tracking with a coloured circle per finger",
    "• Configurable player colours in Settings",
    "• Optional haptic feedback",
    "• Unlock support for up to 8 players (in-app purchase)",
    "",
    "Best experienced on a physical phone or tablet — multi-touch is not available in the simulator.",
    "",
    "No account required. Settings are stored on your device.",
  ].join("\n"),
};

const listingDeDe = {
  ...sharedListing,
  title: "Spieler-Auswahl",
  subtitle: "Spieler in Sekunden wählen",
  promoText: "Alle halten einen Finger — die App wählt, wer anfängt.",
  description: [
    "Spieler-Auswahl hilft Brettspielgruppen dabei, den ersten Spieler zu bestimmen — ohne Streit und ohne Zettel.",
    "",
    "So funktioniert es:",
    "• Jede Person legt einen Finger auf den Bildschirm",
    "• 5 Sekunden lang ruhig halten",
    "• Die App wählt zufällig einen Spieler mit einer spielerischen Animation",
    "",
    "Funktionen:",
    "• Multi-Touch mit farbigem Kreis pro Finger",
    "• Anpassbare Spielerfarben in den Einstellungen",
    "• Optionales haptisches Feedback",
    "• Freischaltung für bis zu 8 Spieler (In-App-Kauf)",
    "",
    "Am besten auf einem echten Gerät — Multi-Touch funktioniert im Simulator nicht zuverlässig.",
    "",
    "Kein Konto erforderlich. Einstellungen werden auf dem Gerät gespeichert.",
  ].join("\n"),
  keywords: [
    "brettspiel",
    "spieler auswahl",
    "zufall",
    "wer beginnt",
    "partyspiel",
    "multi touch",
    "finger wählen",
    "reihenfolge",
  ],
  releaseNotes:
    process.env.STORE_RELEASE_NOTES_DE ??
    "Erstes TestFlight-Release. Multi-Touch-Spielerauswahl mit optionaler Freischaltung für bis zu 8 Spieler.",
};

module.exports = {
  configVersion: 0,
  apple: {
    version: appConfig.version,
    copyright: `${new Date().getFullYear()} ${COPYRIGHT_HOLDER}`,
    categories: [["GAMES", "GAMES_CASUAL"], "ENTERTAINMENT"],
    advisory: {
      alcoholTobaccoOrDrugUseOrReferences: "NONE",
      contests: "NONE",
      gambling: false,
      gamblingSimulated: "NONE",
      horrorOrFearThemes: "NONE",
      matureOrSuggestiveThemes: "NONE",
      medicalOrTreatmentInformation: "NONE",
      profanityOrCrudeHumor: "NONE",
      sexualContentGraphicAndNudity: "NONE",
      sexualContentOrNudity: "NONE",
      unrestrictedWebAccess: false,
      violenceCartoonOrFantasy: "NONE",
      violenceRealistic: "NONE",
      violenceRealisticProlongedGraphicOrSadistic: "NONE",
      kidsAgeBand: null,
      ageRatingOverride: "NONE",
      koreaAgeRatingOverride: "NONE",
    },
    info: {
      "en-US": sharedListing,
      "en-GB": listingEnGb,
      "de-DE": listingDeDe,
    },
    release: {
      automaticRelease: false,
      phasedRelease: false,
    },
    review: {
      ...REVIEW_CONTACT,
      demoRequired: false,
      notes: [
        "Player Picker is a local multiplayer utility — no login is required.",
        "",
        "To test:",
        "1. Open the app on a physical iPhone or iPad (multi-touch requires a real device).",
        "2. Place at least two fingers on the main screen and hold for 5 seconds.",
        "3. A winner is revealed with a full-screen colour animation.",
        "",
        "In-app purchase (optional):",
        "• Free tier supports up to 3 simultaneous touches.",
        "• \"Unlock more players\" enables up to 8 touches.",
        "• Use a Sandbox Apple ID to test purchase and Restore purchases in Settings.",
        "",
        "The app does not collect analytics. Settings (colours, haptics, unlock state) are stored locally.",
        "RevenueCat is used only for purchase validation.",
      ].join("\n"),
    },
  },
};
