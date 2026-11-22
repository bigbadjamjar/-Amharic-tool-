/* ---------- culture notes ----------
   Short notes on everyday Ethiopian life, each linked to the course units it goes with.
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
  "To turn Ethiopian time into the clock you know, add or take away six hours. When you make plans, check which clock someone means: Ethiopian time, or {በፈረንጅ|beferenj} “foreign” time."],
 "phrases":[
  ["ስንት ሰዓት ነው?","sint se'at new?","what time is it?"],
  ["ከጠዋቱ ሦስት ሰዓት","ket'ewatu sost se'at","3 o'clock in the morning (9 a.m.)"],
  ["ከቀኑ ሰባት ሰዓት","keqenu sebat se'at","7 o'clock in the day (1 p.m.)"],
  ["ከምሽቱ ሁለት ሰዓት","kemishitu hulet se'at","2 o'clock in the evening (8 p.m.)"]]},

{"id":"calendar","units":[14],"icon":"📅","title":"The Ethiopian calendar","intro":"Thirteen months, and a New Year in September.",
 "p":[
  "Ethiopia has its own calendar, seven or eight years behind the one used in Europe: from September 2026 to September 2027, it is the year 2019 in Ethiopia.",
  "There are thirteen months: twelve of exactly 30 days, and a short thirteenth month, {ጳጉሜ|p'agumé}, of five days, or six in a leap year. That's where the old tourist slogan “thirteen months of sunshine” comes from.",
  "New Year's Day, {እንቁጣጣሽ|inqut'at'ash}, is 11 September (12 September in some years), at the end of the long rainy season, when yellow {አደይ አበባ|adey abeba} flowers cover the hills. Children go from door to door singing, and give drawings of flowers."],
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
  "Money is the {ብር|birr}, which is divided into 100 {ሳንቲም|santim}."],
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
  ["የማያውቁት አገር አይናፍቅም","yemayawqut ager aynafqim","you don't miss a country you have never known"]]}
];
