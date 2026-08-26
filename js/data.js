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
      { g: "ἀπαγγέλλω", gloss: "I announce, proclaim, report", freq: 45, tier: "memorize", icon: "📢", mn: "ah-pahng-GHEHL-lo ≈ \"a PANG — hard-G HELLO!\" A pang, then you hail everyone: ANNOUNCE." },
      { g: "ἀποδίδωμι", gloss: "I give away, pay, return", freq: 48, tier: "memorize", icon: "💰", mn: "ah-po-THEE-tho-mee ≈ \"APOTHE-tho-me.\" The apothecary hands it back TO ME: PAY UP." },
      { g: "ἄρα", gloss: "so, then, consequently", freq: 49, tier: "memorize", icon: "➡️", mn: "AH-rah ≈ \"AH — RAH!\" The cheer once the point lands: SO, THEN." },
      { g: "ἄφεσις, -εως, ἡ", gloss: "forgiveness", freq: 17, tier: "memorize", icon: "🕊️", mn: "ah-FEH-sees ≈ \"a-FESS-sis.\" Fess up, sis — and it is FORGIVEN." },
      { g: "ἄχρι", gloss: "until (conj. or prep. + gen.)", freq: 49, tier: "memorize", icon: "⏳", mn: "AH-khree ≈ \"a CRY\" (rasped: kh). You cry UNTIL it is over." },
      { g: "βάπτισμα, -ατος, τό", gloss: "baptism", freq: 19, tier: "memorize", icon: "💧", mn: "VAHP-tees-mah ≈ \"VOP-TEASE-ma.\" With a V: they dunk him under. BAPTISM." },
      { g: "δεύτερος", gloss: "second", freq: 43, tier: "memorize", icon: "2️⃣", mn: "THEV-teh-ros ≈ \"THE-VET-ROSE.\" The vet rose in SECOND place." },
      { g: "διακονέω", gloss: "I serve", freq: 37, tier: "memorize", icon: "🍽️", mn: "thee-ah-ko-NEH-o ≈ \"THEE-a-CONE-oh.\" A cone for thee: I SERVE." },
      { g: "διέρχομαι", gloss: "I go through, cross over", freq: 43, tier: "memorize", icon: "🚶", mn: "thee-EHR-kho-meh ≈ \"THE-AIR-I-COMB.\" You comb right THROUGH the air." },
      { g: "ἐκπορεύομαι", gloss: "I go out, come out", freq: 33, tier: "memorize", icon: "🚪", mn: "ehk-po-REV-o-meh ≈ \"ECK-po-REV-o-me.\" Rev it up and GO OUT." },
      { g: "ἐνδύω", gloss: "I clothe myself, put on, wear", freq: 27, tier: "memorize", icon: "👕", mn: "ehn-THEW-o ≈ \"EN-THOU-oh.\" En-thou: you get INTO it — PUT ON your coat." },
      { g: "ἐπιγινώσκω", gloss: "I know, understand, recognize", freq: 44, tier: "memorize", icon: "💡", mn: "eh-pee-ghee-NOS-ko ≈ \"a-PIGGY-KNOWS-ko.\" A piggy KNOWS you: RECOGNIZE." },
      { g: "ἔρημος, ἡ", gloss: "desert, wilderness", freq: 48, tier: "memorize", icon: "🏜️", mn: "EH-ray-mos ≈ \"AIR-RAY-MOSS.\" Air and rays, no moss at all: the DESERT." },
      { g: "ἑτοιμάζω", gloss: "I make ready, prepare", freq: 40, tier: "memorize", icon: "🧰", mn: "heh-TEW-mah-zo ≈ \"he-TWO-ma-zo.\" He gets two for ma: everything READY." },
      { g: "ἔτος, -ους, τό", gloss: "year", freq: 49, tier: "memorize", icon: "📅", mn: "EH-tos ≈ \"a TOSS.\" You toss the old calendar out each YEAR." },
      { g: "εὐδοκέω", gloss: "I am well pleased, approve", freq: 21, tier: "memorize", icon: "😊", mn: "ev-tho-KEH-o ≈ \"EV-THOUGH-KAY-o.\" Ev, though, is okay with it: WELL PLEASED." },
      { g: "Ἠσαΐας, ὁ", gloss: "Isaiah", freq: 22, tier: "memorize", icon: "📜", mn: "ay-sah-EE-ahs ≈ \"a-SAY-EE-as.\" Say it and you have ISAIAH." },
      { g: "θηρίον, τό", gloss: "animal, beast", freq: 46, tier: "memorize", icon: "🦁", mn: "THAY-ree-on ≈ \"THEY'RE-ON.\" They're on me — the wild BEASTS!" },
      { g: "θλῖψις, -εως, ἡ", gloss: "tribulation, affliction, oppression", freq: 45, tier: "memorize", icon: "😰", mn: "THLEEP-sees ≈ \"the-LIPS-SEIZE.\" The lips seize under the pressure: TRIBULATION." },
      { g: "θρίξ, τριχός, ἡ", gloss: "hair", freq: 15, tier: "memorize", icon: "💇", mn: "THREEX ≈ \"THREE-X.\" Three strands of HAIR crossed in an X." },
      { g: "ἱκανός", gloss: "qualified, able", freq: 39, tier: "memorize", icon: "✅", mn: "hee-kah-NOS ≈ \"HE-CAN-nose.\" He can do it — he is ABLE." },
      { g: "Ἰορδάνης, -ου, ὁ", gloss: "the Jordan", freq: 15, tier: "memorize", icon: "🏞️", mn: "ee-or-THAH-nays ≈ \"YOUR-THAW-nays.\" Your thaw feeds the JORDAN." },
      { g: "ἰσχυρός", gloss: "strong, mighty, powerful", freq: 29, tier: "memorize", icon: "💪", mn: "ees-KHEW-ros ≈ \"EASE-CUE-rose.\" On cue he rose — that is STRONG." },
      { g: "καθίζω", gloss: "I cause to sit down, appoint", freq: 46, tier: "memorize", icon: "🪑", mn: "kah-THEE-zo ≈ \"CATHY'S-oh.\" Cathy, oh — SIT DOWN." },
      { g: "κρατέω", gloss: "I grasp, hold (fast), arrest", freq: 47, tier: "memorize", icon: "✊", mn: "krah-TEH-o ≈ \"a-CRATE-oh.\" Grab the crate and HOLD it fast." },
      { g: "μετάνοια, ἡ", gloss: "repentance", freq: 22, tier: "memorize", icon: "🔄", mn: "meh-tah-NEW-ah ≈ \"ME? a-NEW-ah!\" Me, made new — a changed mind: REPENTANCE." },
      { g: "ναός, ὁ", gloss: "temple, sanctuary", freq: 45, tier: "memorize", icon: "🏛️", mn: "nah-OS ≈ \"NOAH'S.\" Noah's holy house: the TEMPLE." },
      { g: "ὅμοιος", gloss: "like, similar", freq: 45, tier: "memorize", icon: "🟰", mn: "ho-MEW-os ≈ \"HOME-EWES.\" Two ewes at home look ALIKE." },
      { g: "ὀπίσω", gloss: "after, behind", freq: 35, tier: "memorize", icon: "👣", mn: "o-PEE-so ≈ \"oh-a-PEA-so.\" The pea rolled off BEHIND you." },
      { g: "οὐαί", gloss: "woe", freq: 46, tier: "memorize", icon: "😱", mn: "oo-EH ≈ \"oo-AY!\" Said aloud it is already a wail: WOE!" },
      { g: "οὐκέτι", gloss: "no longer", freq: 47, tier: "memorize", icon: "🚫", mn: "oo-KEH-tee ≈ \"ooh-KETTLE.\" The kettle is NO LONGER boiling." },
      { g: "πειράζω", gloss: "I tempt, test", freq: 38, tier: "memorize", icon: "🎣", mn: "pee-RAH-zo ≈ \"PEER-RAH-zo.\" He peers at you to TEST you." },
      { g: "ποταμός, ὁ", gloss: "river", freq: 17, tier: "memorize", icon: "🌊", mn: "po-tah-MOS ≈ \"a-POT-o'-MOSS.\" It floats away down the RIVER." },
      { g: "πρό", gloss: "before, in front of, at (+ gen.)", freq: 47, tier: "memorize", icon: "⏪", mn: "PRO ≈ \"a PRO.\" The pro always goes BEFORE the rookie." },
      { g: "προσφέρω", gloss: "I bring to, offer", freq: 47, tier: "memorize", icon: "🎁", mn: "pros-FEH-ro ≈ \"PROS-FERRY-o.\" The pros ferry it over and OFFER it." },
      { g: "Σατανᾶς, -ᾶ, ὁ", gloss: "Satan", freq: 36, tier: "memorize", icon: "😈", mn: "sah-tah-NAHS ≈ \"SATAN-ahs.\" The accuser himself: SATAN." },
      { g: "σταυρόω", gloss: "I crucify", freq: 46, tier: "memorize", icon: "✝️", mn: "STAV-ro-o ≈ \"a STAVE — a ROW — oh.\" A row of wooden staves: they CRUCIFY him." },
      { g: "τεσσεράκοντα", gloss: "forty", freq: 22, tier: "memorize", icon: "4️⃣", mn: "tehs-seh-rah-KON-tah ≈ \"TESS-and-SARAH-COUNT-ah.\" They count to FORTY." },
      { g: "φυλακή, ἡ", gloss: "watch, guard, prison", freq: 47, tier: "memorize", icon: "🔒", mn: "few-lah-KAY ≈ \"a-FEW-lo-KAY.\" A few locked away, Kay: PRISON, a GUARD." },
      { g: "χώρα, ἡ", gloss: "district, region", freq: 28, tier: "memorize", icon: "🗺️", mn: "KHO-rah ≈ \"CORA\" (rasped: kh). Cora owns the whole REGION." },
      // ---- Vocabulary to Recognize ----
      { g: "ἄγριος", gloss: "wild", freq: 3, tier: "recognize", icon: "🌿", mn: "AH-ghree-os ≈ \"ANGRY-os.\" Angry and untamed: WILD." },
      { g: "ἀκρίς, -ίδος, ἡ", gloss: "locust", freq: 4, tier: "recognize", icon: "🦗", mn: "ah-KREES ≈ \"a-CREASE.\" The locusts eat a crease across the field: LOCUST." },
      { g: "βοάω", gloss: "I call, shout, cry out", freq: 12, tier: "recognize", icon: "📣", mn: "vo-AH-o ≈ \"a VOW — AH — OH!\" With a V, and every syllable a shout: he CRIES OUT." },
      { g: "δερμάτινος", gloss: "(made of) leather", freq: 2, tier: "recognize", icon: "🧥", mn: "thehr-mah-TEE-nos ≈ \"THERMAL-TEE-nos.\" A thermal tee made of LEATHER." },
      { g: "ἐξομολογέω", gloss: "I confess, admit", freq: 10, tier: "recognize", icon: "🙏", mn: "ehx-o-mo-lo-GHEH-o ≈ \"EGGS-o-mo-lo-GAY-o.\" He logs it all out loud: CONFESS." },
      { g: "εὐθύς", gloss: "straight", freq: 8, tier: "recognize", icon: "📏", mn: "ev-THEWS ≈ \"EV — THOSE!\" Ev sends those STRAIGHT ahead." },
      { g: "ζώνη, ἡ", gloss: "belt", freq: 8, tier: "recognize", icon: "🎽", mn: "ZO-nay ≈ \"a ZONE-ay.\" The BELT is the zone around your waist." },
      { g: "Ἱεροσολυμίτης, -ου, ὁ", gloss: "inhabitant of Jerusalem", freq: 2, tier: "recognize", icon: "🏙️", mn: "hee-eh-ro-so-lew-MEE-tays ≈ \"HIERO-SO-LEW-mee-tays.\" A JERUSALEM-ite." },
      { g: "ἱμάς, -άντος, ὁ", gloss: "strap, thong", freq: 4, tier: "recognize", icon: "🪢", mn: "hee-MAHS ≈ \"HE-MASHED.\" He mashed the sandal STRAP flat." },
      { g: "κάμηλος, ὁ", gloss: "camel", freq: 6, tier: "recognize", icon: "🐪", mn: "kah-MAY-los ≈ \"ka-MAY-los.\" Say it and it is already the CAMEL." },
      { g: "κατασκευάζω", gloss: "I make ready, prepare", freq: 11, tier: "recognize", icon: "🔨", mn: "kah-tah-SKEV-ah-zo ≈ \"CUT-a-SKEV-a-zo.\" Cut it, skewer it, PREPARE the feast." },
      { g: "κύπτω", gloss: "I bend down", freq: 2, tier: "recognize", icon: "🙇", mn: "KEWP-to ≈ \"CUTE-P-toe\" — like \"cute\" with a P. He stoops low: BEND DOWN." },
      { g: "μέλι, -ιτος, τό", gloss: "honey", freq: 4, tier: "recognize", icon: "🍯", mn: "MEH-lee ≈ \"MEL-ee.\" Mel loves his HONEY." },
      { g: "Ναζαρέτ, ἡ", gloss: "Nazareth", freq: 12, tier: "recognize", icon: "🏘️", mn: "nah-zah-REHT ≈ \"NAZA-RET.\" The town itself: NAZARETH." },
      { g: "ὀσφῦς, ἡ", gloss: "waist", freq: 8, tier: "recognize", icon: "🧍", mn: "os-FEWS ≈ \"OS-FEWS.\" The few bones at your WAIST." },
      { g: "περιστερά, ἡ", gloss: "dove, pigeon", freq: 10, tier: "recognize", icon: "🕊️", mn: "peh-ree-steh-RAH ≈ \"PERRY'S-STAIR-ah.\" A DOVE settles on Perry's stair." },
      { g: "σχίζω", gloss: "I split, divide, separate, tear apart", freq: 11, tier: "recognize", icon: "✂️", mn: "SKHEE-zo ≈ \"SKIS-oh.\" The skis SPLIT the snow apart." },
      { g: "τρίβος, ἡ", gloss: "path", freq: 3, tier: "recognize", icon: "🛤️", mn: "TREE-vos ≈ \"TREE-VOSS.\" With a V — the PATH runs between the trees." },
      { g: "ὑπόδημα, -ατος, τό", gloss: "sandal", freq: 10, tier: "recognize", icon: "👡", mn: "hew-po-THAY-mah ≈ \"HEW-po-THAY-ma.\" Who put THEM on? The SANDALS." }
    ]
  }
];
