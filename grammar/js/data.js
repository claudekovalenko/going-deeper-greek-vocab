// Case-use concepts from the Going Deeper syntax notes.
const CONCEPTS = [
  { id:"nom-subject", case:"Nominative", group:"Major uses", name:"Subject",
    tag:"does the verb",
    def:"The nominative that performs the action of the verb.",
    tell:"Ask who or what is doing the verb. That word is the subject.",
    examples:[{t:"John (Ἰωάννης) bearing witness", n:"John 1 — Ioannes is the one doing the witnessing"}] },

  { id:"nom-pred", case:"Nominative", group:"Major uses", name:"Predicate Nominative",
    tag:"linked by a to-be verb",
    def:"Two nominatives joined by a copulative (to-be) verb. The predicate nominative asserts something about the subject.",
    tell:"Look for a to-be verb between two nominatives. If it is there, one is the subject and the other is the predicate.",
    examples:[
      {t:"\"The Word was God\"", gk:"θεὸς ἦν ὁ λόγος", n:"John 1:1"},
      {t:"\"God is love\"", gk:"ὁ θεὸς ἀγάπη ἐστίν"},
      {t:"\"He is our peace\"", gk:"αὐτός ἐστιν ἡ εἰρήνη ἡμῶν"},
      {t:"\"Ivan is the student\"", n:"a to-be verb — so predicate nominative, not apposition"}] },

  { id:"nom-appos", case:"Nominative", group:"Major uses", name:"Apposition",
    tag:"elaborates, no verb",
    def:"Two nominatives where the second elaborates the first, with no to-be verb present. Diagrammed with an equals sign.",
    tell:"Two nominatives side by side and NO verb between them. That absence is the whole test.",
    examples:[
      {t:"\"Andrew, the brother of Simon Peter\"", gk:"Ἀνδρέας ὁ ἀδελφὸς Σίμωνος Πέτρου", n:"brother is the appositive — no verb present"},
      {t:"\"Paul, a servant of Christ Jesus\"", gk:"Παῦλος δοῦλος Χριστοῦ Ἰησοῦ", n:"δοῦλος stands in apposition to Paul"},
      {t:"\"Ivan, the student, came to class\"", n:"contrast with \"Ivan IS the student\""}] },

  { id:"nom-address", case:"Nominative", group:"Other uses", name:"Nominative of Address",
    tag:"calls out to someone",
    def:"A nominative doing the work of a vocative — direct address — while staying grammatically nominative.",
    tell:"Is the word being spoken TO rather than spoken ABOUT? It is the logical subject but not the grammatical one.",
    examples:[
      {t:"\"Son of David, have mercy on us\"", gk:"υἱὸς Δαυίδ, ἐλέησον ἡμᾶς", n:"Matt. 9:27 — addressing Jesus, not the subject of the verb"},
      {t:"\"Husbands, love your wives\"", gk:"οἱ ἄνδρες, ἀγαπᾶτε τὰς γυναῖκας", n:"Eph. 5 — calling out to them, not a statement about them"}] },

  { id:"nom-appell", case:"Nominative", group:"Other uses", name:"Nominative of Appellation",
    tag:"a title used as a name",
    def:"A title functioning as a personal name, kept in the nominative.",
    tell:"Is the word a title being used the way a name would be used? Simplest of the other uses.",
    examples:[{t:"\"You call me Teacher and Lord\"", gk:"φωνεῖτέ με ὁ διδάσκαλος καὶ ὁ κύριος", n:"John 13:13 — both are titles doing the work of names"}] },

  { id:"nom-abs", case:"Nominative", group:"Other uses", name:"Nominative Absolute",
    tag:"stands entirely alone",
    def:"Grammatically independent from the rest of the sentence. Typically found in introductory material.",
    tell:"No grammatical connection at all to what follows — and check whether you are in a heading or salutation.",
    examples:[
      {t:"\"The beginning of the gospel...\"", gk:"Ἀρχὴ τοῦ εὐαγγελίου Ἰησοῦ Χριστοῦ", n:"Mark 1:1 — ἀρχή stands alone; everything after is genitive"},
      {t:"\"Grace, mercy, peace...\"", gk:"χάρις, ἔλεος, εἰρήνη", n:"1 Tim. 1:2 — introductory, grammatically independent"}] },

  { id:"nom-hang", case:"Nominative", group:"Other uses", name:"Hanging Nominative",
    tag:"logically linked, grammatically loose",
    def:"Like the absolute, but logically connected to the rest — the logical subject is picked up by a pronoun in the clause that follows.",
    tell:"Grammatically detached, but a pronoun later in the sentence points back to it. That pronoun is the giveaway.",
    examples:[{t:"\"The good seed — these are the sons of the kingdom\"", gk:"τὸ καλὸν σπέρμα, οὗτοί εἰσιν οἱ υἱοὶ τῆς βασιλείας", n:"Matt. 13:38 — σπέρμα is loose, but \"these\" refers back to it"}] },

  { id:"acc-do", case:"Accusative", group:"Substantival", name:"Direct Object",
    tag:"receives the action",
    def:"The most common use: the accusative that receives the action of the verb.",
    tell:"Ask the verb \"whom?\" or \"what?\" The answer is the direct object.",
    examples:[{t:"\"I hit Ivan\""}] },

  { id:"acc-cog", case:"Accusative", group:"Substantival", name:"Cognate Accusative",
    tag:"same root as its verb",
    def:"A direct object sharing the lexical root or the concept of the verb it follows.",
    tell:"Do the verb and its object echo each other? Sing a song, shepherd a flock.",
    examples:[
      {t:"\"I sing a song\""},
      {t:"\"I shepherd sheep\""},
      {t:"\"Fight the good fight\"", gk:"στρατεύῃ τὴν καλὴν στρατείαν", n:"1 Tim. 1:18"}] },

  { id:"acc-double", case:"Accusative", group:"Substantival", name:"Double Accusative",
    tag:"two accusatives, one clause",
    def:"Two accusatives in a single clause, in one of two patterns: personal + impersonal object, or object + predicate complement.",
    tell:"Count the accusatives. Two? Then ask whether the second names a second thing, or says what the first BECOMES.",
    examples:[
      {t:"\"If his son asks him for bread\"", n:"personal (him) + impersonal (bread)"},
      {t:"\"He gave his life as a ransom\"", gk:"δοῦναι τὴν ψυχὴν αὐτοῦ λύτρον", n:"object (life) + complement (λύτρον, ransom)"}] },

  { id:"acc-inf", case:"Accusative", group:"Substantival", name:"Accusative Subject of Infinitive",
    tag:"subject of an infinitive",
    def:"An infinitive takes its subject in the accusative — unlike a finite verb, whose subject is nominative.",
    tell:"Find an infinitive, then look for the accusative doing it. Finite verb takes a nominative subject; an infinitive takes an accusative one.",
    examples:[{t:"An accusative standing as the one performing the infinitive"}] },

  { id:"acc-appos", case:"Accusative", group:"Substantival", name:"Accusative of Apposition",
    tag:"elaborates an accusative",
    def:"The same idea as nominative apposition, carried out in the accusative case.",
    tell:"Two accusatives, the second renaming the first, with no verb between.",
    examples:[
      {t:"\"They chose Stephen, a man full of faith\"", gk:"ἐξελέξαντο Στέφανον, ἄνδρα πλήρη πίστεως", n:"Stephen is the direct object; ἄνδρα stands in apposition"},
      {t:"\"He will shepherd my people, Israel\"", gk:"ποιμανεῖ τὸν λαόν μου τὸν Ἰσραήλ", n:"Israel apposits people"}] },

  { id:"acc-measure", case:"Accusative", group:"Adverbial", name:"Accusative of Measure",
    tag:"how far, how long",
    def:"Expresses extent or degree — of space or of time.",
    tell:"Does it answer how far or how long? That is measure.",
    examples:[{t:"\"Going a little farther\"", gk:"προβὰς μικρόν", n:"μικρόν — extent of space"}] },

  { id:"acc-manner", case:"Accusative", group:"Adverbial", name:"Accusative of Manner",
    tag:"how it happened",
    def:"Describes the way in which the action occurs.",
    tell:"Does it answer HOW? Try turning it into an English adverb.",
    examples:[{t:"\"They are justified freely by His grace\"", gk:"δικαιούμενοι δωρεὰν τῇ αὐτοῦ χάριτι", n:"Rom. 3:24 — δωρεάν, freely, as a gift"}] },

  { id:"acc-respect", case:"Accusative", group:"Adverbial", name:"Accusative of Respect",
    tag:"with reference to",
    def:"Limits the scope of the verb — the action is true with reference to this one thing.",
    tell:"Try supplying \"with reference to\" or \"concerning\". If the sentence suddenly makes sense, it is respect.",
    examples:[{t:"\"They were cut with respect to the heart\"", gk:"κατενύγησαν τὴν καρδίαν", n:"Acts 2:37 — not a physical piercing but an inner one"}] }
];

// The rule for telling subject from predicate when two nominatives appear.
const PECKING_ORDER = {
  title: "Which nominative is the subject?",
  intro: "When two nominatives are joined by a to-be verb, work down this order. The first match is your subject.",
  steps: [
    { n:"1", label:"A pronoun", body:"A pronoun takes precedence over everything else." },
    { n:"2", label:"The one with the article", body:"If neither is a pronoun, the articular nominative is the subject." },
    { n:"3", label:"A proper name", body:"Failing both of the above, a proper name is the subject." }
  ],
  application: {
    ref:"John 1:1 — καὶ θεὸς ἦν ὁ λόγος",
    body:"ὁ λόγος carries the article, so it is the subject. θεός has no article and is the predicate nominative.",
    caution:"That anarthrous θεός does NOT make it \"a god.\" In Greek a word without the article can still be definite."
  }
};

// Example → which use. This is the skill that gets tested.
const IDENTIFY = [
  { q:"\"The Word was God\"", a:"nom-pred", why:"Two nominatives joined by a to-be verb." },
  { q:"\"God is love\"", a:"nom-pred", why:"A to-be verb links the two nominatives." },
  { q:"\"He is our peace\"", a:"nom-pred", why:"Copulative verb between two nominatives." },
  { q:"\"Ivan is the student\"", a:"nom-pred", why:"The to-be verb makes it predicate, not apposition." },
  { q:"\"Ivan, the student, came to class\"", a:"nom-appos", why:"No to-be verb — the second simply elaborates the first." },
  { q:"\"Andrew, the brother of Simon Peter\"", a:"nom-appos", why:"No verb present; brother elaborates Andrew." },
  { q:"\"Paul, a servant of Christ Jesus\"", a:"nom-appos", why:"δοῦλος elaborates Paul, with no verb." },
  { q:"\"Son of David, have mercy on us\"", a:"nom-address", why:"Jesus is being spoken to, not described." },
  { q:"\"Husbands, love your wives\"", a:"nom-address", why:"It calls out to them rather than stating something about them." },
  { q:"\"You call me Teacher and Lord\"", a:"nom-appell", why:"Titles doing the work of names." },
  { q:"\"The beginning of the gospel of Jesus Christ\"", a:"nom-abs", why:"Mark 1:1 — ἀρχή stands grammatically alone in a heading." },
  { q:"\"Grace, mercy, peace from God our Father\"", a:"nom-abs", why:"Introductory material, grammatically independent." },
  { q:"\"The good seed — these are the sons of the kingdom\"", a:"nom-hang", why:"Grammatically loose, but \"these\" points back to it." },
  { q:"\"I hit Ivan\"", a:"acc-do", why:"Ivan simply receives the action." },
  { q:"\"Fight the good fight\"", a:"acc-cog", why:"The object repeats the root of its own verb." },
  { q:"\"I shepherd a flock\"", a:"acc-cog", why:"Object and verb share the same concept." },
  { q:"\"If his son asks him for bread\"", a:"acc-double", why:"Personal object plus impersonal object." },
  { q:"\"He gave his life as a ransom\"", a:"acc-double", why:"Direct object plus a predicate complement." },
  { q:"\"They chose Stephen, a man full of faith\"", a:"acc-appos", why:"ἄνδρα renames the direct object." },
  { q:"\"He will shepherd my people, Israel\"", a:"acc-appos", why:"Israel renames people." },
  { q:"\"Going a little farther\"", a:"acc-measure", why:"μικρόν answers how far." },
  { q:"\"They are justified freely by His grace\"", a:"acc-manner", why:"δωρεάν answers how." },
  { q:"\"They were cut to the heart\"", a:"acc-respect", why:"Supply \"with reference to\" and it resolves." }
];

// The pairs that actually get confused.
const CONTRASTS = [
  { a:"nom-pred", b:"nom-appos", key:"Is there a to-be verb?",
    left:"\"Ivan IS the student\" — a copulative verb links them.",
    right:"\"Ivan, THE STUDENT, came to class\" — no verb, just elaboration." },
  { a:"nom-abs", b:"nom-hang", key:"Does anything later point back to it?",
    left:"Absolute: no connection at all to the rest of the sentence.",
    right:"Hanging: no grammatical link, but a pronoun later refers back to it." },
  { a:"nom-subject", b:"nom-address", key:"Spoken about, or spoken to?",
    left:"Subject: the word performs the verb.",
    right:"Address: the word is being called out to — logical subject, not grammatical." },
  { a:"acc-do", b:"acc-cog", key:"Does the object echo its verb?",
    left:"Direct object: \"I hit Ivan\" — unrelated noun.",
    right:"Cognate: \"Fight the good fight\" — same root or concept." },
  { a:"acc-appos", b:"acc-double", key:"Renaming, or a second item?",
    left:"Apposition: \"Stephen, a man full of faith\" — one person, named twice.",
    right:"Double: \"asks him for bread\" — two distinct things." }
];
