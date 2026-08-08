export default function Footer({
    showCta = true,
   }: {
    showCta?: boolean;
   }) {
    return (
      <footer className="bg-[#183126] text-[#F3E9DD]">
        <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-12">
   
          {/* CTA */}
          {showCta && (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-serif sm:text-4xl lg:text-5xl">
                  Ready to simplify your routine?
                </h2>
   
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#F3E9DD]/85 sm:text-base">
                  Build your personalized supplement routine and let VidaPouch take
                  care of the rest.
                </p>
   
                <a
                  href="/v2"
                  className="mt-7 inline-flex items-center justify-center border border-[#F3E9DD] bg-[#F3E9DD] px-7 py-3 text-sm font-medium tracking-[0.16em] text-[#183126] transition hover:bg-transparent hover:text-[#F3E9DD]">
   
                  BUILD MY VIDAPOUCH →
                </a>
              </div>
   
              <div className="my-10 border-t border-[#F3E9DD]/25" />
            </>
          )}
   
          {/* FOOTER LINKS */}
          <div className="grid gap-10 text-center md:grid-cols-[1fr_1fr_1fr_1fr_1fr] md:text-left">
   
            {/* LOGO */}
            <div className="flex items-center justify-center md:justify-start">
              <img
                src="/vidapouch_logo_white.png"
                alt="VidaPouch"
                className="h-auto w-[180px] object-contain"
              />
            </div>
   
            {/* EXPLORE */}
            <div className="md:col-start-2 md:translate-x-36">
              <h3 className="text-xs tracking-[0.22em] text-[#F3E9DD]/70">
                EXPLORE
              </h3>
   
              <div className="mt-4 space-y-3 text-sm">
                <a className="block hover:opacity-70" href="/product">
                  Product
                </a>
   
                <a className="block hover:opacity-70" href="/how-it-works">
                  How It Works
                </a>
   
                <a className="block hover:opacity-70" href="/why-vidapouch">
                  Why VidaPouch
                </a>
   
                <a className="block hover:opacity-70" href="/faq">
                  FAQ
                </a>
              </div>
            </div>
   
            {/* COMPANY */}
            <div className="md:text-center">
              <h3 className="text-xs tracking-[0.22em] text-[#F3E9DD]/70">
                COMPANY
              </h3>
   
              <div className="mt-4 space-y-3 text-sm">
                <a className="block hover:opacity-70" href="/contact">
                  Contact
                </a>
   
                <a className="block hover:opacity-70" href="/privacy">
                  Privacy
                </a>
   
                <a className="block hover:opacity-70" href="/terms">
                  Terms
                </a>
              </div>
            </div>
   
            {/* CONCIERGE */}
            <div>
              <h3 className="text-xs tracking-[0.22em] text-[#F3E9DD]/70">
                CONCIERGE
              </h3>
   
              <div className="mt-4 space-y-3 text-sm">
   
                {/* EMAIL */}
                <a
                  className="flex items-center justify-center gap-3 hover:opacity-70 md:justify-start"
                  href="mailto:concierge@vidapouch.com">
   
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true">
   
                    <rect x="3" y="5" width="18" height="14" rx="1" />
                    <path d="m3 7 9 7 9-7" />
                  </svg>
   
                  <span>concierge@vidapouch.com</span>
                </a>
   
                {/* PHONE */}
                <a
                  className="flex items-center justify-center gap-3 hover:opacity-70 md:justify-start"
                  href="tel:+15082438404">
   
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true">
   
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                  </svg>
   
                  <span>(508) 243-8404</span>
                </a>
   
                {/* INSTAGRAM */}
                <a
                  className="flex items-center justify-center gap-3 hover:opacity-70 md:justify-start"
                  href="https://instagram.com/vidapouch"
                  target="_blank"
                  rel="noreferrer">
   
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[18px] w-[18px] shrink-0"
                    aria-hidden="true">
   
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="0.75"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
   
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>
   
          {/* COPYRIGHT */}
          <div className="mt-10 border-t border-[#F3E9DD]/25 pt-6 text-center text-xs text-[#F3E9DD]/65">
            © 2026 VidaPouch. All rights reserved.
          </div>
        </div>
      </footer>
    );
   }
   