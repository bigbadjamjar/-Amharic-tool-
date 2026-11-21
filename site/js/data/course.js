/* ---------- the course ----------
   An original, topic-based course. Each unit is built around something you want to say,
   and brings in grammar only when that topic needs it.
   In notes, {fidel|transcription} marks an Amharic example.
   tables: keys of T (site/js/data/tables.js) to show under a note.
   Every 5th unit is a review of the four before it. */
const LESSONS = [
{n:1,title:"Hello and goodbye",
 notes:[
  {h:"Saying hello",p:["{ሰላም|selam} means “peace” and works as “hello” at any time of day, with anyone. {ጤና ይስጥልኝ|t'éna yist'illign} (literally “may he give you health for me”) is warmer and a little more formal: use it with older people or someone you are meeting for the first time.","Greetings are long and important. People often ask after each other several times over, and it is polite to keep going rather than rush to business."]},
  {h:"One “you”, or four?",p:["English has one “you”. Amharic chooses a word depending on who you speak to: {አንተ|ante} to a man, {አንቺ|anchi} to a woman, {እናንተ|innante} to a group, and {እርስዎ|irswo} to someone older or senior, whatever their gender.","That choice runs through the whole sentence. “How are you?” is {እንደምን ነህ?|indemin neh?} to a man, {እንደምን ነሽ?|indemin nesh?} to a woman and {እንደምን ናችሁ?|indemin nachihu?} to a group. You will see these endings again in unit 2."]},
  {h:"Answering",p:["The usual answer is {ደህና ነኝ|dehna negn} “I am fine”, often followed by {እግዚአብሔር ይመስገን|igziabhér yimesgen} “thank God”. To turn the question back, add {-ስ|-s} to the pronoun: {አንተስ?|antes?} “and you?”"]},
  {h:"Goodbye",p:["{ደህና ሁን|dehna hun} to a man and {ደህና ሁኚ|dehna hugni} to a woman mean “stay well”. Among friends, {ቻው|chaw} (from Italian “ciao”) is common.","At night, say {ደህና እደር|dehna ider} to a man, {ደህና እደሪ|dehna ideri} to a woman: “spend the night well”."]}],
 vocab:[["ሰላም","selam","hello; peace"],["ጤና ይስጥልኝ","t'éna yist'illign","hello (more formal)"],["እንደምን ነህ?","indemin neh?","how are you? (to a man)"],["እንደምን ነሽ?","indemin nesh?","how are you? (to a woman)"],["እንደምን ናችሁ?","indemin nachihu?","how are you? (to a group)"],["ደህና","dehna","fine, well"],["ደህና ነኝ","dehna negn","I am fine"],["እግዚአብሔር ይመስገን","igziabhér yimesgen","thank God"],["አመሰግናለሁ","ameseginallehu","thank you"],["እሺ","ishi","OK, all right"],["አዎ","awo","yes"],["አይ","ay","no"],["ይቅርታ","yiqirta","sorry; excuse me"],["እባክህ","ibakih","please (to a man)"],["እባክሽ","ibakish","please (to a woman)"],["ደህና ሁን","dehna hun","goodbye (to a man)"],["ደህና ሁኚ","dehna hugni","goodbye (to a woman)"],["ቻው","chaw","bye"],["እንኳን ደህና መጣህ","inkwan dehna met'ah","welcome (to a man)"],["እንኳን ደህና መጣሽ","inkwan dehna met'ash","welcome (to a woman)"],["እኔ","iné","I"],["አንተ","ante","you (to a man)"],["አንቺ","anchi","you (to a woman)"],["እርስዎ","irswo","you (respect)"]]},

{n:2,title:"Who are you? Names, jobs and where you're from",
 notes:[
  {h:"“I am”, “you are”: the copula",p:["To say what or who someone is, put {ነኝ|negn} “am”, {ነህ|neh} “are”, {ነው|new} “is” and so on at the very end: {ተማሪ ነኝ|temari negn} “I am a student”. The verb always comes last in Amharic.","Because the ending already tells you who is meant, the pronoun is usually left out. {እኔ ተማሪ ነኝ|iné temari negn} is fine, but it stresses the “I”."],tables:["be"]},
  {h:"Your name",p:["{ስሜ … ነው|simé … new} “my name is …” is literally “my name is …” with the possessive ending {-ኤ|-é} on {ስም|sim} “name”. To ask: {ስምህ ማን ነው?|simih man new?} to a man, {ስምሽ ማን ነው?|simish man new?} to a woman.","Notice that Amharic asks “who is your name?”, using {ማን|man} “who”, not “what”."]},
  {h:"Where are you from?",p:["{ከ|ke-} means “from” and is joined to the front of the word: {ከእንግሊዝ ነኝ|ke'inglíz negn} “I am from England”. The question is {ከየት ነህ?|keyet neh?} / {ከየት ነሽ?|keyet nesh?}: {የት|yet} is “where”.","Question words stay where the answer would go. There is no change of word order, and yes/no questions are made just by raising your voice at the end."]},
  {h:"Nationality",p:["Many nationalities end in {-ዊ|-wi} for a man and {-ዊት|-wit} for a woman: {ኢትዮጵያዊ|ityop'iyawi}, {ኢትዮጵያዊት|ityop'iyawit}. Others just use the country: {እንግሊዛዊ|inglízawi} or {የእንግሊዝ ሰው|ye'inglíz sew} “a person of England”."]},
  {h:"“Not”",p:["The negative of {ነው|new} is a separate word, {አይደለም|aydellem}, which changes for person in the same way: {ሐኪም አይደለሁም|hakim aydellehum} “I am not a doctor”. On its own, {አይደለም|aydellem} is also a polite “no”."],tables:["aydallam"]}],
 vocab:[["ስም","sim","name"],["ስሜ","simé","my name"],["ማን","man","who?"],["ምን","min","what?"],["የት","yet","where?"],["ከ","ke-","from"],["ተማሪ","temari","student"],["አስተማሪ","astemari","teacher"],["ሐኪም","hakim","doctor"],["ነርስ","ners","nurse"],["ሹፌር","shufér","driver"],["ነጋዴ","negadé","trader, business person"],["ኢትዮጵያ","ityop'iya","Ethiopia"],["ኢትዮጵያዊ","ityop'iyawi","Ethiopian (man)"],["ኢትዮጵያዊት","ityop'iyawit","Ethiopian (woman)"],["እንግሊዝ","inglíz","England"],["አሜሪካ","amérika","America"],["ሰው","sew","person, man"],["ሴት","sét","woman"],["ወንድ","wend","man, male"],["እሱ","issu","he"],["እሷ","isswa","she"],["እኛ","igna","we"],["እነሱ","innessu","they"]]},

{n:3,title:"My family",
 notes:[
  {h:"My, your, his: endings on the noun",p:["“My” is not a separate word but an ending: {እናት|innat} “mother” → {እናቴ|innaté} “my mother”, {እናትህ|innatih} “your (m) mother”, {እናቱ|innatu} “his mother”."],tables:["poss"]},
  {h:"After a vowel",p:["When the noun ends in a vowel the endings shift a little: {ልጅ|lij} “child” is regular, but {ውሻ|wisha} “dog” gives {ውሻዬ|wishayé} “my dog” and {ውሻው|wishaw} “his dog”."],tables:["possV"]},
  {h:"“This” and “that”",p:["{ይህ|yih} “this” and {ያ|ya} “that” for men and things; {ይቺ|yichi} and {ያቺ|yachi} for women: {ይህ አባቴ ነው|yih abbaté new} “this is my father”, {ይቺ እህቴ ናት|yichi ihté nat} “this is my sister”. For “she is”, you will hear both {ነች|nech} and {ናት|nat}."]},
  {h:"More than one: -ኦች",p:["Add {-ኦች|-och} to make a plural. After a consonant the last letter takes the o-vowel: {ወንድም|wendim} → {ወንድሞች|wendimoch}. After a vowel the vowel usually drops: {ልጅ|lij} → {ልጆች|lijoch}, {ተማሪ|temari} → {ተማሪዎች|temariwoch} (both ways are heard)."]},
  {h:"“Of”: የ",p:["{የ|ye-} in front of a noun makes it “of”: {የዳዊት እህት|yedawit iht} “Dawit's sister”, literally “of-Dawit sister”. The owner always comes first."]},
  {h:"Adjectives come first",p:["Just like English: {ትልቅ ቤት|tilliq bét} “a big house”, {ታናሽ ወንድም|tanash wendim} “a younger brother”. Older and younger siblings have their own words: {ታላቅ|talaq} “elder”, {ታናሽ|tanash} “younger”."]}],
 vocab:[["ቤተሰብ","béteseb","family"],["እናት","innat","mother"],["አባት","abbat","father"],["ወንድም","wendim","brother"],["እህት","iht","sister"],["ልጅ","lij","child"],["ልጆች","lijoch","children"],["ባል","bal","husband"],["ሚስት","mist","wife"],["አያት","ayat","grandparent"],["ጓደኛ","gwadegna","friend"],["ታላቅ","talaq","elder (sibling)"],["ታናሽ","tanash","younger (sibling)"],["ትልቅ","tilliq","big"],["ትንሽ","tinnish","small, a little"],["ወጣት","wet'at","young; young person"],["ቆንጆ","qonjo","good-looking, pretty"],["ጥሩ","t'iru","good"],["ደግ","deg","kind"],["ይህ","yih","this (m)"],["ይቺ","yichi","this (f)"],["ያ","ya","that (m)"],["ያቺ","yachi","that (f)"],["የ","ye-","of"],["ቤት","bét","house, home"],["ውሻ","wisha","dog"]]},

{n:4,title:"Having and counting",
 notes:[
  {h:"“I have”",p:["Amharic says “there is to me”: {አለ|alle} “there is” plus an ending for the owner. {መኪና አለኝ|mekina allegn} “I have a car”, {መኪና አለህ?|mekina alleh?} “do you (m) have a car?”"],tables:["have"]},
  {h:"Having several things",p:["When the things you have are plural, the verb is too: {ሁለት ወንድሞች አሉኝ|hulet wendimoch allugn} “I have two brothers”."],tables:["havePl"]},
  {h:"“I don't have”",p:["Swap {አለ|alle} for {የለ|yelle} and add {-ም|-m}: {ጊዜ የለኝም|gizé yellegnim} “I don't have time”. {የለም|yellem} on its own means “there isn't any” and is a common short “no”."],tables:["nothave"]},
  {h:"Numbers 1–10",p:["{አንድ|and} 1, {ሁለት|hulet} 2, {ሦስት|sost} 3, {አራት|arat} 4, {አምስት|amist} 5, {ስድስት|siddist} 6, {ሰባት|sebat} 7, {ስምንት|simmint} 8, {ዘጠኝ|zet'egn} 9, {አሥር|asir} 10. The Numbers tab has the rest, and the Ethiopic number symbols.","After a number the noun may stay singular: {ሦስት ልጅ|sost lij} and {ሦስት ልጆች|sost lijoch} both mean “three children”."]},
  {h:"How many?",p:["{ስንት|sint} “how many”: {ስንት ልጆች አሉህ?|sint lijoch alluh?} “how many children do you have?” and, very usefully, {ስንት ነው?|sint new?} “how much is it?”"]}],
 vocab:[["አንድ","and","one"],["ሁለት","hulet","two"],["ሦስት","sost","three"],["አራት","arat","four"],["አምስት","amist","five"],["ስድስት","siddist","six"],["ሰባት","sebat","seven"],["ስምንት","simmint","eight"],["ዘጠኝ","zet'egn","nine"],["አሥር","asir","ten"],["ስንት","sint","how many? how much?"],["አለኝ","allegn","I have"],["የለኝም","yellegnim","I don't have"],["መኪና","mekina","car"],["ድመት","dimmet","cat"],["ገንዘብ","genzeb","money"],["ጊዜ","gizé","time"],["ስልክ","silk","phone"],["ብዙ","bizu","many, much, a lot"],["ጥቂት","t'iqit","a few"],["ወንድ ልጅ","wend lij","son, boy"],["ሴት ልጅ","sét lij","daughter, girl"],["እና","inna","and"]]},

{n:5,title:"Review of units 1–4",review:[1,2,3,4]},

{n:6,title:"Where is it? Around town",
 notes:[
  {h:"“The”",p:["Amharic has no separate word for “the”. Instead {-ኡ|-u} or {-ው|-w} goes on the end: {ባንክ|bank} “a bank” → {ባንኩ|banku} “the bank”, {ቡና|bunna} → {ቡናው|bunnaw} “the coffee”. For something female or small and dear, {-ዋ|-wa}: {ድመቷ|dimmetwa} “the cat”.","It is the same ending as “his”, so {ቤቱ|bétu} can mean “the house” or “his house”. Context decides."]},
  {h:"Where is…?",p:["To ask where a place is, use {ነው|new}: {ባንኩ የት ነው?|banku yet new?} “where is the bank?” To say a person or thing is present somewhere, use {አለ|alle}: {እናቴ ቤት አለች|innaté bét allech} “my mother is at home”."],tables:["alla"]},
  {h:"There is, there isn't",p:["{አለ|alle} also means “there is”: {እዚህ አጠገብ ሱቅ አለ?|izzih at'egeb suq alle?} “is there a shop near here?” The answer might be {የለም|yellem} “there isn't”."],tables:["yallam"]},
  {h:"In, on, next to",p:["Place words work like a sandwich: a small word in front, a position word after. {በ…ውስጥ|be… wist'} “inside”, {በ…ላይ|be… lay} “on”, {ከ…አጠገብ|ke… at'egeb} “next to”. The front part is often dropped in speech: {ከተማ ውስጥ|ketema wist'} “in town”, {ጠረጴዛው ላይ|t'erep'ézaw lay} “on the table”."]},
  {h:"Here and there",p:["{እዚህ|izzih} “here”, {እዚያ|izziya} “there”. Add {ወደ|wede} for movement: {ወደዚህ|wedezzih} “this way”."]}],
 vocab:[["ከተማ","ketema","town, city"],["መንገድ","menged","road, way"],["ባንክ","bank","bank"],["ሱቅ","suq","shop"],["ገበያ","gebeya","market"],["ሆቴል","hotél","hotel; café"],["ምግብ ቤት","migib bét","restaurant"],["ሆስፒታል","hospital","hospital"],["ትምህርት ቤት","timihirt bét","school"],["ቤተ ክርስቲያን","béte kristiyan","church"],["መስጊድ","mesgid","mosque"],["ፖስታ ቤት","posta bét","post office"],["መጽሐፍ","mets'haf","book"],["ጠረጴዛ","t'erep'éza","table"],["እዚህ","izzih","here"],["እዚያ","izziya","there"],["ውስጥ","wist'","inside"],["ላይ","lay","on, on top"],["ሥር","sir","under"],["አጠገብ","at'egeb","next to, near"],["ፊት ለፊት","fit lefit","opposite"],["ሩቅ","ruq","far"],["ቅርብ","qirb","near"],["አለ","alle","there is; is present"],["የለም","yellem","there isn't; no"]]},

{n:7,title:"Coffee and food",
 notes:[
  {h:"“I want”",p:["{እፈልጋለሁ|ifeligallehu} “I want” is the word you need most in a café: {ቡና እፈልጋለሁ|bunna ifeligallehu} “I want coffee, I'd like coffee”. The table shows it for every person; the full pattern behind it comes in the next unit."],tables:["impB"]},
  {h:"The object marker -ን",p:["When the thing you want, eat or see is definite (“the coffee”, “my bag”), it takes {-ን|-n}: {ቡናውን እፈልጋለሁ|bunnawin ifeligallehu} “I want the coffee”. An indefinite object (“some coffee”) has no ending."]},
  {h:"Not wanting",p:["{አልፈልግም|alfeligim} “I don't want”: {ስኳር አልፈልግም|sikkwar alfeligim} “no sugar, thanks”. The pattern is {አል-|al-} in front and {-ም|-m} at the end. You will meet it on every verb."]},
  {h:"Food words",p:["{እንጀራ|injera} is the soft, sour flatbread made from teff, eaten with {ወጥ|wet'}, a spiced stew. {ሽሮ|shiro} (chickpea stew) and {ምስር|misir} (lentils) are everyday dishes, and fasting days call for {የጾም ምግብ|yets'om migib}, food without meat or dairy.","Coffee is served from a clay pot called a {ጀበና|jebena}, usually in three rounds."]},
  {h:"With",p:["{በ|be-} can mean “with” for what goes in food or drink: {ሻይ በወተት|shay bewetet} “tea with milk”."]}],
 vocab:[["ቡና","bunna","coffee"],["ሻይ","shay","tea"],["ውሃ","wiha","water"],["ወተት","wetet","milk"],["ስኳር","sikkwar","sugar"],["ዳቦ","dabbo","bread"],["እንጀራ","injera","injera (flatbread)"],["ወጥ","wet'","stew"],["ሽሮ","shiro","chickpea stew"],["ምስር","misir","lentils"],["ሥጋ","siga","meat"],["ዶሮ","doro","chicken"],["አትክልት","atkilt","vegetables"],["ምግብ","migib","food"],["ቁርስ","qurs","breakfast"],["ምሳ","misa","lunch"],["እራት","irat","dinner"],["ጣፋጭ","t'afach'","tasty; sweet"],["ጀበና","jebena","coffee pot"],["ብርጭቆ","birch'iqqo","glass"],["ስኒ","sini","small coffee cup"],["በ","be-","with; in; by"],["ፈለገ","felege","want, look for"],["በላ","bella","eat"],["ጠጣ","t'et'a","drink"]]},

{n:8,title:"Every day: the present and future",
 notes:[
  {h:"One tense for now and later",p:["The same form covers “I go”, “I am going” and “I will go”: {እሄዳለሁ|ihédallehu}. Words like {ዛሬ|zaré} “today” or {ነገ|nege} “tomorrow” make the time clear."]},
  {h:"How it is built",p:["A prefix shows the person ({እ-|i-} I, {ት-|ti-} you or she, {ይ-|yi-} he, {እን-|inni-} we) and the ending {-አለሁ|-allehu}, {-አለህ|-alleh}… finishes it. The stem in the middle comes from the verb: {ሰበረ|sebbere} “break” → {እሰብራለሁ|isebrallehu}."],tables:["impA"]},
  {h:"Short verbs",p:["Verbs with only two consonants keep a long vowel in the middle: {ሄደ|héde} “go” → {ይሄዳል|yihédal}, {ሰማ|semma} “hear” → {ይሰማል|yisemal}. The Verbs tab shows every form of every verb."],tables:["impHeda","impSamma"]},
  {h:"“You” to a woman",p:["With {አንቺ|anchi} the ending is {-ኢያለሽ|-iyallesh}, and that i-sound often changes the consonant before it: {ትሄጃለሽ|tihéjallesh} “you (f) go”, not ✗ትሄዳለሽ. You will soon hear it without thinking."]},
  {h:"Not",p:["{አል-|al-}/{አይ-|ay-} … {-ም|-m} again, with a shorter stem: {አልሄድም|alhédim} “I don't go, I won't go”, {አይሠራም|ayseram} “he doesn't work”."],tables:["negImp"]},
  {h:"Going somewhere",p:["{ወደ|wede} “to, towards”: {ወደ ሥራ እሄዳለሁ|wede sira ihédallehu} “I go to work”. With {ቤት|bét} it is often left out: {ቤት እሄዳለሁ|bét ihédallehu} “I'm going home”."]}],
 vocab:[["ዛሬ","zaré","today"],["ነገ","nege","tomorrow"],["ጠዋት","t'ewat","morning"],["ከሰዓት በኋላ","kese'at behwala","afternoon"],["ማታ","mata","evening"],["ሌሊት","lélit","night"],["ሁልጊዜ","hulgizé","always"],["በየቀኑ","beyeqenu","every day"],["ሥራ","sira","work, job"],["ወደ","wede","to, towards"],["ሰኞ","segno","Monday"],["ማክሰኞ","maksegno","Tuesday"],["ረቡዕ","rebu'","Wednesday"],["ሐሙስ","hamus","Thursday"],["ዓርብ","arb","Friday"],["ቅዳሜ","qidamé","Saturday"],["እሑድ","ihud","Sunday"],["ሄደ","héde","go"],["መጣ","met'a","come"],["ሠራ","serra","work, make"],["ተማረ","temarre","learn, study"],["ተነሣ","tenessa","get up"],["ተኛ","tegna","sleep, lie down"],["አነበበ","anebbebe","read"],["ጻፈ","ts'afe","write"],["ተናገረ","tenaggere","speak"],["አማርኛ","amarigna","Amharic"]]},

{n:9,title:"Yesterday: talking about the past",
 notes:[
  {h:"The past",p:["The past has its own endings and no prefix: {ሄድኩ|hédku} “I went”, {ሄድክ|hédk} “you (m) went”, {ሄደ|héde} “he went”. The “he” form is how verbs are listed in dictionaries."],tables:["sabbara","heda"]},
  {h:"Verbs ending in a vowel",p:["When the verb ends in -a, “I” takes {-ሁ|-hu} instead of {-ኩ|-ku}: {ሰማሁ|semmahu} “I heard”, {በላሁ|bellahu} “I ate”."],tables:["samma"]},
  {h:"Didn't",p:["Wrap the past in {አል-|al-} … {-ም|-m}: {አልሄድኩም|alhédkum} “I didn't go”."],tables:["negperf"]},
  {h:"Was and were",p:["{ነበር|nebber} “was” is the past of both {ነው|new} and {አለ|alle}: {ትናንት የት ነበርክ?|tinant yet nebberk?} “where were you yesterday?”, {ቤት ነበርኩ|bét nebberku} “I was at home”."],tables:["nabbara"]},
  {h:"Order of words",p:["The basic order is who – when – where – what – verb: {ትናንት ወደ ገበያ ሄድኩ|tinant wede gebeya hédku} “yesterday I went to the market”. Time words usually come early."]}],
 vocab:[["ትናንት","tinant","yesterday"],["ትናንት ማታ","tinant mata","last night"],["ባለፈው ሳምንት","balefew sammint","last week"],["ሳምንት","sammint","week"],["ዓመት","amet","year"],["ፊልም","film","film"],["ዜና","zéna","news"],["ደብዳቤ","debdabbé","letter"],["ነበር","nebber","was"],["ሰማ","semma","hear"],["አየ","ayye","see"],["ገዛ","gezza","buy"],["ደረሰ","derrese","arrive"],["ደወለ","dewwele","ring, call (on the phone)"],["ቀረ","qerre","stay behind, miss"],["ጀመረ","jemmere","begin"],["ጨረሰ","ch'errese","finish"],["ተመለሰ","temelese","come back"],["ቆየ","qoyye","stay, wait a while"],["ገባ","gebba","go in, enter"],["ወጣ","wet'a","go out"]]},

{n:10,title:"Review of units 6–9",review:[6,7,8,9]},

{n:11,title:"At the market",
 notes:[
  {h:"Tens",p:["{አሥር|asir} 10, {ሃያ|haya} 20, {ሠላሳ|selasa} 30, {አርባ|arba} 40, {ሃምሳ|hamsa} 50, {ስልሳ|silsa} 60, {ሰባ|seba} 70, {ሰማንያ|semanya} 80, {ዘጠና|zet'ena} 90, {መቶ|meto} 100. In between, just add: {ሃያ አምስት|haya amist} 25."]},
  {h:"Asking the price",p:["{ስንት ነው?|sint new?} “how much is it?” Prices are in {ብር|birr}, and a {ሳንቲም|santim} is a hundredth of a birr. {ይህ ስንት ነው?|yih sint new?} “how much is this?” {አንድ ኪሎ ስንት ነው?|and kilo sint new?} “how much is a kilo?”"]},
  {h:"Bargaining",p:["{ውድ ነው|wid new} “it's expensive”, {በጣም ውድ ነው|bet'am wid new} “that's very expensive”. To ask for a lower price: {ቀንሱልኝ|qenisullign}, roughly “bring it down for me” (to a seller you address politely as a group). Market haggling is normal; shop prices are usually fixed."]},
  {h:"Amounts",p:["The amount comes first, with no “of”: {ሁለት ኪሎ ቲማቲም|hulet kilo timatim} “two kilos of tomatoes”."]}],
 vocab:[["ሃያ","haya","twenty"],["ሠላሳ","selasa","thirty"],["አርባ","arba","forty"],["ሃምሳ","hamsa","fifty"],["መቶ","meto","hundred"],["ብር","birr","birr (money)"],["ሳንቲም","santim","cent"],["ዋጋ","waga","price"],["ውድ","wid","expensive; dear"],["ርካሽ","rikash","cheap"],["ኪሎ","kilo","kilo"],["ሙዝ","muz","banana"],["ብርቱካን","birtukan","orange"],["ቲማቲም","timatim","tomato"],["ሽንኩርት","shinkurt","onion"],["ድንች","dinich","potato"],["እንቁላል","inqulal","egg"],["ቦርሳ","borsa","bag"],["ሸጠ","shet'e","sell"],["ከፈለ","kefele","pay"],["ሰጠ","set'e","give"],["በጣም","bet'am","very"],["ቀንሱልኝ","qenisullign","lower the price for me"]]},

{n:12,title:"Getting around",
 notes:[
  {h:"Telling someone to do something",p:["The command form is short and has different endings for a man, a woman and a group: {ሂድ|hid}, {ሂጂ|hiji}, {ሂዱ|hidu} “go!”; {ና|na}, {ነዪ|ney}, {ኑ|nu} “come!”. Add {እባክህ|ibakih} / {እባክሽ|ibakish} to soften it."]},
  {h:"Don't",p:["“Don't” uses the prefix {አት-|at-}: {አትሂድ|athid} “don't go (m)”, {አትሂጂ|athiji} “don't go (f)”."],tables:["negJus"]},
  {h:"Directions",p:["{ወደ ቀኝ|wede qegn} “to the right”, {ወደ ግራ|wede gira} “to the left”, {ቀጥ ብለህ ሂድ|qet' bileh hid} “go straight on”. {እዚህ አቁም|izzih aqum} “stop here” is what you say to a taxi driver."]},
  {h:"From … to",p:["{ከ|ke-} “from” and {ወደ|wede} “to”: {ከቦሌ ወደ ፒያሳ|kebolé wede piyassa} “from Bole to Piassa”. {እስከ|iske} means “as far as, until”."]},
  {h:"When?",p:["{መቼ|meché} “when?”: {አውቶቡሱ መቼ ይመጣል?|awtobusu meché yimet'al?} “when does the bus come?”"]}],
 vocab:[["ታክሲ","taksi","taxi; minibus"],["አውቶቡስ","awtobus","bus"],["ባቡር","babur","train"],["አውሮፕላን","awroplan","aeroplane"],["ጣቢያ","t'abiya","station, stop"],["ቀኝ","qegn","right"],["ግራ","gira","left"],["ቀጥ ብሎ","qet' bilo","straight on"],["መቼ","meché","when?"],["እስከ","iske","as far as, until"],["ሂድ","hid","go! (to a man)"],["ና","na","come! (to a man)"],["አቁም","aqum","stop! (a vehicle)"],["ቆመ","qome","stand, stop"],["ተቀመጠ","teqemmet'e","sit down"],["ቀረበ","qerrebe","come near"],["ሩቅ ነው?","ruq new?","is it far?"],["ካርታ","karta","map"],["ቲኬት","tikét","ticket"]]},

{n:13,title:"How do you feel?",
 notes:[
  {h:"Hungry, thirsty, tired",p:["Amharic says “hunger has got me” rather than “I am hungry”. The feeling is the subject and you are the object: {ርቦኛል|ribognal} “I'm hungry”, {ጠምቶኛል|t'emtognal} “I'm thirsty”, {ደክሞኛል|dekmognal} “I'm tired”.","The table shows the simple past of {ራበ|rabe}; in everyday speech the “has” form ({ርቦኛል|ribognal}) is what you say about right now."],tables:["hungry"]},
  {h:"“Has done”",p:["The form ending in {-ኣል|-al} says something happened and still holds: {ደርሷል|derswal} “he has arrived (and is here)”. It is how you talk about states: {ታምሜአለሁ|tamméallehu} “I am ill” (literally “I have fallen ill”)."],tables:["cger"]},
  {h:"It hurts",p:["{አመመ|ammeme} “hurt” takes the person as object: {ራሴን ያመኛል|rasén yamegnal} “my head hurts” (“it hurts my head”). Put the part of the body first, with {-ን|-n}."]},
  {h:"Happy and sad",p:["{ደስ አለኝ|des allegn} “I'm glad”, literally “it said pleasant to me”. {ደስ ይላል|des yilal} “it's nice”."]}],
 vocab:[["ርቦኛል","ribognal","I'm hungry"],["ጠምቶኛል","t'emtognal","I'm thirsty"],["ደክሞኛል","dekmognal","I'm tired"],["ታምሜአለሁ","tamméallehu","I'm ill"],["ደስ አለኝ","des allegn","I'm glad"],["ራስ","ras","head"],["ሆድ","hod","stomach"],["ጥርስ","t'irs","tooth"],["ዓይን","ayn","eye"],["እጅ","ij","hand"],["እግር","igir","leg, foot"],["መድኃኒት","medhanit","medicine"],["ራበ","rabe","be hungry"],["ጠማ","t'emma","be thirsty"],["ደከመ","dekkeme","be tired"],["አመመ","ammeme","hurt, make ill"],["ዳነ","dane","get better"],["ደስ አለ","des ale","be pleased"],["ጤና","t'éna","health"]]},

{n:14,title:"Making plans",
 notes:[
  {h:"Let's…",p:["“Let's” is the “we” form without its ending: {እንሂድ|innihid} “let's go”, {ቡና እንጠጣ|bunna innit'et'a} “let's have coffee”. The same short form with other persons gives wishes: {ይምጣ|yimt'a} “let him come”."],tables:["simpB"]},
  {h:"To do: the verbal noun",p:["After “want”, “like” or “can”, the second verb takes the {መ-|me-} form: {መሄድ እፈልጋለሁ|mehéd ifeligallehu} “I want to go”, {አማርኛ መማር እወዳለሁ|amarigna memar iwedallehu} “I like learning Amharic”."]},
  {h:"I have to",p:["{አለብኝ|allebbign} “I must”: {መሥራት አለብኝ|mesrat allebbign} “I have to work”."],tables:["must"]},
  {h:"Can",p:["{እችላለሁ|ichilallehu} “I can”: {ነገ መምጣት እችላለሁ|nege memt'at ichilallehu} “I can come tomorrow”. “I can't” is {አልችልም|alchilim}."]},
  {h:"Meeting up",p:["{እንገናኝ|innigenagn} “let's meet”. {ቅዳሜ እንገናኝ|qidamé innigenagn} “see you on Saturday”."]}],
 vocab:[["እንሂድ","innihid","let's go"],["እንገናኝ","innigenagn","let's meet"],["መሄድ","mehéd","to go, going"],["መምጣት","memt'at","to come"],["መሥራት","mesrat","to work"],["መማር","memar","to learn"],["አለብኝ","allebbign","I must"],["ቻለ","chale","be able to"],["ወደደ","weddede","like, love"],["ተገናኘ","tegenagne","meet"],["አደረገ","aderrege","do"],["ምን ማድረግ","min madreg","what to do"],["ዕቅድ","iqid","plan"],["በዓል","beal","holiday, festival"],["ሠርግ","serg","wedding"],["ልደት","lidet","birthday"],["ምናልባት","minalbat","maybe"],["በእርግጥ","be'irgit'","of course"]]},

{n:15,title:"Review of units 11–14",review:[11,12,13,14]}
];

// Units planned but not written yet: number, short description.
const LATER = [
 [16,"Telling a story: “and then…” (the -ቶ form)"],
 [17,"Tell me, give her: object endings on verbs"],
 [18,"When, if and because"],
 [19,"The one who…: describing people and things"],
 [20,"Review of units 16–19"],
 [21,"Making things happen: derived verbs (a-, as-, te-)"]
];
