/* ---------- reading stories ----------
   Short graded stories written for this app. Each one uses the words and grammar of the course up to
   its unit ("after"), plus a few new words, which are all in STWORDS so that every word can be tapped.
   am, rom: the title in Amharic, and its transcription.
   lines: [Amharic, transcription, English, note?]. The transcription has one word for each Amharic word
   (same order), so tapping a word can show its own transcription. A note marks a line a native speaker
   should look at, and says why. None of these has been checked yet; tools/native-check.mjs lists them.
   qs: [question, [three answers], index of the right one].
   The audio run reads every Amharic string in this file, so each line and each word can get a clip. */
const STORIES = [
{"id":"almaz","after":3,"title":"Meet Almaz","am":"አልማዝ","rom":"almaz","intro":"Almaz shows us her family.",
 "lines":[
  ["ሰላም! ስሜ አልማዝ ነው።","selam! simé almaz new.","Hello! My name is Almaz."],
  ["እኔ ተማሪ ነኝ።","iné temari negn.","I am a student."],
  ["ይህ ቤቴ ነው።","yih bété new.","This is my home."],
  ["አባቴ ሐኪም ነው፤ እናቴ አስተማሪ ናት።","abbaté hakim new; innaté astemari nat.","My father is a doctor; my mother is a teacher."],
  ["ታላቅ ወንድሜ ሹፌር ነው።","talaq wendimé shufér new.","My elder brother is a driver."],
  ["ታናሽ እህቴ ትንሽ ልጅ ናት።","tanash ihté tinnish lij nat.","My younger sister is a little child."],
  ["አያቴ ደግ ናት።","ayaté deg nat.","My grandmother is kind."],
  ["ይህ ውሻችን ነው። ስሙ ቦቢ ነው።","yih wishachin new. simu bobi new.","This is our dog. His name is Bobby.","-አችን “our” is not taught until later; check ውሻችን."],
  ["ቆንጆ ውሻ ነው!","qonjo wisha new!","He's a good-looking dog!"]],
 "qs":[
  ["What does Almaz do?",["She's a student","She's a teacher","She's a doctor"],0],
  ["Who is a driver?",["Her elder brother","Her father","Her grandmother"],0],
  ["What is the dog called?",["Bobby","Almaz","He has no name"],0]]},

{"id":"dawit","after":4,"title":"Who has more?","am":"ዳዊትና ሳሙኤል","rom":"dawitinna samu'él","intro":"Two friends: one has a lot of things, the other has a lot of time.",
 "lines":[
  ["ዳዊት ነጋዴ ነው።","dawit negadé new.","Dawit is a businessman."],
  ["ዳዊት ትልቅ ቤት አለው።","dawit tilliq bét allew.","Dawit has a big house."],
  ["ሁለት መኪና እና ሦስት ስልክ አለው።","hulet mekina inna sost silk allew.","He has two cars and three phones."],
  ["አራት ልጆች አሉት።","arat lijoch allut.","He has four children."],
  ["ብዙ ገንዘብ አለው፤ ግን ጊዜ የለውም።","bizu genzeb allew; gin gizé yellewim.","He has a lot of money, but he doesn't have time."],
  ["ጓደኛው ሳሙኤል ትንሽ ቤት አለው።","gwadegnaw samu'él tinnish bét allew.","His friend Samuel has a small house."],
  ["ሳሙኤል መኪና የለውም፤ ገንዘቡ ጥቂት ነው።","samu'él mekina yellewim; genzebu t'iqit new.","Samuel doesn't have a car; he has only a little money."],
  ["አንድ ድመት እና አንድ ውሻ አለው።","and dimmet inna and wisha allew.","He has one cat and one dog."],
  ["ግን ሳሙኤል ብዙ ጊዜ አለው።","gin samu'él bizu gizé allew.","But Samuel has a lot of time."],
  ["ማን ደስተኛ ነው?","man destegna new?","Who is happy?"]],
 "qs":[
  ["How many children does Dawit have?",["Four","Two","Three"],0],
  ["What doesn't Dawit have?",["Time","Money","A car"],0],
  ["What animals does Samuel have?",["A cat and a dog","Two dogs","None"],0]]},

{"id":"coffee","after":7,"title":"At Grandmother's","am":"አያቴ ቤት","rom":"ayaté bét","intro":"Coffee and lunch at grandmother's house.",
 "lines":[
  ["ይህ የአያቴ ቤት ነው።","yih ye'ayaté bét new.","This is my grandmother's house."],
  ["ቤቱ ውስጥ ጀበና አለ።","bétu wist' jebena alle.","In the house there's a coffee pot."],
  ["ጠረጴዛው ላይ ስኒዎች አሉ።","t'erep'ézaw lay siniwoch allu.","On the table there are little cups."],
  ["እኔ ቡና በስኳር እጠጣለሁ።","iné bunna besikkwar it'et'allehu.","I drink coffee with sugar."],
  ["አያቴ ቡና ያለ ስኳር ትጠጣለች።","ayaté bunna yale sikkwar tit'et'allech.","My grandmother drinks coffee without sugar."],
  ["ታናሽ እህቴ ቡና አትጠጣም፤ ወተት ትፈልጋለች።","tanash ihté bunna atit'et'am; wetet tifeligallech.","My younger sister doesn't drink coffee; she wants milk."],
  ["ለምሳ እንጀራ በሽሮ እንበላለን።","lemisa injera beshiro inbelallen.","For lunch we eat injera with shiro.","Check the በ “with” construction for food (as in the unit 7 sentences)."],
  ["ሽሮው ጣፋጭ ነው!","shirow t'afach' new!","The shiro is tasty!"],
  ["አያቴ፦ ብሉ፣ ብሉ!","ayaté: bilu, bilu!","Grandmother: Eat, eat!"]],
 "qs":[
  ["How does grandmother drink her coffee?",["Without sugar","With sugar","With milk"],0],
  ["What does the younger sister want?",["Milk","Coffee","Tea"],0],
  ["What do they eat for lunch?",["Injera with shiro","Bread","Chicken stew"],0]]},

{"id":"yesterday","after":9,"title":"A long day","am":"ረጅም ቀን","rom":"rejjim qen","intro":"Someone tells us about yesterday.",
 "lines":[
  ["ትናንት ጠዋት ተነሣሁ፤ ቁርስ በላሁ፤ ቡና ጠጣሁ።","tinant t'ewat tenessahu; qurs bellahu; bunna t'et'ahu.","Yesterday morning I got up, ate breakfast and drank coffee."],
  ["ወደ ሥራ ሄድኩ።","wede sira hédku.","I went to work."],
  ["ሥራ ብዙ ነበር።","sira bizu nebber.","There was a lot of work."],
  ["ከሰዓት በኋላ እናቴ ደወለች።","kese'at behwala innaté dewwelech.","In the afternoon my mother rang."],
  ["ማታ ወደ ገበያ ሄድኩ፤ ዳቦ እና ወተት ገዛሁ።","mata wede gebeya hédku; dabbo inna wetet gezzahu.","In the evening I went to the market and bought bread and milk."],
  ["ወደ ቤት ተመለስኩ።","wede bét temelesku.","I came back home."],
  ["ፊልም አየሁ፤ ግን ፊልሙን አልጨረስኩም።","film ayyehu; gin filmun alch'erreskum.","I watched a film, but I didn't finish it."],
  ["ሶፋው ላይ ተኛሁ!","sofaw lay tegnahu!","I fell asleep on the sofa!"]],
 "qs":[
  ["Who rang in the afternoon?",["Their mother","A friend","Their boss"],0],
  ["What did they buy?",["Bread and milk","Coffee and sugar","Bananas"],0],
  ["Why didn't they finish the film?",["They fell asleep","The phone rang","They went out"],0]]},

{"id":"station","after":12,"title":"The train station","am":"ባቡር ጣቢያ","rom":"babur t'abiya","intro":"Tom is looking for the train station.",
 "lines":[
  ["ቶም ባቡር ጣቢያ ይፈልጋል።","tom babur t'abiya yifeligal.","Tom is looking for the train station."],
  ["ቶም፦ ይቅርታ፣ ባቡር ጣቢያ የት ነው?","tom: yiqirta, babur t'abiya yet new?","Tom: Excuse me, where is the train station?"],
  ["ሴትዮዋ፦ ቀጥ ብለህ ሂድ፤ ጣቢያው ባንኩ አጠገብ ነው።","sétiyowa: qet' bileh hid; t'abiyaw banku at'egeb new.","The woman: Go straight on; the station is next to the bank.","ቀጥ ብለህ (to a man) rather than the word-list form ቀጥ ብሎ; check this is how directions are given."],
  ["ቶም፦ ሩቅ ነው?","tom: ruq new?","Tom: Is it far?"],
  ["ሴትዮዋ፦ አይ፣ ቅርብ ነው።","sétiyowa: ay, qirb new.","The woman: No, it's near."],
  ["ቶም በእግሩ ሄደ።","tom be'igru héde.","Tom went on foot."],
  ["ጣቢያው ደረሰ፤ ቲኬት ገዛ።","t'abiyaw derrese; tikét gezza.","He reached the station and bought a ticket."],
  ["ግን ባቡሩ ሄዶ ነበር!","gin baburu hédo nebber!","But the train had gone!"],
  ["ቶም፦ ሌላ ባቡር መቼ ይመጣል?","tom: léla babur meché yimet'al?","Tom: When does another train come?"],
  ["ሰውዬው፦ ነገ!","sewiyew: nege!","The man: Tomorrow!"]],
 "qs":[
  ["Where is the station?",["Next to the bank","Opposite the church","Far away"],0],
  ["How did Tom get there?",["On foot","By taxi","By bus"],0],
  ["When is the next train?",["Tomorrow","In an hour","Tonight"],0]]},

{"id":"meskel","after":14,"title":"Plans for Meskel","am":"የመስቀል ዕቅድ","rom":"yemeskel iqid","intro":"Sara and Yonas make plans for the Meskel festival.",
 "lines":[
  ["ነገ መስቀል ነው።","nege meskel new.","Tomorrow is Meskel."],
  ["መስቀል ትልቅ በዓል ነው።","meskel tilliq beal new.","Meskel is a big festival."],
  ["ሳራ፦ ማታ ደመራ ማየት እፈልጋለሁ።","sara: mata demera mayet ifeligallehu.","Sara: In the evening I want to see the Demera bonfire."],
  ["ዮናስ፦ በእርግጥ! እንሂድ።","yonas: be'irgit'! innihid.","Yonas: Of course! Let's go."],
  ["ሳራ፦ የት እንገናኝ?","sara: yet innigenagn?","Sara: Where shall we meet?"],
  ["ዮናስ፦ ቤተ ክርስቲያኑ አጠገብ እንገናኝ።","yonas: béte kristiyanu at'egeb innigenagn.","Yonas: Let's meet next to the church."],
  ["ሳራ፦ እናቴ ዶሮ ወጥ ትሠራለች። ቤታችን መምጣት ትችላለህ?","sara: innaté doro wet' tiserallech. bétachin memt'at tichilalleh?","Sara: My mother is making chicken stew. Can you come to our house?"],
  ["ዮናስ፦ ምናልባት፤ ነገ ጠዋት መሥራት አለብኝ።","yonas: minalbat; nege t'ewat mesrat allebbign.","Yonas: Maybe; I have to work tomorrow morning."],
  ["ሳራ፦ እሺ። መልካም በዓል!","sara: ishi. melkam beal!","Sara: OK. Happy holiday!"],
  ["ዮናስ፦ እንኳን አደረሰሽ!","yonas: inkwan aderresesh!","Yonas: Happy holiday to you too!"]],
 "qs":[
  ["What does Sara want to see?",["The Demera bonfire","A film","A wedding"],0],
  ["Where will they meet?",["Next to the church","At the station","At Sara's house"],0],
  ["What is Sara's mother making?",["Chicken stew","Shiro","Coffee"],0]]},

{"id":"keys","after":16,"title":"Where are my keys?","am":"ቁልፌ የት ነው?","rom":"qulfé yet new?","intro":"A morning that goes wrong, told with the “and then” verb forms from unit 16.",
 "lines":[
  ["ትናንት ጠዋት ተነሥቼ ታጠብኩ።","tinant t'ewat tenesché tat'ebku.","Yesterday morning I got up and washed."],
  ["ልብሴን ለብሼ ቁርስ በላሁ።","libsén lebshé qurs bellahu.","I got dressed and ate breakfast."],
  ["ከዚያ ቁልፌን ፈለግኩ።","keziya qulfén felegku.","Then I looked for my key."],
  ["ጠረጴዛው ላይ የለም። ቦርሳዬ ውስጥ የለም።","t'erep'ézaw lay yellem. borsayé wist' yellem.","It isn't on the table. It isn't in my bag."],
  ["መጀመሪያ ወደ መኝታ ቤት ሄጄ ፈለግኩ።","mejemmerya wede megnta bét héjé felegku.","First I went to the bedroom and looked."],
  ["ከዚያ ወደ ኩሽና ሮጬ ፈለግኩ።","keziya wede kushina roch'é felegku.","Then I ran to the kitchen and looked."],
  ["በመጨረሻ ቁልፌን አገኘሁ፤ ኪሴ ውስጥ ነበር!","bemech'ersha qulfén agegnyehu; kisé wist' nebber!","In the end I found my key: it was in my pocket!"],
  ["ቶሎ ሮጬ አውቶቡሱን ያዝኩ።","tolo roch'é awtobusun yazku.","I ran fast and caught the bus.","ያዘ “catch” for a bus: check this is natural."]],
 "qs":[
  ["Where did they look first?",["The bedroom","The kitchen","Their bag"],0],
  ["Where was the key?",["In their pocket","On the table","In the bag"],0],
  ["Did they catch the bus?",["Yes","No","They walked"],0]]},

{"id":"wedding","after":19,"title":"Who's who at the wedding","am":"ሠርጉ ላይ","rom":"sergu lay","intro":"Pointing people out at a wedding, with the “the one who…” forms from unit 19.",
 "lines":[
  ["ትናንት ሠርግ ላይ ነበርኩ።","tinant serg lay nebberku.","Yesterday I was at a wedding."],
  ["ብዙ ሰዎች መጥተው ነበር።","bizu sewoch met'tew nebber.","Lots of people had come."],
  ["ነጭ ቀሚስ የለበሰችው ሴት ሙሽሪት ናት።","nech' qemis yelebbesechiw sét mushirit nat.","The woman wearing a white dress is the bride."],
  ["ጥቁር ኮት የለበሰው ረጅም ሰው ሙሽራው ነው።","t'iqur kot yelebbesew rejjim sew mushiraw new.","The tall man wearing a black coat is the groom."],
  ["መነጽር ያደረገው አጭር ሰው አባቷ ነው።","menets'ir yaderregew ach'ir sew abbatwa new.","The short man wearing glasses is her father.","መነጽር ያደረገ “wearing glasses”: check the verb (አደረገ or ለበሰ?)."],
  ["ሰማያዊ ቀሚስ የለበሰችው ሴት እናቷ ናት።","semayawi qemis yelebbesechiw sét innatwa nat.","The woman in the blue dress is her mother."],
  ["እናቷ ለሙሽሪት ስጦታ ሰጠቻት።","innatwa lemushirit sit'ota set'echat.","Her mother gave the bride a present."],
  ["ስጦታው ምንድን ነው? ቀይ ጀበና ነበር!","sit'otaw mindin new? qey jebena nebber!","What's the present? It was a red coffee pot!"],
  ["እኔ የገዛሁት ስጦታም ጀበና ነው!","iné yegezzahut sit'otam jebena new!","The present I bought is a coffee pot too!"]],
 "qs":[
  ["What colour is the bride's dress?",["White","Red","Blue"],0],
  ["Who is wearing glasses?",["Her father","The groom","Her mother"],0],
  ["What did the storyteller buy?",["A coffee pot too","A dress","Shoes"],0]]},

{"id":"car","after":21,"title":"The car broke down","am":"መኪናው ተበላሸ","rom":"mekinaw tebelashe","intro":"A trip to Hawassa doesn't go to plan.",
 "lines":[
  ["ቅዳሜ ወደ ሀዋሳ ሄድን።","qidamé wede hawassa hédin.","On Saturday we went to Hawassa."],
  ["መንገድ ላይ መኪናችን ተበላሸ።","menged lay mekinachin tebelashe.","On the way our car broke down."],
  ["አባቴ መኪናውን መንገዱ ዳር አቆመው።","abbaté mekinawn mengedu dar aqomew.","My father stopped the car at the side of the road."],
  ["አንድ ሹፌር ቆሞ ረዳን።","and shufér qomo reddan.","A driver stopped and helped us."],
  ["ወደ ጋራዥ ወሰደን።","wede garazh wesseden.","He took us to a garage."],
  ["ጋራዡ ትንሽ ነበር፤ ግን ሰውዬው ጎበዝ ነበር።","garazhu tinnish nebber; gin sewiyew gobez nebber.","The garage was small, but the man was very good at his job."],
  ["ሚስቱ ቡና አፈላችልን።","mistu bunna afelachillin.","His wife made coffee for us."],
  ["ከአንድ ሰዓት በኋላ መኪናው ተሠራ።","ke'and se'at behwala mekinaw teserra.","After an hour the car was mended.","ተሠራ for “was repaired”: check (or ተጠገነ?)."],
  ["ማታ ሀዋሳ ደረስን።","mata hawassa derresin.","In the evening we reached Hawassa."]],
 "qs":[
  ["What happened on the way?",["The car broke down","They got lost","It rained"],0],
  ["Who made coffee?",["The mechanic's wife","The father","The driver"],0],
  ["How long did the repair take?",["An hour","All day","A week"],0]]}
];

/* Every word in the stories, as it appears (endings and all): what it means here.
   Its transcription comes from the line it is in. */
const STWORDS = {
"ሰላም":"hello","ስሜ":"my name","አልማዝ":"Almaz (a woman's name; it means “diamond”)","ነው":"is","እኔ":"I","ተማሪ":"student","ነኝ":"I am",
"ይህ":"this","ቤቴ":"my house, my home","አባቴ":"my father","ሐኪም":"doctor","እናቴ":"my mother","አስተማሪ":"teacher","ናት":"she is",
"ታላቅ":"elder","ወንድሜ":"my brother","ሹፌር":"driver","ታናሽ":"younger","እህቴ":"my sister","ትንሽ":"small, little","ልጅ":"child",
"አያቴ":"my grandmother, my grandfather","ደግ":"kind","ውሻችን":"our dog (ውሻ + -አችን “our”)","ስሙ":"his name","ቦቢ":"Bobby (a name)","ቆንጆ":"good-looking","ውሻ":"dog",
"ዳዊት":"Dawit (a man's name: David)","ነጋዴ":"trader, businessman","ትልቅ":"big","ቤት":"house, home","አለው":"he has","ሁለት":"two","መኪና":"car","እና":"and",
"ሦስት":"three","ስልክ":"phone","አራት":"four","ልጆች":"children","አሉት":"he has (them)","ብዙ":"a lot of, many","ገንዘብ":"money","ግን":"but","ጊዜ":"time",
"የለውም":"he doesn't have","ጓደኛው":"his friend","ሳሙኤል":"Samuel","ገንዘቡ":"his money","ጥቂት":"a little, a few","አንድ":"one, a","ድመት":"cat",
"ማን":"who?","ደስተኛ":"happy","ዳዊትና":"Dawit and (-ና “and”)",
"የአያቴ":"my grandmother's (የ- “of”)","ቤቱ":"the house","ውስጥ":"in, inside","ጀበና":"coffee pot","አለ":"there is","ጠረጴዛው":"the table","ላይ":"on",
"ስኒዎች":"little coffee cups","አሉ":"there are","ቡና":"coffee","በስኳር":"with sugar","እጠጣለሁ":"I drink","ያለ":"without","ስኳር":"sugar",
"ትጠጣለች":"she drinks","አትጠጣም":"she doesn't drink","ወተት":"milk","ትፈልጋለች":"she wants","ለምሳ":"for lunch (ለ- “for”)","እንጀራ":"injera",
"በሽሮ":"with shiro","እንበላለን":"we eat","ሽሮው":"the shiro","ጣፋጭ":"tasty","ብሉ":"eat! (to several people)",
"ረጅም":"long, tall","ቀን":"day","ትናንት":"yesterday","ጠዋት":"morning","ተነሣሁ":"I got up","ቁርስ":"breakfast","በላሁ":"I ate","ጠጣሁ":"I drank","ወደ":"to",
"ሥራ":"work","ሄድኩ":"I went","ነበር":"was","ከሰዓት":"afternoon (with በኋላ: ከሰዓት በኋላ)","በኋላ":"after","ደወለች":"she rang","ማታ":"in the evening",
"ገበያ":"market","ዳቦ":"bread","ገዛሁ":"I bought","ተመለስኩ":"I came back","ፊልም":"film","አየሁ":"I saw, I watched","ፊልሙን":"the film (-ን marks the object)",
"አልጨረስኩም":"I didn't finish","ሶፋው":"the sofa","ተኛሁ":"I slept, I lay down",
"ቶም":"Tom","ባቡር":"train","ጣቢያ":"station","ይፈልጋል":"he looks for, he wants","ይቅርታ":"excuse me","የት":"where?","ሴትዮዋ":"the woman",
"ቀጥ":"straight (with ብለህ: ቀጥ ብለህ “straight on”)","ብለህ":"(you) going (in ቀጥ ብለህ)","ሂድ":"go! (to a man)","ጣቢያው":"the station","ባንኩ":"the bank",
"አጠገብ":"next to","ሩቅ":"far","አይ":"no","ቅርብ":"near","በእግሩ":"on foot (by his foot)","ሄደ":"he went","ደረሰ":"he arrived, he reached",
"ቲኬት":"ticket","ገዛ":"he bought","ባቡሩ":"the train","ሄዶ":"(having) gone (with ነበር: had gone)","ሌላ":"another, other","መቼ":"when?","ይመጣል":"he comes, it comes",
"ሰውዬው":"the man","ነገ":"tomorrow",
"የመስቀል":"Meskel's, for Meskel (የ- “of”)","ዕቅድ":"plan","መስቀል":"Meskel (the festival of the Cross; also “cross”)","በዓል":"festival, holiday","ሳራ":"Sara",
"ደመራ":"Demera, the Meskel bonfire","ማየት":"to see","እፈልጋለሁ":"I want","ዮናስ":"Yonas (Jonah)","በእርግጥ":"of course","እንሂድ":"let's go",
"እንገናኝ":"let's meet, shall we meet?","ቤተ":"house of (in ቤተ ክርስቲያን “church”)","ክርስቲያኑ":"(the) church (with ቤተ)","ዶሮ":"chicken","ወጥ":"stew",
"ትሠራለች":"she makes, she is making","ቤታችን":"our house (to our house)","መምጣት":"to come","ትችላለህ":"can you? you can (to a man)","ምናልባት":"maybe",
"መሥራት":"to work","አለብኝ":"I have to","እሺ":"OK","መልካም":"good, happy","እንኳን":"glad that… (in እንኳን አደረሰሽ)","አደረሰሽ":"(God) brought you (f) to it: happy holiday!",
"ቁልፌ":"my key","ተነሥቼ":"I got up and…","ታጠብኩ":"I washed","ልብሴን":"my clothes (-ን marks the object)","ለብሼ":"I put on and…","ከዚያ":"then",
"ቁልፌን":"my key (-ን marks the object)","ፈለግኩ":"I looked for","የለም":"it isn't there","ቦርሳዬ":"my bag","መጀመሪያ":"first","መኝታ":"sleeping (መኝታ ቤት “bedroom”)",
"ሄጄ":"I went and…","ኩሽና":"kitchen","ሮጬ":"I ran and…","በመጨረሻ":"in the end","አገኘሁ":"I found","ኪሴ":"my pocket","ቶሎ":"quickly",
"አውቶቡሱን":"the bus (-ን marks the object)","ያዝኩ":"I caught, I held",
"ሠርጉ":"the wedding","ሠርግ":"wedding","ነበርኩ":"I was","ሰዎች":"people","መጥተው":"(having) come (with ነበር: had come)","ነጭ":"white","ቀሚስ":"dress",
"የለበሰችው":"(the one) who is wearing (a woman)","ሴት":"woman","ሙሽሪት":"bride","ጥቁር":"black","ኮት":"coat","የለበሰው":"(the one) who is wearing (a man)",
"ሰው":"man, person","ሙሽራው":"the groom","መነጽር":"glasses","ያደረገው":"(the one) who has on (a man)","አጭር":"short","አባቷ":"her father",
"ሰማያዊ":"blue","እናቷ":"her mother","ለሙሽሪት":"to the bride (ለ- “to”)","ስጦታ":"present","ሰጠቻት":"she gave her","ስጦታው":"the present",
"ምንድን":"what? (with ነው: what is it?)","ቀይ":"red","የገዛሁት":"(the one) I bought","ስጦታም":"the present too (-ም “too”)",
"መኪናው":"the car","ተበላሸ":"it broke down","ቅዳሜ":"on Saturday","ሀዋሳ":"Hawassa (a city in the south)","ሄድን":"we went","መንገድ":"road",
"መኪናችን":"our car","መኪናውን":"the car (-ን marks the object)","መንገዱ":"the road","ዳር":"edge, side","አቆመው":"he stopped it","ቆሞ":"stopped and…",
"ረዳን":"he helped us","ጋራዥ":"garage","ወሰደን":"he took us","ጋራዡ":"the garage","ጎበዝ":"clever, good at things","ሚስቱ":"his wife",
"አፈላችልን":"she made (boiled) for us","ከአንድ":"from one (ከ- “from”; ከአንድ ሰዓት በኋላ “after an hour”)","ሰዓት":"hour","ተሠራ":"it was made, it was mended",
"ደረስን":"we arrived"
};
