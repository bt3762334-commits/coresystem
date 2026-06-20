export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <span className="app-footer-glow" />
          <div>
            <div className="app-footer-title">Designed &amp; Developed By</div>
            <div className="app-footer-name">
              Basem Taha <span className="app-footer-dot">·</span> <span className="gradient-text">Dark Byte</span>
            </div>
          </div>
        </div>

        <a href="tel:01091291823" className="app-footer-phone">
          <span className="app-footer-phone-icon">📞</span>
          <span dir="ltr">01091291823</span>
        </a>
      </div>

      <style>{`
        .app-footer {
          position: relative;
          z-index: 1;
          margin-top: 2rem;
          padding: 1.75rem 1.25rem calc(1.75rem + env(safe-area-inset-bottom, 0px));
          background: linear-gradient(180deg, transparent, rgba(17,15,38,.6) 30%, rgba(13,11,30,.92));
          border-top: 1px solid var(--border);
        }
        .app-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .app-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .app-footer-glow {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 12px var(--green), 0 0 24px var(--green);
          flex-shrink: 0;
        }
        .app-footer-title {
          font-size: 11px;
          letter-spacing: .04em;
          color: var(--text-3);
          margin-bottom: 2px;
        }
        .app-footer-name {
          font-size: 15px;
          font-weight: 800;
          color: var(--text);
        }
        .app-footer-dot { color: var(--text-3); }
        .app-footer-phone {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 18px;
          border-radius: 999px;
          background: var(--surface-2);
          border: 1px solid var(--border-2);
          color: var(--text);
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          transition: transform .15s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
        }
        .app-footer-phone:hover {
          background: linear-gradient(135deg, var(--purple), var(--green));
          border-color: transparent;
          color: #08071a;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .app-footer-phone-icon { font-size: 15px; }

        @media (max-width: 720px) {
          .app-footer { padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)); }
        }
        @media (max-width: 480px) {
          .app-footer { text-align: center; padding: 1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px)); }
          .app-footer-inner { flex-direction: column; justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
