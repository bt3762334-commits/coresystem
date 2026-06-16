import { useState } from "react";

const QUOTES = [
  { text: "﴿وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾",          source: "سورة الطلاق · 3"  },
  { text: "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",                              source: "سورة الشرح · 6"   },
  { text: "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",                              source: "سورة طه · 114"    },
  { text: "المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف",             source: "صحيح مسلم"        },
  { text: "خير الناس أنفعهم للناس",                                        source: "حديث شريف"        },
  { text: "الوقت كالسيف إن لم تقطعه قطعك",                               source: "مثل عربي"         },
  { text: "ابدأ بما تستطيع، بما عندك، من حيث أنت",                        source: "آرثر آشي"         },
  { text: "النجاح هو مجموع جهود صغيرة تتكرر يوماً بعد يوم",              source: "روبرت كوليير"      },
  { text: "لا تؤجل عمل اليوم إلى الغد",                                   source: "حكمة"             },
  { text: "﴿فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾",               source: "سورة آل عمران · 159" },
];

function getTodayQuote() {
  const idx = new Date().getDate() % QUOTES.length;
  return QUOTES[idx];
}

export default function DailyQuote({ compact }) {
  const [visible, setVisible] = useState(false);
  const quote = getTodayQuote();

  if (compact) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setVisible((v) => !v)}
          style={{
            padding: "5px 12px", borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.25)",
            background: "rgba(255, 255, 255, 0.15)",
            color: "#fff", fontSize: 12,
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          ✨ <span>آية اليوم</span>
        </button>
        {visible && (
          <>
            <div onClick={() => setVisible(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", left: "50%",
              transform: "translateX(-50%)", width: 290,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: 18,
              boxShadow: "var(--shadow-xl)", zIndex: 100,
            }}>
              <div style={{
                position: "absolute", top: -6, left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 12, height: 12,
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                borderInlineStart: "1px solid var(--border)",
              }} />
              <p style={{
                fontSize: 15, lineHeight: 1.9, margin: "0 0 10px",
                fontWeight: 500, textAlign: "center", color: "var(--text)",
              }}>{quote.text}</p>
              <p style={{ fontSize: 11, color: "var(--text-2)", textAlign: "center", margin: 0 }}>
                — {quote.source}
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--purple-lt) 0%, var(--green-lt) 100%)",
      border: "1px solid rgba(108,99,255,.15)",
      borderRadius: "var(--radius)",
      padding: "14px 18px", textAlign: "center",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: "var(--purple)",
        marginBottom: 8, letterSpacing: ".06em", textTransform: "uppercase",
      }}>✨ آية / اقتباس اليوم</div>
      <p style={{ fontSize: 15, lineHeight: 1.85, margin: "0 0 6px", fontWeight: 500 }}>{quote.text}</p>
      <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>— {quote.source}</p>
    </div>
  );
}
