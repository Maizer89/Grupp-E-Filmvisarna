import { useState } from "react";

const STORAGE_KEY = "filmvisarna-cookie-consent-v1";

// Hämtar användarens tidigare val från localStorage.
function getSavedConsent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "accepted" || saved === "rejected") {
      return saved;
    }
  } catch (error) {
    console.error("Kunde inte läsa cookieinställningar:", error);
  }

  return null;
}

export default function CookieBanner() {
  const [consent, setConsent] = useState(getSavedConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Visa bannern om användaren inte valt ännu
  // eller själv öppnat cookieinställningarna.
  const showBanner = consent === null || settingsOpen;

  function saveConsent(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch (error) {
      console.error("Kunde inte spara cookieinställningar:", error);
    }

    setConsent(choice);
    setSettingsOpen(false);
  }

  return (
    <>
      {/* Cookie-banner */}
      {showBanner && (
        <section
          role="region"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-description"
          className="
            fixed bottom-4 left-4 right-4 z-[100]
            mx-auto max-w-3xl
            rounded-xl border border-[#C8A96B]/50
            bg-[#202026] p-5
            text-[#EEE7D6]
            shadow-2xl
            sm:p-6
          "
        >
          <div className="space-y-4">
            <div>
              <h2
                id="cookie-title"
                className="mb-2 text-xl font-bold text-[#FF8A3D]"
              >
                Vi använder cookies
              </h2>

              <p
                id="cookie-description"
                className="text-sm leading-relaxed text-[#EEE7D6]/90"
              >
                Filmvisarna använder nödvändiga cookies för att
                funktioner som inloggning ska fungera.
                Dessa kräver normalt inte ditt samtycke.
              </p>
            </div>

            <div className="rounded-lg bg-[#070706]/60 p-4">
              <h3 className="mb-1 font-semibold">
                Statistikcookies
              </h3>

              <p className="text-sm leading-relaxed text-[#EEE7D6]/80">
                Vi använder ännu inte statistikcookies, men
                planerar att införa statistikfunktioner i framtiden.
                Du kan redan nu ange om du vill tillåta
                statistikcookies. Ingen statistikspårning
                aktiveras av detta val i nuläget.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => saveConsent("accepted")}
                className="
                  flex-1 rounded-lg bg-[#FF8A3D]
                  px-5 py-3 font-semibold text-[#070706]
                  transition-colors hover:bg-[#FFA366]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                Tillåt statistikcookies
              </button>

              <button
                type="button"
                onClick={() => saveConsent("rejected")}
                className="
                  flex-1 rounded-lg
                  border border-[#C8A96B]
                  px-5 py-3 font-semibold
                  transition-colors hover:bg-[#303036]
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                Neka statistikcookies
              </button>
            </div>

            <p className="text-xs text-[#EEE7D6]/60">
              Du kan ändra ditt val när som helst
              via Cookieinställningar.
            </p>
          </div>
        </section>
      )}

      {/* Knapp för att ändra tidigare val */}
      {consent !== null && !showBanner && (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="
            fixed bottom-4 left-4 z-[90]
            rounded-lg border border-[#C8A96B]/50
            bg-[#202026] px-4 py-2
            text-xs text-[#EEE7D6]
            shadow-lg transition-colors
            hover:bg-[#303036]
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-[#FF8A3D]
          "
        >
          Cookieinställningar
        </button>
      )}
    </>
  );
}