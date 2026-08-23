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
      { g: "ἀπαγγέλλω", gloss: "I announce, proclaim, report", freq: 45, tier: "memorize", icon: "📢", mn: "ah-pahng-GHEL-lo → \"a PANG — GO YELL!\" He feels a pang and goes to ANNOUNCE it." },
      { g: "ἀποδίδωμι", gloss: "I give away, pay, return", freq: 48, tier: "memorize", icon: "💰", mn: "ah-po-THEE-tho-mee → \"a POT o' DOUGH — TO ME!\" Hand the dough back: PAY UP." },
      { g: "ἄρα", gloss: "so, then, consequently", freq: 49, tier: "memorize", icon: "➡️", mn: "AH-rah → \"AH — RAH!\" The cheer that follows the point: SO, THEN." },
      { g: "ἄφεσις, -εως, ἡ", gloss: "forgiveness", freq: 17, tier: "memorize", icon: "🕊️", mn: "ah-FEH-sees → \"a FESS-ups.\" You fess up, and it is FORGIVEN." },
      { g: "ἄχρι", gloss: "until (conj. or prep. + gen.)", freq: 49, tier: "memorize", icon: "⏳", mn: "AH-khree → \"a CRY.\" You CRY UNTIL it is over." },
      { g: "βάπτισμα, -ατος, τό", gloss: "baptism", freq: 19, tier: "memorize", icon: "💧", mn: "VAHP-tees-mah → \"a VAT BAPTIZES ma.\" Straight into the water: BAPTISM." },
      { g: "δεύτερος", gloss: "second", freq: 43, tier: "memorize", icon: "2️⃣", mn: "THEV-teh-ros → \"THE VET ROSE.\" The vet rose in SECOND place." },
      { g: "διακονέω", gloss: "I serve", freq: 37, tier: "memorize", icon: "🍽️", mn: "thee-ah-ko-NEH-o → \"THEE a CONE, oh!\" Handing you a cone: I SERVE." },
      { g: "διέρχομαι", gloss: "I go through, cross over", freq: 43, tier: "memorize", icon: "🚶", mn: "thee-EHR-kho-meh → \"THE AIR I COMB.\" You comb right THROUGH the air." },
      { g: "ἐκπορεύομαι", gloss: "I go out, come out", freq: 33, tier: "memorize", icon: "🚪", mn: "ehk-po-REV-o-meh → \"EXIT — REV — O, ME!\" Rev the engine and GO OUT." },
      { g: "ἐνδύω", gloss: "I clothe myself, put on, wear", freq: 27, tier: "memorize", icon: "👕", mn: "ehn-THEW-o → \"AND YOU, OH — coat on!\" You PUT ON your clothes." },
      { g: "ἐπιγινώσκω", gloss: "I know, understand, recognize", freq: 44, tier: "memorize", icon: "💡", mn: "eh-pee-ghee-NOS-ko → \"a PIG — he KNOWS-ko!\" He RECOGNIZES you." },
      { g: "ἔρημος, ἡ", gloss: "desert, wilderness", freq: 48, tier: "memorize", icon: "🏜️", mn: "EH-ray-mos → \"AIR — RAYS — no MOSS.\" Only air and sun: the DESERT." },
      { g: "ἑτοιμάζω", gloss: "I make ready, prepare", freq: 40, tier: "memorize", icon: "🧰", mn: "heh-TEW-mah-zo → \"HEY, TWO MORE!\" Get two more READY." },
      { g: "ἔτος, -ους, τό", gloss: "year", freq: 49, tier: "memorize", icon: "📅", mn: "EH-tos → \"a TOSS.\" You TOSS the old calendar every YEAR." },
      { g: "εὐδοκέω", gloss: "I am well pleased, approve", freq: 21, tier: "memorize", icon: "😊", mn: "ev-tho-KEH-o → \"EV'RY THOUGHT is OKAY.\" I am WELL PLEASED." },
      { g: "Ἠσαΐας, ὁ", gloss: "Isaiah", freq: 22, tier: "memorize", icon: "📜", mn: "ay-sah-EE-ahs → \"say AH — EE — AHS.\" That is ISAIAH." },
      { g: "θηρίον, τό", gloss: "animal, beast", freq: 46, tier: "memorize", icon: "🦁", mn: "THAY-ree-on → \"THEY'RE ON me!\" The wild BEASTS are on me." },
      { g: "θλῖψις, -εως, ἡ", gloss: "tribulation, affliction, oppression", freq: 45, tier: "memorize", icon: "😰", mn: "THLEEP-sees → \"THE LIPS SQUEEZE.\" Squeezed and pressed: TRIBULATION." },
      { g: "θρίξ, τριχός, ἡ", gloss: "hair", freq: 15, tier: "memorize", icon: "💇", mn: "THREEKS → \"TRICKS.\" The magician's TRICK pulls HAIR from the hat." },
      { g: "ἱκανός", gloss: "qualified, able", freq: 39, tier: "memorize", icon: "✅", mn: "hee-kah-NOS → \"HE CAN — OS!\" He CAN do it: ABLE, qualified." },
      { g: "Ἰορδάνης, -ου, ὁ", gloss: "the Jordan", freq: 15, tier: "memorize", icon: "🏞️", mn: "ee-or-THAH-nays → \"YOUR DAN-ees.\" Your Dan wades the JORDAN." },
      { g: "ἰσχυρός", gloss: "strong, mighty, powerful", freq: 29, tier: "memorize", icon: "💪", mn: "ees-KHEW-ros → \"IS CURE-ROSE.\" A cure that STRONG makes you rise." },
      { g: "καθίζω", gloss: "I cause to sit down, appoint", freq: 46, tier: "memorize", icon: "🪑", mn: "kah-THEE-zo → \"CATHY SO...\" Cathy, SIT DOWN." },
      { g: "κρατέω", gloss: "I grasp, hold (fast), arrest", freq: 47, tier: "memorize", icon: "✊", mn: "krah-TEH-o → \"a CRATE — oh!\" Grab the crate and HOLD it fast." },
      { g: "μετάνοια, ἡ", gloss: "repentance", freq: 22, tier: "memorize", icon: "🔄", mn: "meh-tah-NEW-ah → \"ME? A NEW ah!\" A NEW mind: REPENTANCE." },
      { g: "ναός, ὁ", gloss: "temple, sanctuary", freq: 45, tier: "memorize", icon: "🏛️", mn: "nah-OS → \"NOAH'S.\" Noah's holy house: the TEMPLE." },
      { g: "ὅμοιος", gloss: "like, similar", freq: 45, tier: "memorize", icon: "🟰", mn: "ho-MEW-os → \"HOME EWES.\" Two ewes at home look ALIKE." },
      { g: "ὀπίσω", gloss: "after, behind", freq: 35, tier: "memorize", icon: "👣", mn: "o-PEE-so → \"a PEA, SO far back.\" It rolled BEHIND you." },
      { g: "οὐαί", gloss: "woe", freq: 46, tier: "memorize", icon: "😱", mn: "oo-EH → \"oo-AY!\" It is a wail out loud: WOE!" },
      { g: "οὐκέτι", gloss: "no longer", freq: 47, tier: "memorize", icon: "🚫", mn: "oo-KEH-tee → \"a COOKIE?\" NO LONGER any left." },
      { g: "πειράζω", gloss: "I tempt, test", freq: 38, tier: "memorize", icon: "🎣", mn: "pee-RAH-zo → \"PIRATES-o.\" The pirate TEMPTS you to test him." },
      { g: "ποταμός, ὁ", gloss: "river", freq: 17, tier: "memorize", icon: "🌊", mn: "po-tah-MOS → \"a POT o' MOSS.\" It floats down the RIVER." },
      { g: "πρό", gloss: "before, in front of, at (+ gen.)", freq: 47, tier: "memorize", icon: "⏪", mn: "PRO → \"a PRO.\" The pro goes BEFORE the rookie." },
      { g: "προσφέρω", gloss: "I bring to, offer", freq: 47, tier: "memorize", icon: "🎁", mn: "pros-FEH-ro → \"the PROS FERRY it.\" They carry it over and OFFER it." },
      { g: "Σατανᾶς, -ᾶ, ὁ", gloss: "Satan", freq: 36, tier: "memorize", icon: "😈", mn: "sah-tah-NAHS → \"SATAN-as.\" The accuser himself." },
      { g: "σταυρόω", gloss: "I crucify", freq: 46, tier: "memorize", icon: "✝️", mn: "STAV-ro-o → \"STAB a ROW.\" A row of wood, and they CRUCIFY him on it." },
      { g: "τεσσεράκοντα", gloss: "forty", freq: 22, tier: "memorize", icon: "4️⃣", mn: "tehs-seh-rah-KON-tah → \"TESS and SARAH COUNT-ah.\" They count to FORTY." },
      { g: "φυλακή, ἡ", gloss: "watch, guard, prison", freq: 47, tier: "memorize", icon: "🔒", mn: "few-lah-KAY → \"a FEW LOCKED, KAY.\" A few are locked in the PRISON, Kay." },
      { g: "χώρα, ἡ", gloss: "district, region", freq: 28, tier: "memorize", icon: "🗺️", mn: "KHO-rah → \"CORA.\" Cora owns the whole REGION." },
      // ---- Vocabulary to Recognize ----
      { g: "ἄγριος", gloss: "wild", freq: 3, tier: "recognize", icon: "🌿", mn: "AH-ghree-os → \"ANGRY-os.\" Angry and untamed: WILD." },
      { g: "ἀκρίς, -ίδος, ἡ", gloss: "locust", freq: 4, tier: "recognize", icon: "🦗", mn: "ah-KREES → \"a CRISP.\" John ate the LOCUST crisp." },
      { g: "βοάω", gloss: "I call, shout, cry out", freq: 12, tier: "recognize", icon: "📣", mn: "vo-AH-o → \"WHOA — AH — OH!\" All shouting: he CRIES OUT." },
      { g: "δερμάτινος", gloss: "(made of) leather", freq: 2, tier: "recognize", icon: "🧥", mn: "thehr-mah-TEE-nos → \"THERMAL.\" His thermal belt is made of LEATHER." },
      { g: "ἐξομολογέω", gloss: "I confess, admit", freq: 10, tier: "recognize", icon: "🙏", mn: "ehx-o-mo-lo-GHEH-o → \"EGGS — o — he LOGS it.\" He LOGS it out loud: CONFESS." },
      { g: "εὐθύς", gloss: "straight", freq: 8, tier: "recognize", icon: "📏", mn: "ev-THEWS → \"EV'RY THUS.\" Every thus goes STRAIGHT ahead." },
      { g: "ζώνη, ἡ", gloss: "belt", freq: 8, tier: "recognize", icon: "🎽", mn: "ZO-nay → \"a ZONE.\" The BELT is the zone round your waist." },
      { g: "Ἱεροσολυμίτης, -ου, ὁ", gloss: "inhabitant of Jerusalem", freq: 2, tier: "recognize", icon: "🏙️", mn: "hee-eh-ro-so-lew-MEE-tays → \"HIERO-SOLYM-ite.\" A JERUSALEM-ite." },
      { g: "ἱμάς, -άντος, ὁ", gloss: "strap, thong", freq: 4, tier: "recognize", icon: "🪢", mn: "hee-MAHS → \"HE MASHED it.\" He mashed the sandal STRAP." },
      { g: "κάμηλος, ὁ", gloss: "camel", freq: 6, tier: "recognize", icon: "🐪", mn: "kah-MAY-los → \"CAMEL-os.\" It is simply the CAMEL." },
      { g: "κατασκευάζω", gloss: "I make ready, prepare", freq: 11, tier: "recognize", icon: "🔨", mn: "kah-tah-SKEV-ah-zo → \"CUT and SKEWER.\" Cut it, skewer it, PREPARE the feast." },
      { g: "κύπτω", gloss: "I bend down", freq: 2, tier: "recognize", icon: "🙇", mn: "KEWP-to → \"he CUPPED to.\" He cupped himself low: BEND DOWN." },
      { g: "μέλι, -ιτος, τό", gloss: "honey", freq: 4, tier: "recognize", icon: "🍯", mn: "MEH-lee → \"MEL-ly.\" Mel loves his HONEY." },
      { g: "Ναζαρέτ, ἡ", gloss: "Nazareth", freq: 12, tier: "recognize", icon: "🏘️", mn: "nah-zah-REHT → \"NAZARETH.\" The town itself." },
      { g: "ὀσφῦς, ἡ", gloss: "waist", freq: 8, tier: "recognize", icon: "🧍", mn: "os-FEWS → \"OS — a FEW.\" A few bones at the WAIST." },
      { g: "περιστερά, ἡ", gloss: "dove, pigeon", freq: 10, tier: "recognize", icon: "🕊️", mn: "peh-ree-steh-RAH → \"PERRY'S STAIR-ah.\" A DOVE lands on Perry's stair." },
      { g: "σχίζω", gloss: "I split, divide, separate, tear apart", freq: 11, tier: "recognize", icon: "✂️", mn: "SKHEE-zo → \"SKIS-o.\" The skis SPLIT the snow apart." },
      { g: "τρίβος, ἡ", gloss: "path", freq: 3, tier: "recognize", icon: "🛤️", mn: "TREE-vos → \"TREES.\" The PATH runs between the trees." },
      { g: "ὑπόδημα, -ατος, τό", gloss: "sandal", freq: 10, tier: "recognize", icon: "👡", mn: "hew-po-THAY-mah → \"WHO PUT THEM on?\" The SANDALS, of course." }
    ]
  }
];
