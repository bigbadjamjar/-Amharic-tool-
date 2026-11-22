/* ---------- everyday Amharic: telling the time, prices, dates ----------
   Words and set phrases for the "Everyday" drills on the Test tab (js/drills.js).
   Every Amharic string is written out in full here so that tools/make_audio.py finds it
   and makes a clip for it. Longer phrases (a time, a price, a date) are played as a chain
   of these pieces, so each piece needs its own clip. */
const EV = {
  // Parts of the day, by the Western clock: [Amharic, transcription, English, from hour, to hour]
  parts: [
    ["ሌሊት", "lélit", "at night", 0, 5],
    ["ጠዋት", "t'ewat", "in the morning", 6, 11],
    ["ቀን", "qen", "at midday", 12, 12],
    ["ከሰዓት በኋላ", "kese'at behwala", "in the afternoon", 13, 17],
    ["ማታ", "mata", "in the evening", 18, 23]
  ],
  // Ethiopian hours 1 to 12: "one o'clock" is the first hour after sunrise (7 am)
  hours: [
    ["አንድ ሰዓት", "and se'at"], ["ሁለት ሰዓት", "hulett se'at"], ["ሦስት ሰዓት", "sost se'at"],
    ["አራት ሰዓት", "aratt se'at"], ["አምስት ሰዓት", "ammist se'at"], ["ስድስት ሰዓት", "siddist se'at"],
    ["ሰባት ሰዓት", "sebatt se'at"], ["ስምንት ሰዓት", "simmint se'at"], ["ዘጠኝ ሰዓት", "zet'egn se'at"],
    ["አሥር ሰዓት", "assir se'at"], ["አሥራ አንድ ሰዓት", "asra and se'at"], ["አሥራ ሁለት ሰዓት", "asra hulett se'at"]
  ],
  // "quarter to" names the coming hour: ለአራት ሩብ ጉዳይ = a quarter short of four
  qto: [
    ["ለአንድ ሩብ ጉዳይ", "le'and rub gudday"], ["ለሁለት ሩብ ጉዳይ", "lehulett rub gudday"], ["ለሦስት ሩብ ጉዳይ", "lesost rub gudday"],
    ["ለአራት ሩብ ጉዳይ", "le'aratt rub gudday"], ["ለአምስት ሩብ ጉዳይ", "le'ammist rub gudday"], ["ለስድስት ሩብ ጉዳይ", "lesiddist rub gudday"],
    ["ለሰባት ሩብ ጉዳይ", "lesebatt rub gudday"], ["ለስምንት ሩብ ጉዳይ", "lesimmint rub gudday"], ["ለዘጠኝ ሩብ ጉዳይ", "lezet'egn rub gudday"],
    ["ለአሥር ሩብ ጉዳይ", "le'assir rub gudday"], ["ለአሥራ አንድ ሩብ ጉዳይ", "le'asra and rub gudday"], ["ለአሥራ ሁለት ሩብ ጉዳይ", "le'asra hulett rub gudday"]
  ],
  half: ["ተኩል", "tekul"],
  quarter: ["ከሩብ", "kerub"],
  timeWords: [
    ["ስንት ሰዓት ነው?", "sint se'at new?", "What time is it?"],
    ["ሰዓት", "se'at", "hour; o'clock; a clock or watch"],
    ["ደቂቃ", "deqiqa", "minute"],
    ["ተኩል", "tekul", "half past"],
    ["ከሩብ", "kerub", "quarter past"],
    ["ሩብ ጉዳይ", "rub gudday", "quarter to"],
    ["በስንት ሰዓት?", "besint se'at?", "At what time?"],
    ["በፈረንጅ ሰዓት", "beferenj se'at", "by the Western clock"],
    ["በኢትዮጵያ ሰዓት", "be'ityop'ya se'at", "by the Ethiopian clock"]
  ],

  // Things to buy, with a believable price range in birr (examples only; prices change)
  items: [
    ["ቡና", "buna", "a coffee", 30, 60],
    ["ሻይ", "shay", "a tea", 20, 40],
    ["ዳቦ", "dabo", "a loaf of bread", 10, 30],
    ["ውሃ", "wiha", "a bottle of water", 25, 45],
    ["አንድ ኪሎ ሙዝ", "and kilo muz", "a kilo of bananas", 50, 90],
    ["አንድ ኪሎ ቲማቲም", "and kilo timatim", "a kilo of tomatoes", 40, 80],
    ["እንቁላል", "inqulal", "an egg", 12, 20],
    ["ሽሮ", "shiro", "a plate of shiro", 150, 300],
    ["ታክሲ", "taksi", "a minibus ride", 15, 40],
    ["መጽሐፍ", "mets'haf", "a book", 300, 900],
    ["ጫማ", "ch'amma", "a pair of shoes", 1200, 4000]
  ],
  birr: ["ብር", "birr"],
  // number words that prices, times and dates are built from (each needs its own clip)
  numberPieces: ["አንድ", "ሁለት", "ሦስት", "አራት", "አምስት", "ስድስት", "ሰባት", "ስምንት", "ዘጠኝ", "አሥር", "አሥራ",
    "ሃያ", "ሠላሳ", "አርባ", "ሃምሳ", "ስልሳ", "ሰባ", "ሰማንያ", "ዘጠና", "መቶ", "ሺ"],
  // cents after a whole number of birr: ሃያ ብር ከሃምሳ ሳንቲም = 20.50 birr
  cents: [
    [25, "ከሃያ አምስት ሳንቲም", "kehaya ammist santim"],
    [50, "ከሃምሳ ሳንቲም", "kehamsa santim"],
    [75, "ከሰባ አምስት ሳንቲም", "keseba ammist santim"]
  ],
  shop: [
    ["ስንት ነው?", "sint new?", "How much is it?"],
    ["ይህ ስንት ነው?", "yih sint new?", "How much is this one?"],
    ["ዋጋው ስንት ነው?", "wagaw sint new?", "What's the price?"],
    ["ውድ ነው", "wid new", "It's expensive"],
    ["ርካሽ ነው", "rikash new", "It's cheap"],
    ["ቀንሱልኝ", "qenisullign", "Bring the price down for me"],
    ["የመጨረሻ ዋጋ ስንት ነው?", "yemech'eresha waga sint new?", "What's your lowest price?"],
    ["ዝርዝር አለህ?", "zirzir alleh?", "Do you have change? (to a man)"],
    ["መልስ", "mels", "change (money back)"],
    ["እሺ፣ እወስዳለሁ", "ishi, iwesdallehu", "OK, I'll take it"],
    ["አይ፣ በቃ", "ay, beqa", "No, never mind"],
    ["ሂሳብ", "hisab", "the bill"]
  ],

  // The 13 months of the Ethiopian calendar, in order
  months: [
    ["መስከረም", "meskerem"], ["ጥቅምት", "t'iqimt"], ["ኅዳር", "hidar"], ["ታኅሣሥ", "tahsas"], ["ጥር", "t'ir"],
    ["የካቲት", "yekatit"], ["መጋቢት", "megabit"], ["ሚያዝያ", "miyazya"], ["ግንቦት", "ginbot"], ["ሰኔ", "sené"],
    ["ሐምሌ", "hamlé"], ["ነሐሴ", "nehasé"], ["ጳጉሜ", "p'agumé"]
  ],
  // Days of the week, Sunday first (the same order as JavaScript's getDay())
  days: [
    ["እሑድ", "ihud", "Sunday"], ["ሰኞ", "segno", "Monday"], ["ማክሰኞ", "maksegno", "Tuesday"], ["ረቡዕ", "rebu'", "Wednesday"],
    ["ሐሙስ", "hamus", "Thursday"], ["ዓርብ", "arb", "Friday"], ["ቅዳሜ", "qidamé", "Saturday"]
  ],
  dateWords: [
    ["ዛሬ ስንት ነው?", "zaré sint new?", "What's the date today?"],
    ["ዛሬ ምን ቀን ነው?", "zaré min qen new?", "What day is it today?"],
    ["ቀን", "qen", "day; date"],
    ["ሳምንት", "samint", "week"],
    ["ወር", "wer", "month"],
    ["ዓመት", "amet", "year"],
    ["ዓ.ም.", "amete mihret", "Ethiopian year (after a date)"],
    ["የልደት ቀን", "yelidet qen", "birthday"],
    ["በዓል", "be'al", "holiday, festival"]
  ],
  // Fixed holidays: [Amharic, transcription, English, Ethiopian month, day]
  holidays: [
    ["እንቁጣጣሽ", "inqut'at'ash", "New Year", 1, 1],
    ["መስቀል", "meskel", "Meskel (Finding of the True Cross)", 1, 17],
    ["ገና", "genna", "Christmas", 4, 29],
    ["ጥምቀት", "t'imqet", "Timket (Epiphany)", 5, 11]
  ]
};
