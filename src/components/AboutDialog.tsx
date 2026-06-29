import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const APP_VERSION = "1.0.0";

const CHANGELOG = [
  {
    version: "1.0.0",
    date: "June 29, 2026",
    title: "About Page & SEO",
    changes: [
      "About Dialog — view app version, creator info, and changelog from the profile menu or landing page",
      "Meta Description — added for search engine indexing",
      "Open Graph & Twitter Cards — rich social sharing previews",
      "robots.txt & sitemap.xml — proper crawl directives for search engines",
      "SPA Rewrites — all routes now return 200 instead of 404",
      "Cache & Security Headers — immutable assets, X-Frame-Options, CSP basics",
      "Improved image alt text across all pages",
    ],
  },
  {
    version: "0.9.0",
    date: "June 28, 2026",
    title: "Daily Habits, Analytics & Offline",
    changes: [
      "Daily Habits Tracker — new section for tracking daily habits on an auto-calculated grid",
      "Recharts Analytics — area chart plotting the exact time habits are completed each day",
      "Offline Support — Firestore persistent local cache for reading without internet",
      "Build Optimization — code-split Firebase, Recharts, Lucide & React into separate chunks",
    ],
  },
  {
    version: "0.8.0",
    date: "June 18, 2026",
    title: "State Persistence & Bug Fixes",
    changes: [
      "Last Page Persistence — app remembers whether you were on Notes, Todos, or Daily",
      "Last Viewed Folder — remembers which folder was open in the notes list",
      "Last Upload Folder — remembers which folder was used when creating a note",
      "Textarea Overflow Fix — long notes now scroll inside the form instead of overflowing",
    ],
  },
  {
    version: "0.1.0",
    date: "June 2026",
    title: "Initial Release",
    changes: [
      "Notes — create, edit, and organize notes into folders",
      "Todos — monthly calendar grid with day-view modals and completion tracking",
      "Google Sign-In — secure authentication with Firebase Auth",
      "PWA Support — installable on phones and desktops with offline manifest",
      "Dark & Light Themes — system-aware with manual toggle",
      "Responsive Design — mobile-first layout with desktop enhancements",
    ],
  },
];

/**
 * AboutDialog — Shared component showing creator info, app version, and changelog.
 *
 * Uncontrolled (with trigger):
 *   <AboutDialog trigger={<button>About</button>} />
 *
 * Controlled (from a DropdownMenu, etc.):
 *   <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
 */
export function AboutDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as React.JSX.Element} />}
      <DialogContent className="sm:max-w-md rounded-2xl bg-canvas border-none shadow-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="font-display text-xl font-bold text-ink">
            About Velinya
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-6 min-h-0">
          {/* App identity */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0">
              <img
                src="/app-icon.jpg"
                alt="Velinya app icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink leading-tight">
                Velinya
              </h3>
              <p className="text-sm text-body mt-0.5">
                Your notes & todos, beautifully organized.
              </p>
              <span className="inline-block mt-1.5 text-xs font-semibold text-wise-green bg-wise-green/15 px-2.5 py-0.5 rounded-full">
                v{APP_VERSION}
              </span>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-border/40" />

          {/* Creator */}
          <section>
            <h4 className="text-xs font-semibold text-mute uppercase tracking-wider mb-2">
              Created by
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0">
                <img
                  src="https://github.com/aditya-gupta-dev.png"
                  alt="Aditya Gupta"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Aditya Gupta</p>
                <p className="text-xs text-mute">Designer & Developer</p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <hr className="border-border/40" />

          {/* Changelog — scrollable */}
          <section>
            <h4 className="text-xs font-semibold text-mute uppercase tracking-wider mb-3">
              Changelog
            </h4>
            <div className="max-h-52 overflow-y-auto space-y-5 pr-1 overscroll-contain">
              {CHANGELOG.map((release, idx) => (
                <div key={release.version}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-ink">
                      v{release.version} — {release.title}
                    </span>
                    <span className="text-xs text-mute shrink-0 ml-2">
                      {release.date}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-wise-green shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                  {idx < CHANGELOG.length - 1 && (
                    <hr className="border-border/30 mt-4" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Footer note */}
          <p className="text-xs text-mute text-center pt-2">
            Made with care in India 🇮🇳
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
