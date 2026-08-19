// ============================================================
// Greek Vocabulary Database
// ------------------------------------------------------------
// Each set has: id, source, title, and words.
// Each word: g (Greek lexical form), gloss (English), freq (NT
// frequency count from the workbook), tier ('memorize' | 'recognize').
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
      { g: "ἀπαγγέλλω", gloss: "I announce, proclaim, report", freq: 45, tier: "memorize" },
      { g: "ἀποδίδωμι", gloss: "I give away, pay, return", freq: 48, tier: "memorize" },
      { g: "ἄρα", gloss: "so, then, consequently", freq: 49, tier: "memorize" },
      { g: "ἄφεσις, -εως, ἡ", gloss: "forgiveness", freq: 17, tier: "memorize" },
      { g: "ἄχρι", gloss: "until (conj. or prep. + gen.)", freq: 49, tier: "memorize" },
      { g: "βάπτισμα, -ατος, τό", gloss: "baptism", freq: 19, tier: "memorize" },
      { g: "δεύτερος", gloss: "second", freq: 43, tier: "memorize" },
      { g: "διακονέω", gloss: "I serve", freq: 37, tier: "memorize" },
      { g: "διέρχομαι", gloss: "I go through, cross over", freq: 43, tier: "memorize" },
      { g: "ἐκπορεύομαι", gloss: "I go out, come out", freq: 33, tier: "memorize" },
      { g: "ἐνδύω", gloss: "I clothe myself, put on, wear", freq: 27, tier: "memorize" },
      { g: "ἐπιγινώσκω", gloss: "I know, understand, recognize", freq: 44, tier: "memorize" },
      { g: "ἔρημος, ἡ", gloss: "desert, wilderness", freq: 48, tier: "memorize" },
      { g: "ἑτοιμάζω", gloss: "I make ready, prepare", freq: 40, tier: "memorize" },
      { g: "ἔτος, -ους, τό", gloss: "year", freq: 49, tier: "memorize" },
      { g: "εὐδοκέω", gloss: "I am well pleased, approve", freq: 21, tier: "memorize" },
      { g: "Ἠσαΐας, ὁ", gloss: "Isaiah", freq: 22, tier: "memorize" },
      { g: "θηρίον, τό", gloss: "animal, beast", freq: 46, tier: "memorize" },
      { g: "θλῖψις, -εως, ἡ", gloss: "tribulation, affliction, oppression", freq: 45, tier: "memorize" },
      { g: "θρίξ, τριχός, ἡ", gloss: "hair", freq: 15, tier: "memorize" },
      { g: "ἱκανός", gloss: "qualified, able", freq: 39, tier: "memorize" },
      { g: "Ἰορδάνης, -ου, ὁ", gloss: "the Jordan", freq: 15, tier: "memorize" },
      { g: "ἰσχυρός", gloss: "strong, mighty, powerful", freq: 29, tier: "memorize" },
      { g: "καθίζω", gloss: "I cause to sit down, appoint", freq: 46, tier: "memorize" },
      { g: "κρατέω", gloss: "I grasp, hold (fast), arrest", freq: 47, tier: "memorize" },
      { g: "μετάνοια, ἡ", gloss: "repentance", freq: 22, tier: "memorize" },
      { g: "ναός, ὁ", gloss: "temple, sanctuary", freq: 45, tier: "memorize" },
      { g: "ὅμοιος", gloss: "like, similar", freq: 45, tier: "memorize" },
      { g: "ὀπίσω", gloss: "after, behind", freq: 35, tier: "memorize" },
      { g: "οὐαί", gloss: "woe", freq: 46, tier: "memorize" },
      { g: "οὐκέτι", gloss: "no longer", freq: 47, tier: "memorize" },
      { g: "πειράζω", gloss: "I tempt, test", freq: 38, tier: "memorize" },
      { g: "ποταμός, ὁ", gloss: "river", freq: 17, tier: "memorize" },
      { g: "πρό", gloss: "before, in front of, at (+ gen.)", freq: 47, tier: "memorize" },
      { g: "προσφέρω", gloss: "I bring to, offer", freq: 47, tier: "memorize" },
      { g: "Σατανᾶς, -ᾶ, ὁ", gloss: "Satan", freq: 36, tier: "memorize" },
      { g: "σταυρόω", gloss: "I crucify", freq: 46, tier: "memorize" },
      { g: "τεσσεράκοντα", gloss: "forty", freq: 22, tier: "memorize" },
      { g: "φυλακή, ἡ", gloss: "watch, guard, prison", freq: 47, tier: "memorize" },
      { g: "χώρα, ἡ", gloss: "district, region", freq: 28, tier: "memorize" },
      // ---- Vocabulary to Recognize ----
      { g: "ἄγριος", gloss: "wild", freq: 3, tier: "recognize" },
      { g: "ἀκρίς, -ίδος, ἡ", gloss: "locust", freq: 4, tier: "recognize" },
      { g: "βοάω", gloss: "I call, shout, cry out", freq: 12, tier: "recognize" },
      { g: "δερμάτινος", gloss: "(made of) leather", freq: 2, tier: "recognize" },
      { g: "ἐξομολογέω", gloss: "I confess, admit", freq: 10, tier: "recognize" },
      { g: "εὐθύς", gloss: "straight", freq: 8, tier: "recognize" },
      { g: "ζώνη, ἡ", gloss: "belt", freq: 8, tier: "recognize" },
      { g: "Ἱεροσολυμίτης, -ου, ὁ", gloss: "inhabitant of Jerusalem", freq: 2, tier: "recognize" },
      { g: "ἱμάς, -άντος, ὁ", gloss: "strap, thong", freq: 4, tier: "recognize" },
      { g: "κάμηλος, ὁ", gloss: "camel", freq: 6, tier: "recognize" },
      { g: "κατασκευάζω", gloss: "I make ready, prepare", freq: 11, tier: "recognize" },
      { g: "κύπτω", gloss: "I bend down", freq: 2, tier: "recognize" },
      { g: "μέλι, -ιτος, τό", gloss: "honey", freq: 4, tier: "recognize" },
      { g: "Ναζαρέτ, ἡ", gloss: "Nazareth", freq: 12, tier: "recognize" },
      { g: "ὀσφῦς, ἡ", gloss: "waist", freq: 8, tier: "recognize" },
      { g: "περιστερά, ἡ", gloss: "dove, pigeon", freq: 10, tier: "recognize" },
      { g: "σχίζω", gloss: "I split, divide, separate, tear apart", freq: 11, tier: "recognize" },
      { g: "τρίβος, ἡ", gloss: "path", freq: 3, tier: "recognize" },
      { g: "ὑπόδημα, -ατος, τό", gloss: "sandal", freq: 10, tier: "recognize" }
    ]
  }
];
