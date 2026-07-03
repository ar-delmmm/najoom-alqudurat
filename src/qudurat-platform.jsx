import { useState, useEffect, useRef } from "react";

// ─── الألوان والهوية ───
const C = {
  bg: "#F7FBFF",
  ink: "#27374D",
  sub: "#7C8DA6",
  card: "#FFFFFF",
  brand: "#38A8E8",
  brandSoft: "#E7F5FE",
  accent: "#FBBF24",
  green: "#34C77B",
  greenSoft: "#EDFAF3",
  red: "#F87171",
  redSoft: "#FEF1F1",
  line: "#E8F0F9",
};

const FONT = { fontFamily: "'Segoe UI', Tahoma, 'Noto Kufi Arabic', sans-serif" };

// ─── استخراج معرف فيديو يوتيوب من أي رابط ───
function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

// ─── بنك الأسئلة التجريبي ───
const initialQuestions = [
  {
    id: 1,
    section: "كمي",
    text: "إذا كان س + ٥ = ١٢، فما قيمة ٣س؟",
    options: ["١٥", "٢١", "٢٤", "٣٦"],
    correct: 1,
    explanation: "س = ١٢ − ٥ = ٧، إذن ٣س = ٣ × ٧ = ٢١.",
    video: "",
  },
  {
    id: 2,
    section: "كمي",
    text: "ما النسبة المئوية التي يمثلها العدد ١٨ من العدد ٧٢؟",
    options: ["٢٠٪", "٢٥٪", "٣٠٪", "٣٥٪"],
    correct: 1,
    explanation: "١٨ ÷ ٧٢ = ٠٫٢٥ أي ٢٥٪.",
    video: "",
  },
  {
    id: 3,
    section: "كمي",
    text: "متوازي مستطيلات طوله ٤ وعرضه ٣ وارتفاعه ٢، ما حجمه؟",
    options: ["٩", "١٢", "٢٤", "٢٦"],
    correct: 2,
    explanation: "الحجم = الطول × العرض × الارتفاع = ٤ × ٣ × ٢ = ٢٤.",
    video: "",
  },
  {
    id: 4,
    section: "لفظي",
    text: "التناظر اللفظي: قلم : كتابة",
    options: ["سيارة : طريق", "مقص : قصّ", "كتاب : مكتبة", "باب : بيت"],
    correct: 1,
    explanation: "العلاقة أداة ووظيفتها؛ القلم أداة الكتابة كما أن المقص أداة القصّ.",
    video: "",
  },
  {
    id: 5,
    section: "لفظي",
    text: "أكمل الجملة: كلما ازداد الإنسان علمًا ...... تواضعًا.",
    options: ["نقص", "ازداد", "توقف", "تلاشى"],
    correct: 1,
    explanation: "المعنى المنطقي أن العلم الحقيقي يزيد صاحبه تواضعًا.",
    video: "",
  },
  {
    id: 6,
    section: "لفظي",
    text: "الخطأ السياقي: «حرص المزارع على سقي أشجاره حتى ذبلت وأثمرت»",
    options: ["حرص", "سقي", "ذبلت", "أثمرت"],
    correct: 2,
    explanation: "كلمة «ذبلت» تناقض سياق العناية والإثمار، والصواب «نمت» أو «اخضرّت».",
    video: "",
  },
];

// ─── مكوّنات صغيرة ───
function Pill({ children, color, bg }) {
  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

function AccuracyRing({ pct, size = 130 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const color = pct >= 70 ? C.green : pct >= 40 ? C.accent : C.red;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.line} strokeWidth="10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="26"
        fontWeight="800"
        fill={C.ink}
      >
        {pct}٪
      </text>
    </svg>
  );
}

function Timer({ running }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(sec / 60)).padStart(2, "٠");
  const ss = String(sec % 60).padStart(2, "0");
  return (
    <span className="font-bold tabular-nums" style={{ color: C.sub }}>
      ⏱ {mm}:{ss}
    </span>
  );
}

// ─── التطبيق الرئيسي ───
export default function QuduratApp() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [view, setView] = useState("home"); // home | quiz | results | admin
  const [quizSet, setQuizSet] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showVideo, setShowVideo] = useState(false);

  // التسجيل
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [reg, setReg] = useState({ name: "", phone: "", email: "" });
  const [regErr, setRegErr] = useState("");

  const submitRegister = () => {
    if (!reg.name.trim()) return setRegErr("اكتب اسمك أولًا");
    if (!/^05\d{8}$/.test(reg.phone.trim()))
      return setRegErr("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
    if (!/^\S+@\S+\.\S+$/.test(reg.email.trim()))
      return setRegErr("تأكد من كتابة البريد الإلكتروني بشكل صحيح");
    const newUser = { ...reg, id: Date.now(), joined: new Date().toLocaleDateString("ar-SA") };
    setUsers((u) => [...u, newUser]);
    setCurrentUser(newUser);
    setReg({ name: "", phone: "", email: "" });
    setRegErr("");
    setView("home");
  };

  // نموذج لوحة التحكم
  const emptyForm = {
    section: "كمي",
    text: "",
    options: ["", "", "", ""],
    correct: 0,
    explanation: "",
    video: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [savedMsg, setSavedMsg] = useState("");

  const startQuiz = (section) => {
    const set =
      section === "الكل" ? questions : questions.filter((q) => q.section === section);
    if (set.length === 0) return;
    setQuizSet(set);
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setShowVideo(false);
    setView("quiz");
  };

  const choose = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setAnswers((a) => [...a, { qId: quizSet[idx].id, ok: i === quizSet[idx].correct }]);
  };

  const next = () => {
    setShowVideo(false);
    if (idx + 1 < quizSet.length) {
      setIdx(idx + 1);
      setSelected(null);
    } else {
      setView("results");
    }
  };

  const addQuestion = () => {
    if (!form.text.trim() || form.options.some((o) => !o.trim())) {
      setSavedMsg("أكمل نص السؤال والخيارات الأربعة أولًا");
      return;
    }
    setQuestions((qs) => [...qs, { ...form, id: Date.now() }]);
    setForm(emptyForm);
    setSavedMsg("تمت إضافة السؤال بنجاح ✓");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const removeQuestion = (id) => setQuestions((qs) => qs.filter((q) => q.id !== id));

  const q = quizSet[idx];
  const vid = q ? extractYouTubeId(q.video) : null;
  const formVid = extractYouTubeId(form.video);
  const score = answers.filter((a) => a.ok).length;
  const pct = quizSet.length ? Math.round((score / quizSet.length) * 100) : 0;

  return (
    <div dir="rtl" style={{ ...FONT, backgroundColor: C.bg, minHeight: "100vh", color: C.ink }}>
      {/* الشريط العلوي */}
      <header
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.line}` }}
      >
        <button onClick={() => setView("home")} className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: "linear-gradient(135deg, #38A8E8, #7DD3FC)" }}
          >
            ★
          </div>
          <div className="text-right">
            <div className="font-extrabold leading-none">نجوم القدرات</div>
            <div className="text-[11px]" style={{ color: C.sub }}>
              تدرّب بذكاء لاختبار القدرات
            </div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {view === "quiz" && <Timer running={view === "quiz"} />}
          {currentUser ? (
            <span
              className="text-sm font-bold px-3 py-2 rounded-xl hidden sm:inline"
              style={{ backgroundColor: C.greenSoft, color: C.green }}
            >
              👋 أهلًا، {currentUser.name.split(" ")[0]}
            </span>
          ) : (
            <button
              onClick={() => setView("register")}
              className="text-sm font-extrabold px-4 py-2 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #38A8E8, #7DD3FC)" }}
            >
              ✦ سجّل الآن
            </button>
          )}
          <button
            onClick={() => setView(view === "admin" ? "home" : "admin")}
            className="text-sm font-bold px-4 py-2 rounded-xl"
            style={{
              backgroundColor: view === "admin" ? C.brand : C.brandSoft,
              color: view === "admin" ? "#fff" : C.brand,
            }}
          >
            {view === "admin" ? "عودة للمنصة" : "لوحة التحكم"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* ─── الصفحة الرئيسية ─── */}
        {view === "home" && (
          <div>
            <div
              className="rounded-3xl p-8 mb-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4FB3F0, #8ED6FB)" }}
            >
              <div className="absolute top-4 left-6 text-2xl opacity-50">✦</div>
              <div className="absolute top-10 left-16 text-sm opacity-40">✦</div>
              <div className="absolute bottom-6 left-10 text-lg opacity-30">✦</div>
              <div className="text-3xl font-black mb-2" style={{ textShadow: "0 1px 3px rgba(0,0,0,.12)" }}>
                جاهز ترفع درجتك؟ ⭐
              </div>
              <p className="opacity-90 mb-1">
                تدريب تفاعلي بتصحيح فوري وشرح لكل سؤال — نصّي وبالفيديو.
              </p>
              <p className="text-sm opacity-75">
                {questions.length} سؤالًا في البنك حاليًا · يزيد كل أسبوع
              </p>
              <div
                className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full opacity-20"
                style={{ backgroundColor: "#fff" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "كمي", desc: "حساب · هندسة · جبر · مقارنات", icon: "١٢٣" },
                { name: "لفظي", desc: "تناظر · إكمال · خطأ سياقي · استيعاب", icon: "أبج" },
                { name: "الكل", desc: "اختبار شامل يحاكي التجربة الحقيقية", icon: "★" },
              ].map((s) => {
                const count =
                  s.name === "الكل"
                    ? questions.length
                    : questions.filter((x) => x.section === s.name).length;
                return (
                  <button
                    key={s.name}
                    onClick={() => startQuiz(s.name)}
                    className="rounded-2xl p-5 text-right transition-transform hover:-translate-y-1"
                    style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black mb-3"
                      style={{ backgroundColor: C.brandSoft, color: C.brand }}
                    >
                      {s.icon}
                    </div>
                    <div className="font-extrabold text-lg mb-1">قسم {s.name}</div>
                    <div className="text-sm mb-3" style={{ color: C.sub }}>
                      {s.desc}
                    </div>
                    <Pill color={C.brand} bg={C.brandSoft}>
                      {count} سؤال
                    </Pill>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── شاشة التسجيل ─── */}
        {view === "register" && (
          <div
            className="rounded-3xl p-8 max-w-md mx-auto"
            style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
          >
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-3xl"
                style={{ background: "linear-gradient(135deg, #38A8E8, #7DD3FC)" }}
              >
                ★
              </div>
              <h2 className="text-2xl font-black">انضم لنجوم القدرات</h2>
              <p className="text-sm mt-1" style={{ color: C.sub }}>
                سجّل مجانًا لتتابع تقدمك وتحفظ نتائجك
              </p>
            </div>

            <label className="block text-sm font-bold mb-1">الاسم</label>
            <input
              value={reg.name}
              onChange={(e) => setReg({ ...reg, name: e.target.value })}
              className="w-full rounded-xl p-3 mb-4 outline-none"
              style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
              placeholder="اسمك الكامل"
            />

            <label className="block text-sm font-bold mb-1">رقم الجوال</label>
            <input
              value={reg.phone}
              onChange={(e) => setReg({ ...reg, phone: e.target.value })}
              className="w-full rounded-xl p-3 mb-4 outline-none text-left"
              style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
              placeholder="05xxxxxxxx"
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
            />

            <label className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
            <input
              value={reg.email}
              onChange={(e) => setReg({ ...reg, email: e.target.value })}
              className="w-full rounded-xl p-3 mb-4 outline-none text-left"
              style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
              placeholder="name@example.com"
              dir="ltr"
              type="email"
            />

            {regErr && (
              <div
                className="rounded-xl px-4 py-2.5 mb-4 text-sm font-bold"
                style={{ backgroundColor: C.redSoft, color: C.red }}
              >
                {regErr}
              </div>
            )}

            <button
              onClick={submitRegister}
              className="w-full py-3.5 rounded-2xl font-extrabold text-white text-lg"
              style={{ backgroundColor: C.brand }}
            >
              إنشاء الحساب ✦
            </button>
            <button
              onClick={() => setView("home")}
              className="w-full py-3 mt-2 rounded-2xl font-bold"
              style={{ color: C.sub }}
            >
              لاحقًا، أبغى أتصفح أولًا
            </button>
          </div>
        )}

        {/* ─── شاشة الاختبار ─── */}
        {view === "quiz" && q && (
          <div>
            {/* شريط التقدم */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ backgroundColor: C.line }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((idx + (selected !== null ? 1 : 0)) / quizSet.length) * 100}%`,
                    backgroundColor: C.brand,
                    transition: "width .4s ease",
                  }}
                />
              </div>
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: C.sub }}>
                {idx + 1} / {quizSet.length}
              </span>
            </div>

            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
            >
              <Pill color={C.brand} bg={C.brandSoft}>
                {q.section}
              </Pill>
              <h2 className="text-xl font-extrabold mt-3 mb-5 leading-relaxed">{q.text}</h2>

              <div className="grid gap-3">
                {q.options.map((opt, i) => {
                  let bg = C.bg,
                    border = C.line,
                    mark = "";
                  if (selected !== null) {
                    if (i === q.correct) {
                      bg = C.greenSoft;
                      border = C.green;
                      mark = "✓";
                    } else if (i === selected) {
                      bg = C.redSoft;
                      border = C.red;
                      mark = "✗";
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-right font-bold transition-all"
                      style={{
                        backgroundColor: bg,
                        border: `2px solid ${border}`,
                        cursor: selected === null ? "pointer" : "default",
                      }}
                    >
                      <span>{opt}</span>
                      <span
                        className="font-black text-lg"
                        style={{ color: i === q.correct ? C.green : C.red }}
                      >
                        {mark}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* الشرح بعد الإجابة */}
              {selected !== null && (
                <div
                  className="mt-5 rounded-2xl p-4"
                  style={{
                    backgroundColor: selected === q.correct ? C.greenSoft : C.redSoft,
                    border: `1px solid ${selected === q.correct ? C.green : C.red}`,
                  }}
                >
                  <div
                    className="font-extrabold mb-1"
                    style={{ color: selected === q.correct ? C.green : C.red }}
                  >
                    {selected === q.correct ? "إجابة صحيحة، أحسنت! 🎉" : "إجابة غير صحيحة"}
                  </div>
                  <p className="text-sm leading-relaxed">{q.explanation}</p>

                  {vid && !showVideo && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="mt-3 text-sm font-bold px-4 py-2 rounded-xl text-white"
                      style={{ backgroundColor: "#E11D48" }}
                    >
                      ▶ شاهد الشرح بالفيديو
                    </button>
                  )}
                  {vid && showVideo && (
                    <div className="mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${vid}`}
                        title="شرح بالفيديو"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {selected !== null && (
                <button
                  onClick={next}
                  className="mt-5 w-full py-3.5 rounded-2xl font-extrabold text-white text-lg"
                  style={{ backgroundColor: C.brand }}
                >
                  {idx + 1 < quizSet.length ? "السؤال التالي ←" : "عرض النتيجة"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── شاشة النتائج ─── */}
        {view === "results" && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
          >
            <h2 className="text-2xl font-black mb-1">نتيجتك</h2>
            <p className="mb-5" style={{ color: C.sub }}>
              أجبت بشكل صحيح على {score} من {quizSet.length} أسئلة
            </p>
            <div className="flex justify-center mb-5">
              <AccuracyRing pct={pct} />
            </div>
            <p className="font-bold mb-6">
              {pct >= 70
                ? "مستوى ممتاز! استمر على نفس الوتيرة 💪"
                : pct >= 40
                ? "بداية جيدة — راجع الشروحات وأعد المحاولة"
                : "لا بأس، التكرار سرّ الإتقان. راجع الشروحات وجرّب من جديد"}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => startQuiz("الكل")}
                className="px-6 py-3 rounded-2xl font-extrabold text-white"
                style={{ backgroundColor: C.brand }}
              >
                إعادة الاختبار
              </button>
              <button
                onClick={() => setView("home")}
                className="px-6 py-3 rounded-2xl font-extrabold"
                style={{ backgroundColor: C.brandSoft, color: C.brand }}
              >
                الرئيسية
              </button>
            </div>
          </div>
        )}

        {/* ─── لوحة التحكم ─── */}
        {view === "admin" && (
          <div>
            <div
              className="rounded-2xl p-4 mb-5 text-sm font-bold"
              style={{ backgroundColor: "#FFF7E6", border: `1px solid ${C.accent}`, color: "#92400E" }}
            >
              نسخة تجريبية: الأسئلة تُحفظ مؤقتًا في هذه الجلسة فقط. في النسخة النهائية ستُحفظ في
              قاعدة بيانات دائمة.
            </div>

            <div
              className="rounded-3xl p-6 mb-6"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
            >
              <h2 className="text-xl font-black mb-4">إضافة سؤال جديد</h2>

              <label className="block text-sm font-bold mb-1">القسم</label>
              <div className="flex gap-2 mb-4">
                {["كمي", "لفظي"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm({ ...form, section: s })}
                    className="px-5 py-2 rounded-xl font-bold"
                    style={{
                      backgroundColor: form.section === s ? C.brand : C.brandSoft,
                      color: form.section === s ? "#fff" : C.brand,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <label className="block text-sm font-bold mb-1">نص السؤال</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={2}
                className="w-full rounded-xl p-3 mb-4 outline-none"
                style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
                placeholder="اكتبي نص السؤال هنا..."
              />

              <label className="block text-sm font-bold mb-1">
                الخيارات (اضغطي الدائرة لتحديد الإجابة الصحيحة)
              </label>
              <div className="grid gap-2 mb-4">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setForm({ ...form, correct: i })}
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-black text-white text-sm"
                      style={{
                        backgroundColor: form.correct === i ? C.green : C.line,
                      }}
                      title="الإجابة الصحيحة"
                    >
                      {form.correct === i ? "✓" : ""}
                    </button>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const o = [...form.options];
                        o[i] = e.target.value;
                        setForm({ ...form, options: o });
                      }}
                      className="flex-1 rounded-xl p-2.5 outline-none"
                      style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
                      placeholder={`الخيار ${i + 1}`}
                    />
                  </div>
                ))}
              </div>

              <label className="block text-sm font-bold mb-1">شرح الإجابة</label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                rows={2}
                className="w-full rounded-xl p-3 mb-4 outline-none"
                style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
                placeholder="لماذا هذه هي الإجابة الصحيحة؟"
              />

              <label className="block text-sm font-bold mb-1">
                رابط فيديو يوتيوب للشرح (اختياري)
              </label>
              <input
                value={form.video}
                onChange={(e) => setForm({ ...form, video: e.target.value })}
                className="w-full rounded-xl p-2.5 mb-2 outline-none"
                style={{ border: `2px solid ${C.line}`, backgroundColor: C.bg }}
                placeholder="مثال: https://youtu.be/xxxxxxx أو رابط المشاهدة الكامل"
                dir="ltr"
              />
              {form.video && (
                <div className="text-sm font-bold mb-3" style={{ color: formVid ? C.green : C.red }}>
                  {formVid ? "✓ الرابط صحيح وسيظهر الفيديو داخل السؤال" : "✗ لم أتعرف على الرابط، تأكدي أنه رابط يوتيوب"}
                </div>
              )}

              <button
                onClick={addQuestion}
                className="w-full py-3 rounded-2xl font-extrabold text-white"
                style={{ backgroundColor: C.brand }}
              >
                إضافة السؤال إلى البنك
              </button>
              {savedMsg && (
                <div className="text-center font-bold mt-3" style={{ color: C.green }}>
                  {savedMsg}
                </div>
              )}
            </div>

            {/* قائمة الطلاب المسجلين */}
            <div
              className="rounded-3xl p-6 mb-6"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
            >
              <h2 className="text-xl font-black mb-4">الطلاب المسجلون ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-sm" style={{ color: C.sub }}>
                  لا يوجد مسجلون بعد — جرّب زر «سجّل الآن» في الأعلى لتشوف كيف تظهر البيانات هنا.
                </p>
              ) : (
                <div className="grid gap-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3"
                      style={{ backgroundColor: C.bg, border: `1px solid ${C.line}` }}
                    >
                      <span className="font-extrabold">{u.name}</span>
                      <span className="text-sm font-bold" style={{ color: C.sub }} dir="ltr">
                        {u.phone}
                      </span>
                      <span className="text-sm" style={{ color: C.sub }} dir="ltr">
                        {u.email}
                      </span>
                      <Pill color={C.brand} bg={C.brandSoft}>
                        انضم {u.joined}
                      </Pill>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* قائمة الأسئلة */}
            <div
              className="rounded-3xl p-6"
              style={{ backgroundColor: C.card, border: `1px solid ${C.line}` }}
            >
              <h2 className="text-xl font-black mb-4">بنك الأسئلة ({questions.length})</h2>
              <div className="grid gap-2">
                {questions.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.line}` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Pill color={C.brand} bg={C.brandSoft}>
                        {it.section}
                      </Pill>
                      <span className="font-bold truncate">{it.text}</span>
                      {extractYouTubeId(it.video) && <span title="يتضمن فيديو">🎬</span>}
                    </div>
                    <button
                      onClick={() => removeQuestion(it.id)}
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: C.red }}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-sm" style={{ color: C.sub }}>
        نجوم القدرات ★ — نموذج أولي تجريبي · جميع الأسئلة أمثلة توضيحية
      </footer>
    </div>
  );
}
