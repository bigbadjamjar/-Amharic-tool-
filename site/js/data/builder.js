/* ---------- sentence builder: words for the made-up sentences ----------
   The builder makes short sentences of the shape  [who] [when] [what] [verb]
   and asks the learner to build them one word at a time from multiple choice.
   The verb is conjugated by the engine (engine.js); everything else comes from here.
   None of these sentences have been checked by a native speaker yet.

   BVERBS: [verb head (as in verbs.js), English base, -s form, past, object set or ""]
   The English is only used to write the prompt, e.g. "She did not drink coffee yesterday". */
const BVERBS = [
  ["bälla","eat","eats","ate","food"],
  ["ṭäṭṭa","drink","drinks","drank","drink"],
  ["gäzza","buy","buys","bought","buy"],
  ["šäṭä","sell","sells","sold","sell"],
  ["anäbbäbä","read","reads","read","read"],
  ["ṣafä","write","writes","wrote","write"],
  ["tämarä","study","studies","studied","lang"],
  ["tänaggärä","speak","speaks","spoke","lang"],
  ["sämma","hear","hears","heard","hear"],
  ["hedä","go","goes","went",""],
  ["mäṭṭa","come","comes","came",""],
  ["särra","work","works","worked",""],
  ["täñña","sleep","sleeps","slept",""],
  ["tänässa","get up","gets up","got up",""],
  ["wäṭṭa","go out","goes out","went out",""],
  ["tämälläsä","come back","comes back","came back",""],
  ["därräsä","arrive","arrives","arrived",""],
  ["däwwälä","phone","phones","phoned",""]
];
// [Amharic, transcription, English as it goes after the verb]
const BOBJ = {
  food:[["እንጀራ","injera","injera"],["ዳቦ","dabbo","bread"],["ሥጋ","siga","meat"],["ሩዝ","ruz","rice"]],
  drink:[["ቡና","bunna","coffee"],["ሻይ","shay","tea"],["ውሃ","wiha","water"],["ወተት","wetet","milk"]],
  buy:[["ዳቦ","dabbo","bread"],["ቡና","bunna","coffee"],["መኪና","mekina","a car"],["መጽሐፍ","mets'haf","a book"]],
  sell:[["መኪና","mekina","a car"],["ቡና","bunna","coffee"],["ቤት","bét","a house"]],
  read:[["መጽሐፍ","mets'haf","a book"],["ጋዜጣ","gazét'a","a newspaper"],["ደብዳቤ","debdabbé","a letter"]],
  write:[["ደብዳቤ","debdabbé","a letter"],["መጽሐፍ","mets'haf","a book"]],
  lang:[["አማርኛ","amarigna","Amharic"],["እንግሊዝኛ","inglizigna","English"]],
  hear:[["ሙዚቃ","muziqa","music"],["ዜና","zéna","news"]]
};
// time words: [Amharic, transcription, English, which tenses it goes with]
const BTIME = [
  ["ትናንት","tinant","yesterday","past pastNeg"],
  ["ዛሬ","zaré","today","past pastNeg"],
  ["ነገ","nege","tomorrow","pres presNeg"],
  ["ሁልጊዜ","hulgizé","always","pres"]
];
// extra wrong answers for the "what" and "when" slots, so there are always enough to choose from
const BWHEN_MORE = [["አሁን","ahun","now"],["ማታ","mata","in the evening"],["ጠዋት","t'ewat","in the morning"]];
