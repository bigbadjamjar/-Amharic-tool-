/* ---------- dialogues ----------
   One short conversation per unit, written for this app. Each uses that unit's words and grammar
   (and anything from earlier units). In the app you can read it, play it all, or take one part:
   you hear the other person, then choose or build your reply, and hear it said.

   Kept as strict JSON between the [ and ] so tools/make_audio.py can read it:
   double quotes everywhere, no comments or trailing commas inside.
   who: the two speakers. g is "f" or "m" and picks the voice (female Mekdes, male Ameha).
   lines: [speaker, Amharic, transcription, English, note?]. A note marks a line a native speaker
   should look at, and says why. None of these has been checked yet; tools/native-check.mjs lists them all. */
const DIALOGUES = [
{"l":1,"title":"Bumping into a friend","scene":"Dawit and Sara meet in the street.",
 "who":{"A":{"name":"Dawit","am":"ዳዊት","g":"m"},"B":{"name":"Sara","am":"ሳራ","g":"f"}},
 "lines":[
  ["A","ሰላም፣ ሳራ! እንደምን ነሽ?","selam, sara! indemin nesh?","Hello, Sara! How are you?"],
  ["B","ደህና ነኝ፣ እግዚአብሔር ይመስገን። አንተስ?","dehna negn, igziabhér yimesgen. antes?","I'm fine, thank God. And you?"],
  ["A","እኔም ደህና ነኝ፣ አመሰግናለሁ።","iném dehna negn, ameseginallehu","I'm fine too, thank you."],
  ["B","ደህና ሁን፣ ዳዊት።","dehna hun, dawit","Goodbye, Dawit."],
  ["A","ደህና ሁኚ፣ ቻው።","dehna hugni, chaw","Goodbye, bye."]]},

{"l":2,"title":"Meeting someone new","scene":"Tom, a visitor from England, meets Hanna at a café.",
 "who":{"A":{"name":"Hanna","am":"ሃና","g":"f"},"B":{"name":"Tom","am":"ቶም","g":"m"}},
 "lines":[
  ["A","ሰላም! ስምህ ማን ነው?","selam! simih man new?","Hello! What's your name?"],
  ["B","ስሜ ቶም ነው። ስምሽ ማን ነው?","simé tom new. simish man new?","My name is Tom. What's your name?"],
  ["A","ስሜ ሃና ነው። ከየት ነህ?","simé hana new. keyet neh?","My name is Hanna. Where are you from?"],
  ["B","ከእንግሊዝ ነኝ። አንቺስ?","ke'inglíz negn. anchis?","I'm from England. And you?"],
  ["A","ኢትዮጵያዊት ነኝ። ተማሪ ነህ?","ityop'iyawit negn. temari neh?","I'm Ethiopian. Are you a student?"],
  ["B","አይ፣ ተማሪ አይደለሁም፤ አስተማሪ ነኝ።","ay, temari aydellehum; astemari negn","No, I'm not a student; I'm a teacher."]]},

{"l":3,"title":"Family photos","scene":"Meron shows Yonas some photos on her phone.",
 "who":{"A":{"name":"Yonas","am":"ዮናስ","g":"m"},"B":{"name":"Meron","am":"ሜሮን","g":"f"}},
 "lines":[
  ["A","ይህ ማን ነው?","yih man new?","Who is this?"],
  ["B","ይህ አባቴ ነው። እሱ ሐኪም ነው።","yih abbaté new. issu hakim new","This is my father. He is a doctor."],
  ["A","ይቺስ? እናትሽ ናት?","yichis? innatish nat?","And this one? Is she your mother?"],
  ["B","አይ፣ ይቺ ታላቅ እህቴ ናት።","ay, yichi talaq ihté nat","No, this is my elder sister."],
  ["A","ያ ውሻሽ ነው?","ya wishash new?","Is that your dog?"],
  ["B","አዎ፣ ውሻዬ ነው። ጥሩ ውሻ ነው።","awo, wishayé new. t'iru wisha new","Yes, it's my dog. He's a good dog.","Check that ጥሩ ውሻ ነው sounds natural for “he's a good dog”."]]},

{"l":4,"title":"Children and pets","scene":"Abebe and Sara chat about their families.",
 "who":{"A":{"name":"Abebe","am":"አበበ","g":"m"},"B":{"name":"Sara","am":"ሳራ","g":"f"}},
 "lines":[
  ["A","ልጆች አሉሽ?","lijoch allush?","Do you have children?"],
  ["B","አዎ፣ ሦስት ልጆች አሉኝ፤ ሁለት ሴት ልጆችና አንድ ወንድ ልጅ።","awo, sost lijoch allugn; hulet sét lijochinna and wend lij","Yes, I have three children: two daughters and a son.","-ና “and” joined to ሴት ልጆች is not explained yet; check the joined form reads well."],
  ["A","ውሻ አለሽ?","wisha allesh?","Do you have a dog?"],
  ["B","ውሻ የለኝም፤ ሁለት ድመቶች አሉኝ። አንተስ?","wisha yellegnim; hulet dimmetoch allugn. antes?","I don't have a dog; I have two cats. And you?"],
  ["A","እኔ ልጆች የሉኝም፤ ውሻ ግን አለኝ።","iné lijoch yellugnim; wisha gin allegn","I don't have children, but I have a dog.","ግን “but” is not in the word list yet, and የሉኝም (plural “don't have”) is not in the tables. Check both."]]},

{"l":6,"title":"Asking the way","scene":"Tom is looking for a bank and asks Seble.",
 "who":{"A":{"name":"Tom","am":"ቶም","g":"m"},"B":{"name":"Seble","am":"ሰብለ","g":"f"}},
 "lines":[
  ["A","ይቅርታ፣ ባንኩ የት ነው?","yiqirta, banku yet new?","Excuse me, where is the bank?"],
  ["B","ባንኩ እዚያ ነው፣ ከፖስታ ቤቱ አጠገብ።","banku izziya new, keposta bétu at'egeb","The bank is over there, next to the post office."],
  ["A","አመሰግናለሁ። እዚህ አጠገብ ሱቅ አለ?","ameseginallehu. izzih at'egeb suq alle?","Thank you. Is there a shop near here?"],
  ["B","አዎ፣ ሱቅ አለ። ከባንኩ ፊት ለፊት ነው።","awo, suq alle. kebanku fit lefit new","Yes, there is a shop. It's opposite the bank.","Check ከባንኩ ፊት ለፊት for “opposite the bank”."],
  ["A","ገበያውስ? ሩቅ ነው?","gebeyawis? ruq new?","And the market? Is it far?"],
  ["B","አይ፣ ገበያው ሩቅ አይደለም። ቅርብ ነው።","ay, gebeyaw ruq aydellem. qirib new","No, the market isn't far. It's close."]]},

{"l":7,"title":"At the café","scene":"Yonas works in a café. Meron comes in.",
 "who":{"A":{"name":"Yonas","am":"ዮናስ","g":"m"},"B":{"name":"Meron","am":"ሜሮን","g":"f"}},
 "lines":[
  ["A","እንኳን ደህና መጣሽ! ምን ትፈልጊያለሽ?","inkwan dehna met'ash! min tifeligiyallesh?","Welcome! What would you like?"],
  ["B","ቡና እፈልጋለሁ፣ እባክህ።","bunna ifeligallehu, ibakih","I'd like coffee, please."],
  ["A","ስኳር ትፈልጊያለሽ?","sikkwar tifeligiyallesh?","Do you want sugar?"],
  ["B","አይ፣ ስኳር አልፈልግም። ውሃም እፈልጋለሁ።","ay, sikkwar alfeligim. wihamm ifeligallehu","No, I don't want sugar. I'd like water too.","Check -ም “too” on ውሃ here (ውሃም)."],
  ["A","እሺ። ምግብ ትፈልጊያለሽ?","ishi. migib tifeligiyallesh?","OK. Would you like some food?"],
  ["B","አዎ፣ እንጀራ በሽሮ እፈልጋለሁ።","awo, injera beshiro ifeligallehu","Yes, I'd like injera with shiro.","Check the በ “with” construction for food (እንጀራ በሽሮ)."]]},

{"l":8,"title":"Plans for the week","scene":"Dawit and Sara talk about their week.",
 "who":{"A":{"name":"Sara","am":"ሳራ","g":"f"},"B":{"name":"Dawit","am":"ዳዊት","g":"m"}},
 "lines":[
  ["A","ዛሬ ወደ ሥራ ትሄዳለህ?","zaré wede sira tihédalleh?","Are you going to work today?"],
  ["B","አዎ፣ በየቀኑ ወደ ሥራ እሄዳለሁ። አንቺስ?","awo, beyeqenu wede sira ihédallehu. anchis?","Yes, I go to work every day. And you?"],
  ["A","ዛሬ አልሠራም። ጠዋት አማርኛ እማራለሁ።","zaré alseram. t'ewat amarigna immarallehu","I'm not working today. This morning I'm studying Amharic."],
  ["B","እሑድ ቤተ ክርስቲያን ትሄጃለሽ?","ihud béte kristiyan tihéjallesh?","Do you go to church on Sunday?"],
  ["A","አዎ፣ እሑድ ቤተ ክርስቲያን እሄዳለሁ።","awo, ihud béte kristiyan ihédallehu","Yes, on Sunday I go to church."],
  ["B","እኔም እሄዳለሁ!","iném ihédallehu!","I go too!"]]},

{"l":9,"title":"What did you do yesterday?","scene":"Meron asks Yonas about his day off.",
 "who":{"A":{"name":"Meron","am":"ሜሮን","g":"f"},"B":{"name":"Yonas","am":"ዮናስ","g":"m"}},
 "lines":[
  ["A","ትናንት የት ነበርክ?","tinant yet nebberk?","Where were you yesterday?"],
  ["B","ቤት ነበርኩ። ትናንት አልሠራሁም።","bét nebberku. tinant alserahum","I was at home. I didn't work yesterday."],
  ["A","ፊልም አየህ?","film ayyeh?","Did you watch a film?"],
  ["B","አዎ፣ ትናንት ማታ ፊልም አየሁ። አንቺስ?","awo, tinant mata film ayyehu. anchis?","Yes, last night I watched a film. And you?"],
  ["A","ወደ ገበያ ሄድኩ፤ ዳቦና ቡና ገዛሁ።","wede gebeya hédku; dabbonna bunna gezzahu","I went to the market; I bought bread and coffee."],
  ["B","ዜናውን ሰማሽ?","zénawin semmash?","Did you hear the news?"],
  ["A","አይ፣ አልሰማሁም።","ay, alsemmahum","No, I didn't."]]},

{"l":11,"title":"Buying vegetables","scene":"Sara buys tomatoes from Abebe's stall.",
 "who":{"A":{"name":"Sara","am":"ሳራ","g":"f"},"B":{"name":"Abebe","am":"አበበ","g":"m"}},
 "lines":[
  ["A","ጤና ይስጥልኝ። አንድ ኪሎ ቲማቲም ስንት ነው?","t'éna yist'illign. and kilo timatim sint new?","Hello. How much is a kilo of tomatoes?"],
  ["B","ሠላሳ ብር ነው።","selasa birr new","It's thirty birr."],
  ["A","በጣም ውድ ነው! እባክህ፣ ቀንስልኝ።","bet'am wid new! ibakih, qenisillign","That's very expensive! Please bring the price down.","Check the singular command ቀንስልኝ alongside the plural ቀንሱልኝ."],
  ["B","እሺ፣ ሃያ አምስት ብር።","ishi, haya amist birr","OK, twenty-five birr.","Would a seller say this as it is, or add something like ይሁን?"],
  ["A","እሺ። ሁለት ኪሎ እፈልጋለሁ። ሽንኩርትም አለህ?","ishi. hulet kilo ifeligallehu. shinkurtim alleh?","OK. I'd like two kilos. Do you have onions too?"],
  ["B","አዎ፣ ሽንኩርቱ ርካሽ ነው፤ አንድ ኪሎ ሃያ ብር ነው።","awo, shinkurtu rikash new; and kilo haya birr new","Yes, the onions are cheap: twenty birr a kilo."]]},

{"l":12,"title":"Taking a taxi","scene":"Hanna takes a taxi driven by Dawit.",
 "who":{"A":{"name":"Hanna","am":"ሃና","g":"f"},"B":{"name":"Dawit","am":"ዳዊት","g":"m"}},
 "lines":[
  ["A","ሰላም! ወደ ፒያሳ ትሄዳለህ?","selam! wede piyassa tihédalleh?","Hello! Are you going to Piassa?"],
  ["B","አዎ፣ ነዪ፣ ተቀመጪ።","awo, ney, teqemmech'i","Yes, come, sit down."],
  ["A","ፒያሳ ሩቅ ነው?","piyassa ruq new?","Is Piassa far?"],
  ["B","አይ፣ ሩቅ አይደለም።","ay, ruq aydellem","No, it isn't far."],
  ["A","እዚህ አቁም፣ እባክህ።","izzih aqum, ibakih","Stop here, please."],
  ["B","እሺ። ደህና ሁኚ!","ishi. dehna hugni!","OK. Goodbye!"]]},

{"l":13,"title":"Not feeling well","scene":"Yonas sees that Meron looks unwell.",
 "who":{"A":{"name":"Yonas","am":"ዮናስ","g":"m"},"B":{"name":"Meron","am":"ሜሮን","g":"f"}},
 "lines":[
  ["A","ሰላም፣ ሜሮን! ደህና ነሽ?","selam, méron! dehna nesh?","Hello, Meron! Are you all right?"],
  ["B","አይ፣ ደህና አይደለሁም። ታምሜአለሁ።","ay, dehna aydellehum. tamméallehu","No, I'm not well. I'm ill."],
  ["A","ራስሽን ያምሻል?","rasishin yamishal?","Do you have a headache?","ያምሻል (“it hurts you”, to a woman) is not shown in the unit; check the form."],
  ["B","አዎ፣ ራሴን ያመኛል። በጣም ደክሞኛል።","awo, rasén yamegnal. bet'am dekmognal","Yes, I have a headache. I'm very tired."],
  ["A","መድኃኒት አለሽ? ውሃ ትፈልጊያለሽ?","medhanit allesh? wiha tifeligiyallesh?","Do you have any medicine? Do you want some water?"],
  ["B","መድኃኒት አለኝ። ውሃ እፈልጋለሁ፣ አመሰግናለሁ።","medhanit allegn. wiha ifeligallehu, ameseginallehu","I have medicine. I'd like some water, thank you."]]},

{"l":14,"title":"Making weekend plans","scene":"Dawit and Sara plan the weekend.",
 "who":{"A":{"name":"Dawit","am":"ዳዊት","g":"m"},"B":{"name":"Sara","am":"ሳራ","g":"f"}},
 "lines":[
  ["A","ቅዳሜ ምን ማድረግ ትፈልጊያለሽ?","qidamé min madreg tifeligiyallesh?","What do you want to do on Saturday?"],
  ["B","ምናልባት ወደ ገበያ መሄድ እፈልጋለሁ። ትመጣለህ?","minalbat wede gebeya mehéd ifeligallehu. timet'alleh?","Maybe I'll go to the market. Will you come?","Check ምናልባት with እፈልጋለሁ here: does it read as “maybe I'd like to go”?"],
  ["A","ቅዳሜ መሥራት አለብኝ። እሑድ እችላለሁ።","qidamé mesrat allebbign. ihud ichilallehu","On Saturday I have to work. On Sunday I can."],
  ["B","እሺ፣ እሑድ እንሂድ። ቡናም እንጠጣ!","ishi, ihud innihid. bunnam innit'et'a!","OK, let's go on Sunday. And let's have coffee too!"],
  ["A","በእርግጥ! ጠዋት እንገናኝ።","be'irgit'! t'ewat innigenagn","Of course! Let's meet in the morning."],
  ["B","እሺ፣ እሑድ ጠዋት እንገናኝ። ቻው!","ishi, ihud t'ewat innigenagn. chaw!","OK, see you on Sunday morning. Bye!"]]},

{"l":16,"title":"What did you do yesterday?","scene":"Hanna asks Tom how he spent his day.",
 "who":{"A":{"name":"Hanna","am":"ሃና","g":"f"},"B":{"name":"Tom","am":"ቶም","g":"m"}},
 "lines":[
  ["A","ትናንት ምን አደረግህ?","tinant min aderregih?","What did you do yesterday?"],
  ["B","ጠዋት ተነሥቼ ቡና ጠጣሁ። ከዚያ ወደ ገበያ ሄጄ ሙዝ ገዛሁ።","t'ewat tenesché bunna t'et'ahu. keziya wede gebeya héjé muz gezzahu","In the morning I got up and drank coffee. Then I went to the market and bought bananas."],
  ["A","ማታስ?","matas?","And in the evening?"],
  ["B","ማታ ሲኒማ ሄጄ ፊልም አየሁ።","mata sinima héjé film ayyehu","In the evening I went to the cinema and saw a film."],
  ["A","ከዚያ በኋላስ?","keziya behwalas?","And after that?","Check -ስ “and…?” on ከዚያ በኋላ."],
  ["B","ከዚያ በኋላ ቤት ተመልሼ ተኛሁ።","keziya behwala bét temelsé tegnahu","After that I came back home and went to sleep."]]},

{"l":17,"title":"Can you help me?","scene":"Sara needs a friend's phone number and asks Dawit.",
 "who":{"A":{"name":"Sara","am":"ሳራ","g":"f"},"B":{"name":"Dawit","am":"ዳዊት","g":"m"}},
 "lines":[
  ["A","ዳዊት፣ እባክህ እርዳኝ።","dawit, ibakih irdagn","Dawit, please help me."],
  ["B","እሺ፣ ምን ልርዳሽ?","ishi, min lirdash?","OK, how can I help you?","ልርዳሽ (“let me help you”, to a woman) is not taught; check the form."],
  ["A","ዮናስን ታውቀዋለህ?","yonasin tawqewalleh?","Do you know Yonas?"],
  ["B","አዎ፣ ትናንት አየሁት።","awo, tinant ayyehut","Yes, I saw him yesterday."],
  ["A","ቁጥሩን ስጠኝ፣ እባክህ።","qut'irun sit'egn, ibakih","Give me his number, please."],
  ["B","እሺ፣ መልእክት እልክልሻለሁ።","ishi, meliikt ilkillishallehu","OK, I'll send you a message.","Check the form እልክልሻለሁ “I'll send (it) to you (f)”."]]},

{"l":18,"title":"Why didn't you come?","scene":"Yonas missed Meron at class yesterday.",
 "who":{"A":{"name":"Yonas","am":"ዮናስ","g":"m"},"B":{"name":"Meron","am":"ሜሮን","g":"f"}},
 "lines":[
  ["A","ትናንት ለምን አልመጣሽም?","tinant lemin almet'ashim?","Why didn't you come yesterday?"],
  ["B","ስለታመምኩ ቤት ቀረሁ።","siletammemku bét qerrehu","I stayed at home because I was ill."],
  ["A","አሁን ደህና ነሽ? ነገ ትመጫለሽ?","ahun dehna nesh? nege timech'allesh?","Are you all right now? Will you come tomorrow?"],
  ["B","ጊዜ ካለኝ እመጣለሁ።","gizé kallegn imet'allehu","If I have time, I'll come."],
  ["A","ዝናብ ከዘነበስ?","zinab kezennebes?","And if it rains?","Check -ስ “and…?” on an “if” clause."],
  ["B","ዝናብ ከዘነበ እደውልልሃለሁ።","zinab kezennebe idewilillihallehu","If it rains, I'll ring you."]]},

{"l":19,"title":"Who's that?","scene":"At a family party, Abebe asks Hanna who people are.",
 "who":{"A":{"name":"Abebe","am":"አበበ","g":"m"},"B":{"name":"Hanna","am":"ሃና","g":"f"}},
 "lines":[
  ["A","ጥቁር ሸሚዝ የለበሰው ሰው ማን ነው?","t'iqur shemiz yelebbesew sew man new?","Who is the man in the black shirt?"],
  ["B","እሱ ወንድሜ ነው። ባንክ ውስጥ ይሠራል።","issu wendimé new. bank wist' yiseral","He's my brother. He works in a bank."],
  ["A","ሰማያዊ ቀሚስ የለበሰችውስ?","semayawi qemis yelebbesechiws?","And the woman in the blue dress?","Check -ስ on የለበሰችው with no noun after it."],
  ["B","እሷ አስተማሪዬ ናት።","isswa astemariyé nat","She's my teacher."],
  ["A","ትናንት የመጣችው ሴት የት አለች?","tinant yemet'achiw sét yet allech?","Where is the woman who came yesterday?"],
  ["B","ዛሬ አልመጣችም። ታማለች።","zaré almet'achim. tammalech","She didn't come today. She's ill.","Check ታማለች for “she is ill”."]]},

{"l":21,"title":"The shop is closed","scene":"Seble and Tom drive to the shops.",
 "who":{"A":{"name":"Seble","am":"ሰብለ","g":"f"},"B":{"name":"Tom","am":"ቶም","g":"m"}},
 "lines":[
  ["A","መኪናውን እዚህ አቁም።","mekinawin izzih aqum","Park the car here."],
  ["B","እሺ። ሱቁ ተከፍቷል?","ishi. suqu tekeftwal?","OK. Is the shop open?","Check ተከፍቷል for “it is open”, by analogy with ተዘግቷል."],
  ["A","አይ፣ ሱቁ ተዘግቷል።","ay, suqu tezegtwal","No, the shop is closed."],
  ["B","መቼ ይከፈታል?","meché yikkefetal?","When does it open?"],
  ["A","ከሰዓት በኋላ ይከፈታል።","kese'at behwala yikkefetal","It opens in the afternoon."],
  ["B","እሺ። ቤት ሄደን ሻይ እናፍላ።","ishi. bét héden shay innafla","OK. Let's go home and make some tea.","Check እናፍላ “let's make (tea)”."]]},
{"l":22,"title":"At the clinic","scene":"Tom isn't well and goes to see Dr Almaz.",
 "who":{"A":{"name":"Almaz","am":"አልማዝ","g":"f"},"B":{"name":"Tom","am":"ቶም","g":"m"}},
 "lines":[
  ["A","ጤና ይስጥልኝ። ምን ሆንክ?","t'éna yist'illign. min honk?","Hello. What's wrong?"],
  ["B","ጉሮሮዬን ያመኛል፤ ትኩሳትም አለብኝ።","gurorroyén yamegnal; tikkusatim allebbign","I have a sore throat, and a temperature too."],
  ["A","ከመቼ ጀምሮ?","kemeché jemro?","Since when?"],
  ["B","ከትናንት ጀምሮ። በጣም ደክሞኛል።","ketinant jemro. bet'am dekmognal","Since yesterday. I'm very tired."],
  ["A","ጉንፋን ነው። ይህን መድኃኒት በቀን ሦስት ጊዜ ውሰድ።","gunfan new. yihin medhanit beqen sost gizé wised","It's flu. Take this medicine three times a day."],
  ["B","እሺ። ነገ ሥራ መሄድ እችላለሁ?","ishi. nege sira mehéd ichilallehu?","OK. Can I go to work tomorrow?"],
  ["A","አይ፣ ለሁለት ቀን ቤት ብታርፍ ይሻላል።","ay, lehulet qen bét bitarf yishalal","No, you'd better rest at home for two days."],
  ["B","አመሰግናለሁ፣ ዶክተር።","ameseginallehu, doktor","Thank you, doctor."]]},

{"l":23,"title":"A room in Bahir Dar","scene":"Tom arrives at a hotel by Lake Tana, where Meron works.",
 "who":{"A":{"name":"Tom","am":"ቶም","g":"m"},"B":{"name":"Meron","am":"ሜሮን","g":"f"}},
 "lines":[
  ["A","ሰላም። አልጋ አለ?","selam. alga alle?","Hello. Have you got a room?"],
  ["B","አዎ፣ አለ። ለስንት ሌሊት?","awo, alle. lesint lélit?","Yes, we have. For how many nights?"],
  ["A","ለሁለት ሌሊት። ስንት ነው?","lehulet lélit. sint new?","For two nights. How much is it?"],
  ["B","ለአንድ ሌሊት ስምንት መቶ ብር ነው፤ ከቁርስ ጋር።","le'and lélit simint meto birr new; kequrs gar","It's eight hundred birr a night, with breakfast."],
  ["A","ጥሩ። ጣና ሐይቅን ለመጎብኘት መጣሁ። ጀልባ አለ?","t'iru. t'ana hayqin lemegobignet met'ahu. jelba alle?","Good. I've come to see Lake Tana. Is there a boat?"],
  ["B","አዎ፣ ጠዋት ይነሣል። ሹፌሩ እንዲወስድህ እነግረዋለሁ።","awo, t'ewat yinessal. shuféru indiwesdih inegrewallehu","Yes, it leaves in the morning. I'll tell the driver to take you.","Check እንዲወስድህ “(for him) to take you”."],
  ["A","በጣም አመሰግናለሁ!","bet'am ameseginallehu!","Thank you very much!"]]},

{"l":24,"title":"A busy morning","scene":"Hanna, the manager, stops by Abebe's desk.",
 "who":{"A":{"name":"Hanna","am":"ሃና","g":"f"},"B":{"name":"Abebe","am":"አበበ","g":"m"}},
 "lines":[
  ["A","አበበ፣ ምን እየሠራህ ነው?","abebe, min iyeserrah new?","Abebe, what are you working on?"],
  ["B","ለደንበኛው ኢሜይል እየጻፍኩ ነው።","ledenbegnaw iméyl iyets'afku new","I'm writing an email to the customer."],
  ["A","ጥሩ። ስብሰባው በአራት ሰዓት ይጀምራል።","t'iru. sibsebaw be'arat se'at yijemmiral","Good. The meeting starts at four o'clock (10 a.m.)."],
  ["B","ዛሬ ሥራ በዝቶብኛል። ከስብሰባው በኋላ ልጨርስ?","zaré sira beztobignal. kesibsebaw behwala lich'ers?","I'm very busy today. Shall I finish it after the meeting?"],
  ["A","እሺ። ዱሮ ሁልጊዜ ቶሎ ትጨርስ ነበር!","ishi. duro hulgizé tolo tich'ers nebber!","OK. You always used to finish quickly!"],
  ["B","አዎ፣ ግን አሁን ብዙ ደንበኞች አሉን።","awo, gin ahun bizu denbegnoch allun","Yes, but now we have lots of customers."]]},

{"l":26,"title":"Is Dawit there?","scene":"Sara rings Dawit's house, and his brother Yonas answers.",
 "who":{"A":{"name":"Yonas","am":"ዮናስ","g":"m"},"B":{"name":"Sara","am":"ሳራ","g":"f"}},
 "lines":[
  ["A","ሃሎ?","halo?","Hello?"],
  ["B","ሃሎ፣ ጤና ይስጥልኝ። ዳዊት አለ?","halo, t'éna yist'illign. dawit alle?","Hello. Is Dawit there?"],
  ["A","የለም፣ ወጥቷል። ማን ልበል?","yellem, wet'twal. man libel?","No, he's gone out. Who's calling?"],
  ["B","ሳራ ነኝ። ይቅርታ፣ ድምፅህ አይሰማም።","sara negn. yiqirta, dimts'ih aysemam","It's Sara. Sorry, I can't hear you very well."],
  ["A","ሳራ? እሺ። ማታ እንደሚመለስ ነግሮኛል።","sara? ishi. mata indemmimelles negrognal","Sara? OK. He told me he'll be back this evening.","Check ነግሮኛል “he has told me”."],
  ["B","ደውዬ ነበር በለው፤ ደውልልኝ በለው።","dewiyé nebber belew; dewilillign belew","Tell him I rang, and ask him to ring me."],
  ["A","እሺ፣ እነግረዋለሁ። ቻው!","ishi, inegrewallehu. chaw!","OK, I'll tell him. Bye!"]]},

{"l":27,"title":"Which café?","scene":"Hanna and Dawit can't agree where to have coffee.",
 "who":{"A":{"name":"Hanna","am":"ሃና","g":"f"},"B":{"name":"Dawit","am":"ዳዊት","g":"m"}},
 "lines":[
  ["A","ዳዊት፣ ዛሬ ቡና የት እንጠጣ?","dawit, zaré bunna yet innit'et'a?","Dawit, where shall we have coffee today?"],
  ["B","ገበያው አጠገብ ያለው ካፌ ጥሩ ይመስለኛል።","gebeyaw at'egeb yallew kafé t'iru yimeslegnal","I think the café next to the market is good."],
  ["A","እኔ ግን ቤተ ክርስቲያኑ አጠገብ ያለው ይሻለኛል። ቡናው ይበልጥ ይጣፍጣል።","iné gin béte kristiyanu at'egeb yallew yishalegnal. bunnaw yibelt' yit'afit'al","But I prefer the one next to the church. The coffee is better."],
  ["B","ግን ከዚህ ሩቅ ነው።","gin kezzih ruq new","But it's a long way from here."],
  ["A","አይ፣ ሩቅ አይደለም! አሥር ደቂቃ ብቻ ነው።","ay, ruq aydellem! asir deqiqa bicha new","No, it isn't far! It's only ten minutes."],
  ["B","እሺ፣ እስማማለሁ። እንሂድ!","ishi, ismammallehu. innihid!","OK, I agree. Let's go!"]]}
];
