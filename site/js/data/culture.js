/* ---------- culture notes ----------
   Notes on Ethiopia, its peoples and everyday life, shown in the Culture tab (js/ethiopia.js, which also
   sorts them into groups). units: the course units a note goes with (may be empty). facts: optional
   [label, value] pairs shown as a small table.
   p: paragraphs. {fidel|transcription} marks an Amharic example, as in the course notes.
   phrases: [Amharic, transcription, English, note?]. A note marks one a native speaker should look at.
   Written for this app. The audio run reads every Amharic string in this file. */
const CULTURE = [
{"id":"greet","units":[1,2],"icon":"🤝","title":"Greetings take time","intro":"Why a hello can last a minute, and how to show respect.",
 "p":[
  "Greetings are never rushed. Friends and relatives shake hands, often touch shoulders, or kiss on the cheek three times. People ask how you are, then about your family, your work and your health, and often go round again before getting to the point. Cutting this short can seem cold.",
  "Show respect to older people: greet them first, bow your head a little, and call them {እርስዎ|irswo} rather than {አንተ|ante} or {አንቺ|anchi}. Some people shake with both hands, or hold their right arm with their left hand while they shake, as a mark of respect.",
  "When you walk into a room, greet everyone in it, not just the person you came to see."],
 "phrases":[
  ["ጤና ይስጥልኝ","t'éna yist'illign","hello (polite)"],
  ["እንደምን አደሩ?","indemin aderu?","good morning (to someone older: “how did you spend the night?”)"],
  ["ቤተሰብ ደህና ነው?","béteseb dehna new?","is the family well?"],
  ["ሥራ እንዴት ነው?","sira indét new?","how is work?"],
  ["እግዚአብሔር ይመስገን","igziabhér yimesgen","thank God (the usual answer)"]]},

{"id":"names","units":[2,3],"icon":"🪪","title":"Names and titles","intro":"No surnames: your name is your own name plus your father's.",
 "p":[
  "Ethiopians don't have a family surname. A person's full name is their own name followed by their father's name, and sometimes their grandfather's. So if Abebe Kebede has a daughter called Hanna, she is Hanna Abebe. A woman keeps her own name when she marries.",
  "That's why people are called by their first name, even formally. Mr Abebe Kebede is {አቶ አበበ|ato abebe}, never “Mr Kebede”. The titles are {አቶ|ato} “Mr”, {ወይዘሮ|weyzero} “Mrs” and {ወይዘሪት|weyzerit} “Miss”.",
  "Many names have a clear meaning: {አበበ|abebe} “he blossomed”, {ፍቅር|fikir} “love”, {ሰላም|selam} “peace”, {አልማዝ|almaz} “diamond”. Asking what someone's name means is a friendly way to start a conversation."],
 "phrases":[
  ["አቶ","ato","Mr"],
  ["ወይዘሮ","weyzero","Mrs"],
  ["ወይዘሪት","weyzerit","Miss"],
  ["ስምህ ምን ማለት ነው?","simih min malet new?","what does your name mean? (to a man)"],
  ["ስምሽ ምን ማለት ነው?","simish min malet new?","what does your name mean? (to a woman)"]]},

{"id":"coffee","units":[7],"icon":"☕","title":"The coffee ceremony","intro":"Coffee comes from Ethiopia, and making it is an event.",
 "p":[
  "In a coffee ceremony the host, usually a woman, washes green coffee beans and roasts them in a flat pan over charcoal. When they are dark and smoking, she carries the pan round so that everyone can breathe in the smell.",
  "The beans are ground by hand and boiled in a clay pot, the {ጀበና|jebena}, then poured from a height into small cups, {ስኒ|sini}, usually with sugar (in the countryside sometimes with salt or butter). Incense, {ዕጣን|it'an}, burns nearby, fresh grass may be spread on the floor, and popcorn, {ፈንዲሻ|fendisha}, or roasted barley, {ቆሎ|qolo}, is passed round.",
  "There are three rounds: {አቦል|abol}, {ቶና|tona} and {በረካ|bereka}, which means “blessing”. It is a time for news and neighbours, and can take an hour or more. Leaving after the first cup can seem rushed, so stay for the third if you can."],
 "phrases":[
  ["ቡና ጠጡ","bunna t'et'u","have some coffee (an invitation, to a group)"],
  ["በጣም ጣፋጭ ነው","bet'am t'afach' new","it's very good"],
  ["ይበቃኛል","yibeqagnal","that's enough for me"],
  ["አመሰግናለሁ","ameseginallehu","thank you"]]},

{"id":"food","units":[7],"icon":"🫓","title":"Eating together","intro":"One big tray, the right hand, and a mouthful from a friend.",
 "p":[
  "A meal is shared from one big tray. {እንጀራ|injera}, the soft, slightly sour flatbread made from teff, covers the tray and the stews, {ወጥ|wet'}, are spooned on top. Tear off a piece with your right hand and use it to pick up the food. Hands are washed before eating, often at the table, with a jug and a bowl.",
  "Putting a mouthful into someone else's mouth, {ጉርሻ|gursha}, is a sign of love and respect. If someone offers you a gursha, take it!",
  "Hosts keep pressing you to eat more: {ብላ|bila} “eat!” to a man, {ብዪ|biyi} to a woman, {ብሉ|bilu} to a group. Many Orthodox Christians fast on Wednesdays and Fridays and for long seasons before Easter and Christmas, eating no meat, milk or eggs, and many Muslims fast in Ramadan. Fasting food, {የጾም ምግብ|yets'om migib}, is one reason so many Ethiopian dishes, like {ሽሮ|shiro} and {ምስር ወጥ|misir wet'}, are vegan."],
 "phrases":[
  ["ብላ","bila","eat! (to a man)"],
  ["ብዪ","biyi","eat! (to a woman)"],
  ["ጠግቤአለሁ","t'egbéallehu","I'm full"],
  ["በቃኝ","beqagn","that's enough for me"]]},

{"id":"time","units":[8,12],"icon":"🕰️","title":"Ethiopian time","intro":"The day starts at sunrise, so 7 in the morning is 1 o'clock.",
 "p":[
  "Ethiopians usually count the hours of the day from sunrise, not from midnight. Around 6 in the morning is 12 o'clock, so 7 a.m. is 1 o'clock, {አንድ ሰዓት|and se'at}, and midday is 6 o'clock, {ስድስት ሰዓት|siddist se'at}.",
  "The night is counted the same way from sunset: 7 p.m. is 1 o'clock in the evening and midnight is 6. So close to the equator, day and night are about the same length all year, so it works well.",
  "To turn Ethiopian time into the clock you know, take 6 off the Western time (or add 6, it comes to the same on a 12-hour clock): 9 a.m. is 3 o'clock, 2 p.m. is 8 o'clock, 8 p.m. is 2 o'clock. A watch looks the same; you just read the hour from the opposite side of the face.",
  "Phones, flights and offices may use the Western clock, so when you make plans, check which clock someone means: {በኢትዮጵያ ሰዓት?|be'ityop'ya se'at?} “by Ethiopian time?” or {በፈረንጅ ሰዓት?|beferenj se'at?} “by Western (foreign) time?”"],
 "phrases":[
  ["ስንት ሰዓት ነው?","sint se'at new?","what time is it?"],
  ["ከጠዋቱ ሦስት ሰዓት","ket'ewatu sost se'at","3 o'clock in the morning (9 a.m.)"],
  ["ከቀኑ ሰባት ሰዓት","keqenu sebat se'at","7 o'clock in the day (1 p.m.)"],
  ["ከምሽቱ ሁለት ሰዓት","kemishitu hulet se'at","2 o'clock in the evening (8 p.m.)"]]},

{"id":"calendar","units":[14],"icon":"📅","title":"The Ethiopian calendar","intro":"Thirteen months, and a New Year in September.",
 "p":[
  "Ethiopia has its own calendar, seven or eight years behind the one used in Europe: 8 behind until New Year in September, then 7. From September 2026 to September 2027, it is the year 2019 in Ethiopia. Write {ዓ.ም.|amete mihret} after an Ethiopian year.",
  "There are thirteen months: twelve of exactly 30 days, and a short thirteenth month, {ጳጉሜ|p'agumé}, of five days, or six in a leap year. That's where the old tourist slogan “thirteen months of sunshine” comes from.",
  "New Year's Day, {እንቁጣጣሽ|inqut'at'ash}, is 11 September (12 September in some years), at the end of the long rainy season, when yellow {አደይ አበባ|adey abeba} flowers cover the hills. Children go from door to door singing, and give drawings of flowers.",
  "To give a date, say the month, then the day: {ኅዳር አሥራ ሦስት|hidar asra sost} “Hidar 13”."],
 "phrases":[
  ["መልካም አዲስ ዓመት","melkam addis amet","happy new year"],
  ["መስከረም","meskerem","Meskerem, the first month"],
  ["ጳጉሜ","p'agumé","Pagume, the thirteenth month"],
  ["ዛሬ ስንት ነው?","zaré sint new?","what's the date today?"]]},

{"id":"holidays","units":[14],"icon":"🕯️","title":"Holidays and holiday greetings","intro":"Meskel bonfires, Christmas in January, and the greeting for every festival.",
 "p":[
  "{መስቀል|meskel}, on 27 September, celebrates the finding of the True Cross. On the evening before, a huge bonfire, the {ደመራ|demera}, is lit in squares across the country. The festival is on UNESCO's list of world cultural heritage.",
  "Christmas, {ገና|genna}, is on 7 January and Epiphany, {ጥምቀት|t'imqet}, on 19 January, when each church carries its tabot, a copy of the Ark of the Covenant, in a colourful procession to water. Easter, {ፋሲካ|fasika}, comes after a 55-day fast, on a different date each year. The two Eids, {ኢድ አልፈጥር|id alfet'ir} and {አረፋ|arefa}, are national holidays too, and Adwa Victory Day, 2 March, remembers the defeat of the Italian army in 1896.",
  "For any festival, the greeting is {እንኳን አደረሰህ|inkwan aderreseh} to a man, {እንኳን አደረሰሽ|inkwan aderresesh} to a woman, or {እንኳን አደረሳችሁ|inkwan aderresachihu} to a group: roughly “how good that God brought you to this day”. The answer is {እንኳን አብሮ አደረሰን|inkwan abro aderresen}, “and brought us here together”."],
 "phrases":[
  ["መልካም በዓል","melkam beal","happy holiday"],
  ["እንኳን አደረሰህ","inkwan aderreseh","happy holiday (to a man)"],
  ["እንኳን አደረሰሽ","inkwan aderresesh","happy holiday (to a woman)"],
  ["እንኳን አደረሳችሁ","inkwan aderresachihu","happy holiday (to a group)"],
  ["እንኳን አብሮ አደረሰን","inkwan abro aderresen","and to you (the answer)"]]},

{"id":"market","units":[11],"icon":"🧺","title":"Bargaining at the market","intro":"Friendly haggling, and the famous Merkato.",
 "p":[
  "Addis Ababa's {መርካቶ|merkato} is one of the biggest open-air markets in Africa: a maze of streets where you can buy anything from spices to sofas. In markets and small shops, prices are often open to discussion, though supermarkets and many shops have fixed prices.",
  "Bargaining is friendly, not a fight. Greet the seller first and ask the price. If it seems high, smile, say it's expensive and ask them to come down. Name a price you are happy with and meet somewhere in the middle. Buying several things from the same person helps.",
  "Money is the {ብር|birr}, which is divided into 100 {ሳንቲም|santim}. Say the number, then {ብር|birr}: {ሃምሳ ብር|hamsa birr} 50 birr. For birr and santim, join the santim on with {ከ-|ke-}: {አሥር ብር ከሃምሳ ሳንቲም|assir birr kehamsa santim} 10.50 birr. Santim are rare in shops now, but you will see them on bills.",
  "Ask {ስንት ነው?|sint new?} “how much is it?” The answer is usually just the price and {ነው|new} “it is”: {ቡና ሠላሳ ብር ነው|buna selasa birr new} “coffee is 30 birr”."],
 "phrases":[
  ["ስንት ነው?","sint new?","how much is it?"],
  ["ዋጋው ስንት ነው?","wagaw sint new?","what's the price?"],
  ["ውድ ነው","wid new","it's expensive"],
  ["ቀንሱልኝ","qenisullign","lower the price for me"],
  ["የመጨረሻ ዋጋ ስንት ነው?","yemech'ersha waga sint new?","what's your last price?"]]},

{"id":"taxi","units":[12],"icon":"🚐","title":"Minibus taxis","intro":"How to ride, and how to get off.",
 "p":[
  "The cheapest way round Addis Ababa is the blue-and-white minibus taxi. Each one runs along a fixed route. A conductor, the {ወያላ|weyala}, leans out of the door calling out where it's going, and collects the fares.",
  "Many routes have no fixed stops. When you want to get off, call out {ወራጅ አለ!|werraj alle!} “someone's getting off!”. In smaller towns, three-wheeled {ባጃጅ|bajaj} taxis are everywhere, and long journeys start from the bus station, the {መናኸሪያ|menahariya}."],
 "phrases":[
  ["ወራጅ አለ","werraj alle","someone's getting off (please stop)"],
  ["ወዴት ነው?","wedét new?","where is it going?"],
  ["እዚህ አቁም","izzih aqum","stop here (to a man)"],
  ["ሂሳብ ስንት ነው?","hisab sint new?","how much is the fare?"]]},

{"id":"care","units":[13],"icon":"💐","title":"When someone is ill","intro":"Visiting, and what to say.",
 "p":[
  "Visiting someone who is ill is an important duty. Friends, neighbours and colleagues come to the house or the hospital, often bringing food or drinks, and people notice if you don't come.",
  "The thing to say is {እግዚአብሔር ይማርህ|igziabhér yimarih}, “may God heal you”, to a man, or {እግዚአብሔር ይማርሽ|igziabhér yimarish} to a woman.",
  "When someone dies, people go to the family's home to mourn with them, {ለቅሶ|leqso}, often for several days. Many neighbourhoods have an {እድር|idir}, a community group whose members pay a little each month and help families with funeral costs and support."],
 "phrases":[
  ["እግዚአብሔር ይማርህ","igziabhér yimarih","get well (to a man: “may God heal you”)"],
  ["እግዚአብሔር ይማርሽ","igziabhér yimarish","get well (to a woman)"],
  ["ቶሎ ይሻልህ","tolo yishalih","get better soon (to a man)"],
  ["ምን ሆንክ?","min honk?","what's wrong? what happened to you? (to a man)"]]},

{"id":"proverbs","units":[16,18],"icon":"🦁","title":"Proverbs","intro":"Amharic speakers love a good proverb.",
 "p":[
  "Proverbs, {ምሳሌ|misalé}, turn up everywhere: in conversation, in speeches and in arguments. Using one at the right moment will delight people. Here are a few well-known ones, with what they say word for word and what they mean."],
 "phrases":[
  ["ቀስ በቀስ እንቁላል በእግሩ ይሄዳል","qess beqess inqulal be'igru yihédal","slowly, slowly, an egg will walk on its own legs (be patient)"],
  ["ድር ቢያብር አንበሳ ያስር","dir biyabir anbessa yasir","when spider webs join together, they can tie up a lion (unity is strength)"],
  ["ሲሮጡ የታጠቁት ሲሮጡ ይፈታል","sirot'u yetat'equt sirot'u yifetal","what you tie on while running comes undone while running (more haste, less speed)"],
  ["ያልጠረጠረ ተመነጠረ","yalt'eret'ere temenet'ere","whoever didn't suspect got plucked (be careful)"],
  ["የማያውቁት አገር አይናፍቅም","yemayawqut ager aynafqim","you don't miss a country you have never known"]]},

/* ---------- added for the Ethiopia tab ---------- */
{"id":"country","units":[2,6],"icon":"🌍","title":"The country at a glance","intro":"Where Ethiopia is, what the land is like, and a few key facts.",
 "facts":[["Capital","Addis Ababa"],["People","about 130 million, the second most in Africa"],["Languages","more than 80; Amharic is the main one shared"],["Money","the birr"],["Highest point","Ras Dashen, 4,550 m"],["Calendar","its own, with 13 months"]],
 "p":[
  "Ethiopia, {ኢትዮጵያ|ityop'ya}, is in the Horn of Africa, the part of East Africa that reaches out towards Arabia. Its neighbours are Eritrea, Djibouti, Somalia, Kenya, South Sudan and Sudan. It has had no coast since Eritrea became independent in 1993, so most of its trade goes through the port of Djibouti.",
  "Much of the country is a high plateau, split in two by the Great Rift Valley. The highlands are cool and green, and Addis Ababa, at about 2,350 metres, is one of the highest capital cities in the world. The Simien Mountains in the north rise to Ras Dashen, 4,550 metres. In the far north-east, the Danakil Depression drops more than 100 metres below sea level and is one of the hottest places on Earth.",
  "Rain sets the rhythm of the year. The long rains, {ክረምት|kiremt}, fall from about June to September, and the main dry season, {በጋ|bega}, follows. The Blue Nile, {ዓባይ|abbay}, flows out of Lake Tana and carries much of the water that reaches Egypt. The huge Grand Ethiopian Renaissance Dam on it, opened in 2025, is a source of great national pride.",
  "Some animals live nowhere else on Earth: the gelada, a grass-eating monkey with a bright red patch on its chest, the Ethiopian wolf and the walia ibex all live in the high mountains.",
  "The capital, {አዲስ አበባ|addis abeba}, means “new flower”. Emperor Menelik II and Empress Taytu founded it in 1886. Today it is home to the African Union and to several million people."],
 "phrases":[
  ["ኢትዮጵያ","ityop'ya","Ethiopia"],
  ["ኢትዮጵያዊ ነኝ","ityop'yawi negn","I'm Ethiopian (a man)"],
  ["ኢትዮጵያዊት ነኝ","ityop'yawit negn","I'm Ethiopian (a woman)"],
  ["ሀገሬ","hageré","my country"],
  ["ኢትዮጵያ ቆንጆ ሀገር ናት","ityop'ya qonjo hager nat","Ethiopia is a beautiful country","ናት (feminine) for a country: is that the usual choice?"]]},

{"id":"regions","units":[2,12],"icon":"🗺️","title":"Regions and cities","intro":"A federation of regions, and the places every Ethiopian knows.",
 "p":[
  "Ethiopia is a federation. It is divided into regional states, {ክልል|kilil}, most of them drawn around the main language spoken there, plus two cities that run their own affairs: Addis Ababa and Dire Dawa. Several new regions have been formed since 2019, and there are now twelve.",
  "The biggest regions by population are Oromia, which surrounds Addis Ababa and stretches east, south and west, and Amhara, in the north-west highlands. Tigray is in the far north, Afar in the hot lowlands of the north-east, and the Somali region in the dry east. The south and south-west are home to dozens of smaller peoples, each with its own language.",
  "Some places every Ethiopian knows: {አክሱም|aksum}, the ancient capital with its tall stone obelisks; {ላሊበላ|lalibela}, where churches were carved down into solid rock; {ጎንደር|gonder}, the city of castles; {ባሕር ዳር|bahir dar}, on the shore of Lake Tana; and {ሐረር|harer}, the old walled Muslim city in the east, where men feed wild hyenas at night. Aksum, Lalibela, Gondar's castles and Harar's old town are all UNESCO World Heritage sites.",
  "Even so, most Ethiopians live in the countryside, {ገጠር|get'er}, rather than in a town, {ከተማ|ketema}, and many families have relatives in both."],
 "phrases":[
  ["ከየት ነህ?","keyet neh?","where are you from? (to a man)"],
  ["ከየት ነሽ?","keyet nesh?","where are you from? (to a woman)"],
  ["ከአዲስ አበባ ነኝ","ke'addis abeba negn","I'm from Addis Ababa"],
  ["ከተማ","ketema","town, city"],
  ["ገጠር","get'er","the countryside"]]},

{"id":"peoples","units":[2],"icon":"🗣️","title":"Peoples and languages","intro":"More than 80 languages, and the one most people share.",
 "p":[
  "Ethiopia is home to more than 80 peoples, each with its own language and traditions. The largest are the Oromo, about a third of the population, and the Amhara, about a quarter. Then come the Somali, the Tigrayans, the Sidama, the Gurage, the Wolayta, the Afar and many more.",
  "The languages belong to four families. Amharic, Tigrinya and the Gurage languages are Semitic, related to Arabic and Hebrew. Afaan Oromo, Somali, Afar and Sidama are Cushitic. Wolayta and its neighbours are Omotic, and in the far west Nuer and Anuak are Nilo-Saharan.",
  "Amharic, {አማርኛ|amarigna}, is the working language of the federal government and the language that most Ethiopians share, whether they grow up with it or learn it at school. In 2020 the government agreed to add Afaan Oromo, Tigrinya, Somali and Afar as federal working languages too. Afaan Oromo, the language with the most speakers, is written in the Latin alphabet.",
  "The fidel you are learning comes from {ግዕዝ|ge'iz}, the language of ancient Aksum. Nobody speaks Ge'ez at home any more, but it is still the language of Orthodox church services, much as Latin was in Europe. Tigrinya and several other languages are written in fidel too.",
  "Be careful with the word {ሀበሻ|habesha}. Many people use it proudly for Ethiopians and Eritreans in general, but it first meant the peoples of the northern highlands, and not everyone is happy to be called it."],
 "phrases":[
  ["ቋንቋ","qwanqwa","language"],
  ["አማርኛ ትችላለህ?","amarigna tichilaleh?","can you speak Amharic? (to a man)"],
  ["አማርኛ ትችያለሽ?","amarigna tichiyalesh?","can you speak Amharic? (to a woman)"],
  ["ትንሽ ትንሽ","tinnish tinnish","a little"],
  ["ኦሮምኛ","oromigna","Afaan Oromo (its Amharic name)"],
  ["ትግርኛ","tigrigna","Tigrinya"]]},

{"id":"history","units":[9,16],"icon":"🏛️","title":"A short history","intro":"From Lucy to Adwa: one of the oldest countries in the world.",
 "p":[
  "Some of the oldest human ancestors ever found come from Ethiopia. The most famous is a skeleton about 3.2 million years old, found in the Afar region in 1974. Scientists named her Lucy; Ethiopians call her {ድንቅነሽ|dinqinesh}, “you are wonderful”. She is kept at the National Museum in Addis Ababa.",
  "About 2,000 years ago the kingdom of {አክሱም|aksum} grew rich on trade between the Mediterranean, Arabia and India. It minted its own coins and raised giant stone obelisks. In the 4th century King Ezana became a Christian, making Aksum one of the first Christian states in the world. Later rulers carved the rock churches of Lalibela, in the 12th and 13th centuries, and built the castles of Gondar, in the 17th.",
  "Ethiopia's emperors traced their line back to King Solomon and the Queen of Sheba, whose son Menelik I is said to have brought the Ark of the Covenant to Aksum. In the 19th century Tewodros II, Yohannes IV and Menelik II drew the country together again. In 1896 Menelik's army, with Empress Taytu, defeated an Italian invasion at {ዓድዋ|adwa}. Italy occupied the country from 1936 to 1941, but Ethiopia was never made a colony, and its green, yellow and red flag inspired the colours of many African countries at independence.",
  "Haile Selassie, the last emperor, ruled from 1930 to 1974. He was overthrown by a military government, the {ደርግ|derg}, whose years were marked by war, terror and the famine of 1983 to 1985. The Derg fell in 1991, Eritrea became independent in 1993, and a federal constitution followed in 1995. Since then Ethiopia has seen fast growth and also hard times, including the war in Tigray from 2020 to 2022."],
 "phrases":[
  ["ታሪክ","tarik","history"],
  ["ንጉሥ","nigus","king"],
  ["ንግሥት","nigist","queen"],
  ["ንጉሠ ነገሥት","niguse negest","emperor (“king of kings”)"],
  ["ድንቅነሽ","dinqinesh","Lucy (“you are wonderful”)"]]},

{"id":"faith","units":[14],"icon":"🕊️","title":"Faith","intro":"Ancient churches, ancient mosques, and a lot of fasting.",
 "p":[
  "Religion is part of everyday life. Around four in ten Ethiopians belong to the Ethiopian Orthodox Tewahedo Church, about a third are Muslim, and about a fifth are Protestant. Smaller numbers are Catholic or follow traditional beliefs. Christians and Muslims have lived side by side for centuries, and neighbours often share each other's celebrations.",
  "The Orthodox Church goes back to the 4th century. Every church keeps a {ታቦት|tabot}, which stands for the Ark of the Covenant and which only priests may see. On Sundays and holy days the churchyards fill with people dressed in white, and you will see people kiss the church gate or bow as they pass.",
  "Islam reached Ethiopia very early. In about the year 615, followers of the Prophet Muhammad who were being persecuted in Mecca crossed the Red Sea and were given shelter by the Christian king of Aksum, the {ነጋሺ|negashi}. Muslims still remember this kindness. The walled city of Harar, with its many mosques and shrines, has been a centre of Islamic learning for centuries.",
  "Fasting shapes the year. Orthodox Christians fast, eating no meat, milk or eggs, on most Wednesdays and Fridays and for long seasons such as the 55 days before Easter; the most devout fast on well over 180 days a year. Muslims fast from dawn to sunset in Ramadan. Fasting food is everywhere, so Ethiopia is an easy country to be a vegan in."],
 "phrases":[
  ["ቤተ ክርስቲያን","béte kristiyan","church"],
  ["መስጊድ","mesgid","mosque"],
  ["ጾም","ts'om","a fast, fasting"],
  ["ጾመኛ ነኝ","ts'omegna negn","I'm fasting","Is ጾመኛ ነኝ the natural way to say this?"],
  ["እግዚአብሔር ይባርክህ","igziabhér yibarkih","God bless you (to a man)"]]},

{"id":"dishes","units":[7],"icon":"🌶️","title":"Injera, wat and more","intro":"The grain, the spices, the favourite dishes and the drinks.",
 "p":[
  "{ጤፍ|t'éf} is a tiny grain grown almost only in Ethiopia. Its flour is mixed with water and left for a few days to turn slightly sour, then poured onto a big round griddle, the {ምጣድ|mit'ad}, to make {እንጀራ|injera}. Injera is part of almost every meal.",
  "The stews are called {ወጥ|wet'}. The red ones get their heat and colour from {በርበሬ|berberé}, a mix of dried chillies, garlic, ginger and many other spices, and their richness from {ንጥር ቅቤ|nit'ir qibé}, butter cooked with herbs and spices. The festival dish is {ዶሮ ወጥ|doro wet'}, chicken stew with hard-boiled eggs, which takes hours to make. Other favourites are {ጥብስ|t'ibs}, pieces of fried meat; {ክትፎ|kitfo}, minced beef in spiced butter, often eaten raw; and {ሽሮ|shiro}, a smooth stew of ground chickpeas.",
  "To drink there is coffee, of course, and also {ሻይ|shay}, sweet tea often spiced with cloves or cinnamon; {ጠጅ|t'ej}, honey wine; and {ጠላ|t'ella}, home-brewed beer. In the south, millions of people depend on {እንሰት|inset}, the “false banana”, whose stem and root are made into a flat bread called {ቆጮ|qoch'o}."],
 "phrases":[
  ["ምግቡ ይጣፍጣል","migibu yit'afit'al","the food is delicious"],
  ["ያቃጥላል?","yaqat'ilal?","is it spicy? (“does it burn?”)","Is this what people ask about hot food?"],
  ["ዶሮ ወጥ","doro wet'","chicken stew"],
  ["ውሃ እባክህ","wiha ibakih","water, please (to a man)"],
  ["ሂሳብ እባክህ","hisab ibakih","the bill, please (to a man)"]]},

{"id":"music","units":[],"icon":"🎶","title":"Music and dance","intro":"Shoulder dancing, one-string fiddles and Ethio-jazz.",
 "p":[
  "Ethiopian music has a sound of its own. It is built on a few five-note scales, called {ቅኝት|qignit}. The best known, {ትዝታ|tizita}, means memory or longing, and songs in it are full of nostalgia.",
  "Traditional instruments include the {ማሲንቆ|masinqo}, a one-string fiddle played with a bow; the {ክራር|krar}, a lyre with five or six strings; the {ዋሽንት|washint}, a bamboo flute; and the {ከበሮ|kebero}, a drum. The {በገና|begena}, a large ten-string lyre with a deep buzzing sound, is played for prayer and reflection, especially during fasts.",
  "In music bars, {አዝማሪ|azmari} singers make up witty verses on the spot about the people in the room, often with a double meaning, and the audience tips them. Church chant, {ዜማ|zéma}, is said to have been composed by Saint Yared in the 6th century.",
  "The dance everyone knows is {እስክስታ|iskista}, in which dancers move their shoulders, neck and chest at amazing speed, and every region has its own dances too. In the 1960s and 70s Addis Ababa had a lively music scene, with big bands and singers like Tilahun Gessesse and Mahmoud Ahmed, and Mulatu Astatke mixed Ethiopian scales with jazz to create Ethio-jazz. Today you'll hear stars like Teddy Afro everywhere."],
 "phrases":[
  ["ሙዚቃ","muziqa","music"],
  ["ዘፈን","zefen","song"],
  ["ዘፋኝ","zefagn","singer"],
  ["ጭፈራ","ch'ifera","dancing"],
  ["ይህን ዘፈን እወደዋለሁ","yihin zefen iwedewallehu","I love this song"]]},

{"id":"running","units":[],"icon":"🏃","title":"Running and sport","intro":"A barefoot marathon, a nation of runners, and football in every café.",
 "p":[
  "In 1960 {አበበ ቢቂላ|abebe biqila} won the Olympic marathon in Rome running barefoot, the first Olympic gold medal won by a black African. Four years later, in Tokyo, he won it again, this time in shoes.",
  "Since then Ethiopia has produced some of the greatest distance runners in history, among them Miruts Yifter, Haile Gebrselassie, Kenenisa Bekele and Tirunesh Dibaba, and Derartu Tulu, the first black African woman to win an Olympic gold. Many come from the highlands of Arsi, around the small town of Bekoji, where living and training high up builds strong lungs.",
  "Early in the morning, groups of runners train in the hills and forests around Addis Ababa, and the Great Ethiopian Run fills the streets of the capital with tens of thousands of people every year. Football, {እግር ኳስ|igir kwas}, is just as loved: people crowd into cafés to watch the big European leagues."],
 "phrases":[
  ["ሩጫ","rut'a","running, a race"],
  ["ሯጭ","rwach'","runner"],
  ["በርታ!","berta!","keep going! (to a man)"],
  ["በርቺ!","berchi!","keep going! (to a woman)"],
  ["ጎበዝ!","gobez!","well done!"]]},

{"id":"family","units":[3],"icon":"🏡","title":"Family and community","intro":"Big families, helpful neighbours, and saving money together.",
 "p":[
  "Family, {ቤተሰብ|béteseb}, comes first. Households are often big, and grandparents, aunts, uncles and cousins stay close. Older people are listened to and looked after, and children learn early to greet guests, serve their elders and run errands.",
  "Neighbours, {ጎረቤት|gorebét}, matter almost as much as family. People drop in without warning, borrow and lend, and share food on holidays. Two community groups are found almost everywhere: the {እድር|idir}, which helps a family when someone dies, and the {እቁብ|iqub}, a savings club where each member pays in every week or month and members take turns to receive the whole pot.",
  "Hospitality is a point of honour. A guest is always offered food and coffee, and saying no once is only politeness: the host will insist. Bring something small when you visit, like bread, fruit or coffee.",
  "For holidays, weddings and church, many women wear the {ሀበሻ ቀሚስ|habesha qemis}, a long white cotton dress with a woven, coloured border, and both women and men wrap themselves in a light white shawl, the {ነጠላ|net'ela}. In the cold highlands many people wear a thicker one, the {ጋቢ|gabi}."],
 "phrases":[
  ["ቤተሰብ","béteseb","family"],
  ["ጎረቤት","gorebét","neighbour"],
  ["እንኳን ደህና መጣህ","inkwan dehna met'ah","welcome (to a man)"],
  ["እንኳን ደህና መጣሽ","inkwan dehna met'ash","welcome (to a woman)"],
  ["ግባ ግባ","giba giba","come in, come in (to a man)"]]}

];
