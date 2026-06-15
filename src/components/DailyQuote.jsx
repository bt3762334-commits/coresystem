import { useState, useEffect } from "react";

const AYAHS = [
  { text: "﴿وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾",                      source: "سورة الطلاق · آية 3"       },
  { text: "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾",                                          source: "سورة الشرح · آية 6"        },
  { text: "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾",                                          source: "سورة طه · آية 114"         },
  { text: "﴿فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ﴾",                           source: "سورة آل عمران · آية 159"   },
  { text: "﴿وَاللَّهُ يُحِبُّ الصَّابِرِينَ﴾",                                       source: "سورة آل عمران · آية 146"   },
  { text: "﴿وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ﴾",                        source: "سورة النجم · آية 39"       },
  { text: "﴿إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ﴾", source: "سورة الرعد · آية 11" },
  { text: "﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾",                                    source: "سورة هود · آية 88"          },
  { text: "﴿رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً﴾",  source: "سورة البقرة · آية 201"     },
  { text: "﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾",                          source: "سورة المائدة · آية 2"      },
  { text: "﴿قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ﴾", source: "سورة الزمر · آية 9"   },
  { text: "﴿وَبَشِّرِ الصَّابِرِينَ﴾",                                               source: "سورة البقرة · آية 155"     },
];

const HADITHS = [
  { text: "المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كل خير.",          source: "صحيح مسلم"                  },
  { text: "خير الناس أنفعهم للناس.",                                                  source: "رواه الطبراني"              },
  { text: "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه.",                              source: "رواه البيهقي"               },
  { text: "طلب العلم فريضة على كل مسلم.",                                             source: "رواه ابن ماجه"              },
  { text: "من سلك طريقاً يلتمس فيه علماً، سهّل الله له طريقاً إلى الجنة.",         source: "رواه مسلم"                  },
  { text: "الدنيا مزرعة الآخرة.",                                                     source: "الحكمة النبوية"             },
  { text: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.",                             source: "متفق عليه"                  },
  { text: "إن الله جميل يحب الجمال.",                                                 source: "رواه مسلم"                  },
  { text: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت.",                   source: "متفق عليه"                  },
  { text: "بادروا بالأعمال فتناً كقطع الليل المظلم.",                                source: "رواه مسلم"                  },
  { text: "أحب الأعمال إلى الله أدومها وإن قل.",                                    source: "متفق عليه"                  },
  { text: "اليد العليا خير من اليد السفلى.",                                          source: "متفق عليه"                  },
];

function getDayIndex(arr) {
  const start = new Date("2024-01-01");
  const now   = new Date();
  const diff  = Math.floor((now - start) / 86_400_000);
  return diff % arr.length;
}

export default function DailyQuote({ compact }) {
  const [visible, setVisible] = useState(false);
  const ayah   = AYAHS[getDayIndex(AYAHS)];
  const hadith = HADITHS[getDayIndex(HADITHS)];

  if (compact) {
    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setVisible((v) => !v)}
          style={{
            padding: "5px 13px", borderRadius: 20,
            border: "1.5px solid rgba(255,255,255,.4)",
            background: "rgba(255,255,255,.15)",
            color: "#fff", fontSize: 12,
            display: "flex", alignItems: "center", gap: 6,
            backdropFilter: "blur(4px)",
            fontWeight: 600,
          }}
        >
          ✨ <span>آية اليوم</span>
        </button>
        {visible && (
          <div className="fade-in-down" style={{
            position: "absolute", top: "calc(100% + 10px)", left: "50%",
            transform: "translateX(-50%)",
            width: 310,
            background: "rgba(17,15,38,.95)",
            border: "1px solid rgba(124,110,255,.4)",
            borderRadius: 16, padding: 18,
            boxShadow: "0 16px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(124,110,255,.15)",
            zIndex: 200,
            backdropFilter: "blur(20px)",
          }}>
            {/* Ayah */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#A89BFF", marginBottom: 6, letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14 }}>📖</span> آية اليوم
              </div>
              <p style={{ fontSize: 15, lineHeight: 2, fontWeight: 600, color: "#EAE8FF", textAlign: "center", margin: "0 0 4px" }}>{ayah.text}</p>
              <p style={{ fontSize: 11, color: "#7C6EFF", textAlign: "center", margin: 0 }}>— {ayah.source}</p>
            </div>
            <div style={{ height: 1, background: "rgba(124,110,255,.2)", margin: "12px 0" }} />
            {/* Hadith */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10D98A", marginBottom: 6, letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 14 }}>🌿</span> حديث اليوم
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: "#C4E8D8", textAlign: "center", margin: "0 0 4px" }}>{hadith.text}</p>
              <p style={{ fontSize: 11, color: "#10D98A", textAlign: "center", margin: 0 }}>— {hadith.source}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card (used in pages)
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
      {/* Ayah card */}
      <div className="divine-card" style={{ padding: "20px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#A89BFF", marginBottom: 10, letterSpacing: ".07em" }}>📖 آية اليوم</div>
        <p style={{ fontSize: 16, lineHeight: 2.1, fontWeight: 600, color: "#EAE8FF", margin: "0 0 8px" }}>{ayah.text}</p>
        <p style={{ fontSize: 12, color: "#7C6EFF", margin: 0 }}>— {ayah.source}</p>
      </div>
      {/* Hadith card */}
      <div className="divine-card" style={{ padding: "20px 22px", textAlign: "center", borderColor: "rgba(16,217,138,.25)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#10D98A", marginBottom: 10, letterSpacing: ".07em" }}>🌿 حديث اليوم</div>
        <p style={{ fontSize: 14, lineHeight: 1.9, color: "#C4E8D8", margin: "0 0 8px" }}>{hadith.text}</p>
        <p style={{ fontSize: 12, color: "#10D98A", margin: 0 }}>— {hadith.source}</p>
      </div>
    </div>
  );
}
