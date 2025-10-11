import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Basic translation resources. You can split these into JSON files later if desired.
const resources = {
  en: {
    translation: {
      app: {
        title: "JWT Decoder",
        description: "Decode and verify JWT tokens easily.",
      },
      a11y: {
        skip_to_main: "Skip to main content",
        main_region: "Main content",
      },
      jwtdesc: {
        alg: "Signature or encryption algorithm",
        typ: "Type of the token (usually 'JWT')",
        kid: "Key ID used to sign the token",
        iss: "Issuer (who created and signed this token)",
        sub: "Subject (whom the token refers to)",
        aud: "Audience (who or what the token is intended for)",
        exp: "Expiration time (seconds since epoch)",
        nbf: "Not valid before (seconds since epoch)",
        iat: "Issued at (seconds since Unix epoch)",
        jti: "JWT ID (unique identifier for this token)",
      },
      common: {
        copy: "Copy",
        copied: "Copied to clipboard!",
        error: "Error",
        optional: "Optional",
        valid: "✅ Valid",
        expired: "❌ Expired",
      },
      jwt: {
        token: "JWT Token",
        enter_here: "Enter JWT token here...",
        token_info: "Token Info",
        issued_at: "Issued at:",
        status: "Status:",
        expires_at: "Expires at:",
        decoded_header: "Decoded Header",
        header_copied: "Header copied to clipboard!",
        decoded_payload: "Decoded Payload",
        payload_copied: "Payload copied to clipboard!",
        signature_verification: "JWT Signature Verification",
        signature_copied: "Signature copied to clipboard!",
        timezone: "Time zone:",
        local_time: "Local time:",
        iso: "ISO:",
      },
    },
  },
  de: {
    translation: {
      app: {
        title: "JWT Decoder",
        description: "JWT-Tokens einfach dekodieren und prüfen.",
      },
      a11y: {
        skip_to_main: "Zum Hauptinhalt springen",
        main_region: "Hauptinhalt",
      },
      jwtdesc: {
        alg: "Signatur- oder Verschlüsselungsalgorithmus",
        typ: "Typ des Tokens (meist 'JWT')",
        kid: "Schlüssel-ID, mit der das Token signiert wurde",
        iss: "Aussteller (wer dieses Token erstellt und signiert hat)",
        sub: "Subjekt (auf wen oder was sich das Token bezieht)",
        aud: "Zielgruppe (für wen oder was das Token bestimmt ist)",
        exp: "Ablaufzeit (Sekunden seit der Unix-Epoche)",
        nbf: "Nicht gültig vor (Sekunden seit der Unix-Epoche)",
        iat: "Ausgestellt am (Sekunden seit der Unix-Epoche)",
        jti: "JWT-ID (eindeutige Kennung für dieses Token)",
      },
      common: {
        copy: "Kopieren",
        copied: "In die Zwischenablage kopiert!",
        error: "Fehler",
        optional: "Optional",
        valid: "✅ Gültig",
        expired: "❌ Abgelaufen",
      },
      jwt: {
        token: "JWT-Token",
        enter_here: "JWT-Token hier eingeben...",
        token_info: "Token-Informationen",
        issued_at: "Ausgestellt am:",
        status: "Status:",
        expires_at: "Läuft ab am:",
        decoded_header: "Dekodierter Header",
        header_copied: "Header in die Zwischenablage kopiert!",
        decoded_payload: "Dekodierte Payload",
        payload_copied: "Payload in die Zwischenablage kopiert!",
        signature_verification: "JWT-Signaturprüfung",
        signature_copied: "Signatur in die Zwischenablage kopiert!",
        timezone: "Zeitzone:",
        local_time: "Ortszeit:",
        iso: "ISO:",
      },
    },
  },
} as const;

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    detection: {
      // Default order detects from querystring, cookie, localStorage, navigator, htmlTag, path, subdomain
      order: ["querystring", "localStorage", "cookie", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
