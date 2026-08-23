// ============================================================
// Greek Vocabulary Database
// ------------------------------------------------------------
// Each set has: id, source, title, and words.
// Each word: g (Greek lexical form), gloss (English), freq (NT
// frequency count from the workbook), tier ('memorize' | 'recognize'),
// icon (a symbol shown with the hint) and mn (the built-in memory hook).
//
// To add new vocabulary: upload workbook photos to Claude and a
// new set object gets appended here. Custom sets added in-app are
// stored in localStorage and merged at runtime.
// ============================================================

const VOCAB_SETS = [
  {
    id: "gd-set-01",
    source: "Going Deeper with New Testament Greek",
    title: "Set 1 — Mark 1 Vocabulary",
    words: [
      // ---- Vocabulary to Memorize ----
      { g: "ἀπαγγέλλω", gloss: "I announce, proclaim, report", freq: 45, tier: "memorize", icon: "📢", mn: "Hiding inside is ἄγγελος, angel — a messenger. An ANGEL ANNOUNCES the news." },
      { g: "ἀποδίδωμι", gloss: "I give away, pay, return", freq: 48, tier: "memorize", icon: "💰", mn: "ἀπό (away) + δίδωμι (I give) = give away, pay back." },
      { g: "ἄρα", gloss: "so, then, consequently", freq: 49, tier: "memorize", icon: "➡️", mn: "\"AH-ra\" — \"AH, so THEN, that settles it.\"" },
      { g: "ἄφεσις, -εως, ἡ", gloss: "forgiveness", freq: 17, tier: "memorize", icon: "🕊️", mn: "ἀπό (away) + ἵημι (send): the debt is SENT AWAY. That is forgiveness." },
      { g: "ἄχρι", gloss: "until (conj. or prep. + gen.)", freq: 49, tier: "memorize", icon: "⏳", mn: "\"AH-kri\" sounds like ACHE — you ACHE UNTIL it is over." },
      { g: "βάπτισμα, -ατος, τό", gloss: "baptism", freq: 19, tier: "memorize", icon: "💧", mn: "Our word baptism comes straight from it." },
      { g: "δεύτερος", gloss: "second", freq: 43, tier: "memorize", icon: "2️⃣", mn: "DEUTERONOMY is the SECOND giving of the law." },
      { g: "διακονέω", gloss: "I serve", freq: 37, tier: "memorize", icon: "🍽️", mn: "A DEACON is one who SERVES." },
      { g: "διέρχομαι", gloss: "I go through, cross over", freq: 43, tier: "memorize", icon: "🚶", mn: "διά (through) + ἔρχομαι (go) = go THROUGH." },
      { g: "ἐκπορεύομαι", gloss: "I go out, come out", freq: 33, tier: "memorize", icon: "🚪", mn: "ἐκ (out) + πορεύομαι (travel) — like EXport, it goes OUT." },
      { g: "ἐνδύω", gloss: "I clothe myself, put on, wear", freq: 27, tier: "memorize", icon: "👕", mn: "ἐν (in) + δύω (sink into) — you sink INTO your clothes. English \"endue\"." },
      { g: "ἐπιγινώσκω", gloss: "I know, understand, recognize", freq: 44, tier: "memorize", icon: "💡", mn: "ἐπί (upon) + γινώσκω (know) — knowledge laid UPON knowledge: full recognition." },
      { g: "ἔρημος, ἡ", gloss: "desert, wilderness", freq: 48, tier: "memorize", icon: "🏜️", mn: "A HERMIT is named for this word — he lives in the ἔρημος, the desert." },
      { g: "ἑτοιμάζω", gloss: "I make ready, prepare", freq: 40, tier: "memorize", icon: "🧰", mn: "\"heh-TOY-mah-zo\" — get your TOYS ready, put them in order." },
      { g: "ἔτος, -ους, τό", gloss: "year", freq: 49, tier: "memorize", icon: "📅", mn: "An ETESIAN wind is the yearly wind — it returns each YEAR." },
      { g: "εὐδοκέω", gloss: "I am well pleased, approve", freq: 21, tier: "memorize", icon: "😊", mn: "εὖ (well) + δοκέω (think) — to THINK WELL of, be pleased with." },
      { g: "Ἠσαΐας, ὁ", gloss: "Isaiah", freq: 22, tier: "memorize", icon: "📜", mn: "Isaiah — the same name, just in Greek dress." },
      { g: "θηρίον, τό", gloss: "animal, beast", freq: 46, tier: "memorize", icon: "🦁", mn: "A THERIAC was medicine against wild BEASTS; theriomorphic means beast-shaped." },
      { g: "θλῖψις, -εως, ἡ", gloss: "tribulation, affliction, oppression", freq: 45, tier: "memorize", icon: "😰", mn: "θλίβω is to PRESS. Tribulation is the feeling of being crushed and squeezed." },
      { g: "θρίξ, τριχός, ἡ", gloss: "hair", freq: 15, tier: "memorize", icon: "💇", mn: "TRICHOLOGY — from the stem τριχ- — is the study of HAIR." },
      { g: "ἱκανός", gloss: "qualified, able", freq: 39, tier: "memorize", icon: "✅", mn: "\"hih-kah-NOS\" — HE CAN, therefore he is ABLE, competent, enough." },
      { g: "Ἰορδάνης, -ου, ὁ", gloss: "the Jordan", freq: 15, tier: "memorize", icon: "🏞️", mn: "The Jordan — the same name." },
      { g: "ἰσχυρός", gloss: "strong, mighty, powerful", freq: 29, tier: "memorize", icon: "💪", mn: "An ISCHIUM is the strong hip bone. STRONG, mighty." },
      { g: "καθίζω", gloss: "I cause to sit down, appoint", freq: 46, tier: "memorize", icon: "🪑", mn: "A CATHEDRAL is named for the cathedra, the bishop's SEAT — where one SITS DOWN." },
      { g: "κρατέω", gloss: "I grasp, hold (fast), arrest", freq: 47, tier: "memorize", icon: "✊", mn: "Every -CRACY (demoCRACY, autoCRACY) is about who HOLDS the power." },
      { g: "μετάνοια, ἡ", gloss: "repentance", freq: 22, tier: "memorize", icon: "🔄", mn: "μετά (change) + νοῦς (mind) — literally a CHANGE OF MIND." },
      { g: "ναός, ὁ", gloss: "temple, sanctuary", freq: 45, tier: "memorize", icon: "🏛️", mn: "The ναός is the inner sanctuary — the holy room itself, not the whole complex." },
      { g: "ὅμοιος", gloss: "like, similar", freq: 45, tier: "memorize", icon: "🟰", mn: "HOMOgeneous, HOMOnym — all mean of the SAME kind. Like, similar." },
      { g: "ὀπίσω", gloss: "after, behind", freq: 35, tier: "memorize", icon: "👣", mn: "Think OPPOSITE of forward — what lies BEHIND, and what follows AFTER." },
      { g: "οὐαί", gloss: "woe", freq: 46, tier: "memorize", icon: "😱", mn: "Say it aloud: \"oo-AI!\" It is a wail. WOE!" },
      { g: "οὐκέτι", gloss: "no longer", freq: 47, tier: "memorize", icon: "🚫", mn: "οὐκ (not) + ἔτι (still) — not still going on, so NO LONGER." },
      { g: "πειράζω", gloss: "I tempt, test", freq: 38, tier: "memorize", icon: "🎣", mn: "An EMPIRICAL test puts a thing to the trial. To TEST, to TEMPT." },
      { g: "ποταμός, ὁ", gloss: "river", freq: 17, tier: "memorize", icon: "🌊", mn: "A hipPOPOTAMUS is literally a RIVER horse." },
      { g: "πρό", gloss: "before, in front of, at (+ gen.)", freq: 47, tier: "memorize", icon: "⏪", mn: "Every PRO- word — PROlogue, PROphet, PROgram — comes BEFORE." },
      { g: "προσφέρω", gloss: "I bring to, offer", freq: 47, tier: "memorize", icon: "🎁", mn: "πρός (toward) + φέρω (carry) — carry it TOWARD someone: to offer." },
      { g: "Σατανᾶς, -ᾶ, ὁ", gloss: "Satan", freq: 36, tier: "memorize", icon: "😈", mn: "Satan — the Hebrew word for the accuser, carried into Greek." },
      { g: "σταυρόω", gloss: "I crucify", freq: 46, tier: "memorize", icon: "✝️", mn: "A σταυρός is the CROSS. To crucify is to put on the cross." },
      { g: "τεσσεράκοντα", gloss: "forty", freq: 22, tier: "memorize", icon: "4️⃣", mn: "τέσσαρες is four — this is the four-word stretched to FORTY." },
      { g: "φυλακή, ἡ", gloss: "watch, guard, prison", freq: 47, tier: "memorize", icon: "🔒", mn: "A PROPHYLACTIC guards against something. A GUARD, a watch, and so a PRISON." },
      { g: "χώρα, ἡ", gloss: "district, region", freq: 28, tier: "memorize", icon: "🗺️", mn: "Think of a whole stretch of open country — the REGION round about a city." },
      // ---- Vocabulary to Recognize ----
      { g: "ἄγριος", gloss: "wild", freq: 3, tier: "recognize", icon: "🌿", mn: "AGRARIAN land is open field; untamed field means WILD." },
      { g: "ἀκρίς, -ίδος, ἡ", gloss: "locust", freq: 4, tier: "recognize", icon: "🦗", mn: "\"ah-KREES\" — the LOCUST eats its way across the ACRES." },
      { g: "βοάω", gloss: "I call, shout, cry out", freq: 12, tier: "recognize", icon: "📣", mn: "\"bo-AH-o\" — he lets out a BOO, a shout. To CRY OUT." },
      { g: "δερμάτινος", gloss: "(made of) leather", freq: 2, tier: "recognize", icon: "🧥", mn: "DERMATOLOGY is the study of skin — and leather is skin." },
      { g: "ἐξομολογέω", gloss: "I confess, admit", freq: 10, tier: "recognize", icon: "🙏", mn: "ἐκ (out) + ὁμολογέω (say the same) — say it OUT and agree: CONFESS." },
      { g: "εὐθύς", gloss: "straight", freq: 8, tier: "recognize", icon: "📏", mn: "εὖ (well) + a stem of setting — well-set, and so STRAIGHT." },
      { g: "ζώνη, ἡ", gloss: "belt", freq: 8, tier: "recognize", icon: "🎽", mn: "A ZONE is a band. A belt is the band around your waist." },
      { g: "Ἱεροσολυμίτης, -ου, ὁ", gloss: "inhabitant of Jerusalem", freq: 2, tier: "recognize", icon: "🏙️", mn: "Ἱεροσόλυμα is Jerusalem — so this is a Jerusalemite." },
      { g: "ἱμάς, -άντος, ὁ", gloss: "strap, thong", freq: 4, tier: "recognize", icon: "🪢", mn: "\"hee-MAHS\" — the STRAP he was not worthy to untie." },
      { g: "κάμηλος, ὁ", gloss: "camel", freq: 6, tier: "recognize", icon: "🐪", mn: "Camel — the same word, barely changed." },
      { g: "κατασκευάζω", gloss: "I make ready, prepare", freq: 11, tier: "recognize", icon: "🔨", mn: "κατά (fully) + σκευάζω (equip) — fully equip, and so PREPARE." },
      { g: "κύπτω", gloss: "I bend down", freq: 2, tier: "recognize", icon: "🙇", mn: "\"KOOP-toh\" — he STOOPED, he CUPPED himself down low." },
      { g: "μέλι, -ιτος, τό", gloss: "honey", freq: 4, tier: "recognize", icon: "🍯", mn: "MELLIFLUOUS means flowing with HONEY — from this very word." },
      { g: "Ναζαρέτ, ἡ", gloss: "Nazareth", freq: 12, tier: "recognize", icon: "🏘️", mn: "Nazareth — the same name." },
      { g: "ὀσφῦς, ἡ", gloss: "waist", freq: 8, tier: "recognize", icon: "🧍", mn: "The loins, the WAIST — where the belt of ζώνη goes." },
      { g: "περιστερά, ἡ", gloss: "dove, pigeon", freq: 10, tier: "recognize", icon: "🕊️", mn: "The DOVE that descended at the baptism." },
      { g: "σχίζω", gloss: "I split, divide, separate, tear apart", freq: 11, tier: "recognize", icon: "✂️", mn: "SCHIZOphrenia is a SPLIT mind; a SCHISM splits a church." },
      { g: "τρίβος, ἡ", gloss: "path", freq: 3, tier: "recognize", icon: "🛤️", mn: "A path is worn by rubbing — the same root gives us to TRIBULATE, to rub down." },
      { g: "ὑπόδημα, -ατος, τό", gloss: "sandal", freq: 10, tier: "recognize", icon: "👡", mn: "ὑπό (under) + δέω (bind) — bound UNDER the foot: a sandal." }
    ]
  }
];
