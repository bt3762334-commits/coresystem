export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-top">
        <div className="app-footer-fade" />
      </div>

      <div className="app-footer-inner">
        <div className="signature">
          <div className="signature-mark" aria-hidden="true">
            <span className="signature-ring" />
            <span className="signature-glyph">DB</span>
          </div>

          <div className="signature-text">
            <div className="signature-kicker">Designed &amp; Developed By</div>
            <div className="signature-name">Basem Taha</div>
            <div className="signature-studio">
              <span className="studio-line" />
              <span className="studio-label gradient-text">Dark Byte</span>
              <span className="studio-line" />
            </div>
          </div>
        </div>

        <a href="tel:01091291823" className="contact-pill">
          <span className="contact-pill-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="contact-pill-text" dir="ltr">01091291823</span>
        </a>
      </div>

      <div className="app-footer-base">
        <span>© {new Date().getFullYear()} Core System</span>
        <span className="base-dot">•</span>
        <span>Crafted with care by Dark Byte</span>
      </div>

      <style>{`
        .app-footer {
          position: relative;
          z-index: 1;
          margin-top: 2.5rem;
        }
        .app-footer-top { position: relative; height: 1px; }
        .app-footer-fade {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent);
        }

        .app-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.25rem 1.5rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .signature {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .signature-mark {
          position: relative;
          width: 52px; height: 52px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .signature-ring {
          position: absolute; inset: 0;
          border-radius: 16px;
          background: linear-gradient(150deg, var(--purple), var(--green));
          opacity: .9;
          transition: transform .35s var(--ease), box-shadow .35s var(--ease);
        }
        .signature-glyph {
          position: relative;
          font-family: var(--font-ui);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: .02em;
          color: #fff;
        }
        .signature:hover .signature-ring {
          transform: rotate(8deg) scale(1.06);
          box-shadow: 0 8px 24px rgba(94,106,210,.4);
        }

        .signature-kicker {
          font-family: var(--font-ui);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 3px;
        }
        .signature-name {
          font-family: var(--font-ui);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text);
          margin-bottom: 4px;
        }
        .signature-studio {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .studio-line {
          width: 16px; height: 1px;
          background: linear-gradient(90deg, var(--purple), var(--green));
          opacity: .6;
        }
        .studio-label {
          font-family: var(--font-ui);
          font-size: 12.5px;
          font-weight: 700;
          letter-spacing: .03em;
        }

        .contact-pill {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 20px;
          border-radius: 999px;
          background: var(--surface-2);
          border: 1px solid var(--border-2);
          color: var(--text);
          font-family: var(--font-ui);
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: transform .2s var(--ease), box-shadow .25s var(--ease), border-color .2s var(--ease), background .25s var(--ease), color .2s var(--ease);
        }
        .contact-pill-icon { display: flex; color: var(--purple-dk); transition: color .2s var(--ease); }
        .contact-pill:hover {
          background: linear-gradient(135deg, var(--purple), var(--green));
          border-color: transparent;
          color: #0A0C12;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(94,106,210,.32);
        }
        .contact-pill:hover .contact-pill-icon { color: #0A0C12; }

        .app-footer-base {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem 1.75rem;
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-ui);
          font-size: 11.5px;
          color: var(--text-3);
        }
        .base-dot { opacity: .5; }

        @media (max-width: 640px) {
          .app-footer-inner { flex-direction: column; align-items: flex-start; gap: 20px; padding: 2rem 1.25rem 1.25rem; }
          .app-footer-base { justify-content: center; padding: 0 1.25rem 1.5rem; flex-wrap: wrap; }
        }

        @media (max-width: 720px) {
          .app-footer-base { padding-bottom: calc(1.5rem + 70px + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>
    </footer>
  );
}
