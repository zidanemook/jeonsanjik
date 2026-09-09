// Curated practice, not verbatim exam questions. Typed items request only the specified word.
(function(root){
 const bank={};
 function add(id,title,rule,hook,examples,rows){bank[id]={title,rule,hook,examples,variants:rows.map(([question,answer,explanation])=>({question,answers:Array.isArray(answer)?answer:[answer],explanation,type:'text'}))};}
 const id=k=>'en-session-20260909-'+k;
 add(id('wish'),'과거의 아쉬움','지금 과거의 일을 아쉬워하면 I wish + 주어 + had p.p.를 쓴다.','wish는 지금, had p.p.는 실제와 다른 과거',['I wish I had studied harder last year.'],[
 ['작년에 더 열심히 공부했더라면 좋을 텐데.\nI wish I ___ harder last year.\nstudy를 had + 과거분사 형태로 바꿔 빈칸에 쓸 말만 입력하세요.','had studied','과거 공부에 대한 아쉬움을 이번 문제에서 지정한 had + 과거분사로 쓰면 had studied다. 과거의 지속적인 공부를 아쉬워할 때는 had been studying도 가능하지만, 이 문제는 형태를 지정했다.'],
 ['이미 지나간 그 버스를 놓치지 않았더라면 좋을 텐데.\nI wish I ___ that bus.\nnot miss를 알맞은 형태로 바꿔 빈칸만 입력하세요.',['had not missed',"hadn't missed"],'과거 사실에 대한 아쉬움은 had not p.p.로 표현한다.']]);
 add(id('considering'),'considering의 연결 역할','considering + 문장은 “~라는 점을 고려하면”이다. considered에는 이 접속사 용법이 없다.','끝의 ing/ed가 아니라 단어의 용법 확인',['Considering the price, this laptop is good.'],[
 ['“비가 온 것을 감안하면”이라는 뜻이 되도록 [considered]만 고쳐 쓰세요.\n[Considered] it was raining, many people came.','considering','considering이 “~라는 점을 고려하면”이라는 연결 역할을 한다.'],
 ['“가격을 감안하면”이라는 뜻이 되도록 빈칸에 considering 또는 considered 중 하나를 직접 쓰세요.\n___ the price, this laptop is good.','considering','considering은 명사구 the price 앞에서도 “~을 고려하면”이라는 뜻으로 쓴다.']]);
 add(id('while'),'while과 during','during 뒤에는 기간·사건 명사구, while 뒤에는 보통 절이 온다. while studying 같은 축약도 가능하다.','시간 덩어리 during / 일이 벌어지는 절 while',['during the meeting / while we were meeting'],[
 ['while 또는 during 중 하나를 직접 쓰세요.\nPlease remain quiet ___ the concert.','during','the concert는 명사구이므로 during을 쓴다.'],
 ['while 또는 during 중 하나를 직접 쓰세요.\nI took notes ___ the teacher was speaking.','while','the teacher was speaking은 주어와 동사가 있는 절이다.']]);
 add(id('comparative'),'~할수록 더','the + 비교급 ..., the + 비교급 ...으로 두 변화를 연결한다.','더 빨라질수록 → 더 일찍',['The faster you walk, the sooner you arrive.'],[
 ['“더 빨리 걸을수록 더 일찍 도착한다.”\nThe ___ you walk, the sooner you arrive.\nfast를 알맞게 바꿔 빈칸만 쓰세요.','faster','the faster ..., the sooner ...로 비교급을 대응시킨다.'],
 ['“더 오래 기다릴수록 더 불안해진다.”\nThe longer I wait, ___ more nervous I become.\n빠진 한 단어를 쓰세요.','the','두 번째 비교급 앞에도 the가 필요하다.']]);
 add(id('no-means'),'by no means','by no means 자체가 “결코 ~아니다”라는 부정 표현이다.','no에 부정 의미가 들어 있다',['The task is by no means easy.'],[
 ['“그 일은 결코 쉽지 않다.”\nThe task is by ___ means easy.\n빠진 한 단어를 쓰세요.','no','by no means = 결코 ~아니다.'],
 ['“그녀는 결코 게으르지 않다.”\nShe is by no ___ lazy.\n빠진 한 단어를 쓰세요.','means','by no means라는 표현으로 익힌다.']]);
 add(id('poor-as'),'형용사 + as의 양보','형용사 + as + 주어 + 동사는 “비록 ~하지만”이라는 뜻으로 쓸 수 있다.','형용사를 앞세워 “그렇기는 하지만”',['Tired as he was, he finished the work.'],[
 ['“비록 피곤했지만 그는 일을 마쳤다.”\nTired ___ he was, he finished the work.\nas 또는 because 중 하나를 쓰세요.','as','Tired as he was는 Although he was tired와 같은 양보 의미다.'],
 ['“비록 어리지만 그녀는 현명하다.”\n___ as she is, she is wise.\nyoung 또는 youth 중 하나를 쓰세요.','young','형용사 young을 앞에 놓는 양보 구문이다.']]);
 add(id('as-well'),'A 중심에 B 덧붙이기','격식 문법에서 주어가 A as well as B이면, 덧붙인 B를 잠깐 빼고 A의 인칭과 수에 동사를 맞춘다. 쉼표 유무만으로 and와 같은 수일치 규칙으로 바꾸지 않는다. 현재 be동사는 I에 am, you에 are, 3인칭 단수에 is, 복수에 are를 쓴다. 한 사람을 가리키는 you도 are다.','B를 괄호로 빼고 A의 인칭과 수 확인',['The teacher, as well as the students, is ready.','The teacher as well as the students is ready.','The students, as well as the teacher, are ready.','You, as well as he, are responsible.','I, as well as she, am ready.'],[
 ['격식 문법 기준으로 현재 상태를 나타내는 빈칸에 is 또는 are를 쓰세요.\nThe students, as well as their teacher, ___ ready.','are','teacher는 덧붙인 말이다. 잠깐 지우면 The students are ready가 남는다. students가 여럿이므로 are다.'],
 ['격식 문법 기준으로 [are]만 고쳐 쓰세요.\nThe teacher, as well as the students, [are] ready.','is','덧붙인 as well as the students를 빼면 The teacher is ready가 남는다.']]);
 add(id('adverb'),'형용사를 꾸미는 부사','형용사를 “어느 정도로”라고 꾸미려면 부사를 쓴다.','놀라운 결과 / 놀라울 정도로 긴',['a surprising result / a surprisingly long trip'],[
 ['[surprising]만 고쳐 쓰세요.\nThe trip was [surprising] long.','surprisingly','형용사 long을 꾸미는 부사 surprisingly가 필요하다.'],
 ['[extreme]만 고쳐 쓰세요.\nThe water is [extreme] cold.','extremely','형용사 cold를 꾸미는 부사는 extremely다.']]);
 add(id('neither'),'가까운 쪽에 맞추는 주어','either A or B는 둘 중 하나, neither A nor B는 둘 다 아니라는 뜻이다. 주어를 연결하는 이 예문들에서는 동사에 가까운 B에 맞춘다. not only A but also B도 여기서는 가까운 B에 맞추지만, 뜻은 A뿐 아니라 B도라는 강조다. B가 더 중요해서 동사를 맞추는 것은 아니다.','뜻과 동사 일치 기준은 구별',['Neither the teacher nor the students are ready.','Neither the teachers nor the student is ready.','Either the secretary or the managers are available.','Not only the teacher but also the students are ready.'],[
 ['격식 문법의 수일치 기준으로 is 또는 are를 쓰세요.\nNeither the manager nor the workers ___ ready.','are','동사 바로 앞의 workers는 여러 명이다. neither … nor 구문에서는 가까운 쪽에 맞추므로 are다.'],
 ['격식 문법의 수일치 기준으로 [are]만 고쳐 쓰세요.\nNeither the workers nor the manager [are] ready.','is','판별 연습용 예문이다. 가까운 manager가 단수이므로 is다. 직접 쓸 때는 복수 주어를 뒤에 두면 더 매끄럽다.']]);
 add(id('rage'),'진행형과 수동태','rage는 여기서 주어 자체가 맹렬하게 벌어지거나 몰아친다는 자동사다.','폭풍 자체가 몰아친다',['The storm has been raging all night.','People have discussed the issue. → The issue has been discussed.'],[
 ['현재완료진행형 문장이 되도록 [raged]만 고쳐 쓰세요.\nThe storm has been [raged] all night.','raging','폭풍이 몰아치는 것이므로 진행형 raging이다. rage의 이 의미는 수동태로 쓰지 않는다.'],
 ['“그 사안은 여러 번 논의되어 왔다.”\nThe issue has been ___ many times.\ndiscuss를 알맞게 바꿔 빈칸만 쓰세요.','discussed','사람들이 사안을 논의한다는 능동문이 가능하다. 사안은 논의되는 대상이므로 수동형 discussed다.']]);
 add(id('time-clause'),'미래 시간절의 현재·현재완료','미래의 때를 정하는 시간 부사절에서는 단순한 미래 예측의 will 대신 단순현재를 쓴다. 동작이 완료된 뒤임을 강조하면 현재완료도 가능하다. 모든 when절에 적용하는 규칙은 아니다.','때를 정하는 절: arrives / 완료를 강조: has arrived',['When she arrives, we will leave.','When she has arrived, we will leave.','I do not know when she will arrive. → 언제 도착할지 모른다는 내용의 명사절이므로 will을 쓸 수 있다.'],[
 ['[will arrive]를 arrive의 단순현재 또는 현재완료 형태로 고쳐 쓰세요.\nWhen she [will arrive], we will leave.',['arrives','has arrived'],'arrives와 has arrived 모두 가능하다. has arrived는 도착이 완료된 다음 출발한다는 점을 강조한다. 미래의 때를 정하는 이 부사절에서는 단순한 미래 예측의 will arrive를 쓰지 않는다.'],
 ['“비가 그칠 때까지 기다릴게.”\nI will wait until the rain ___.\nstop의 단순현재 또는 현재완료 형태로 빈칸만 쓰세요.',['stops','has stopped'],'stops와 has stopped 모두 가능하다. has stopped는 비가 그친 상태에 도달함을 강조한다. until 뒤라고 현재완료가 금지되는 것은 아니다.']]);
 add(id('knowledge'),'긴 설명 속 중심 주어','뒤에 붙은 설명을 잠깐 지우고, 무엇에 대한 문장인지 본다. 문들에 대한 열쇠라면 주어는 열쇠다. some of처럼 일부를 뜻하는 표현은 따로 본다.','문들이 아니라 열쇠 하나',['The key to the front doors is missing.'],[
 ['is 또는 are를 쓰세요.\nThe key to the front doors ___ missing.','is','front doors는 어떤 문에 쓰는 열쇠인지 설명한다. 진짜 주어는 key 하나이므로 is다.'],
 ['[are]만 고쳐 쓰세요.\nKnowledge of these rules [are] useful.','is','중심 주어 knowledge는 불가산명사이므로 단수 동사를 쓴다.']]);
 add(id('help'),'help 뒤의 동사','help + 목적어 뒤에는 동사원형과 to부정사가 모두 가능하다.','help는 두 형태 허용',['This course helps students learn English.','This course helps students to learn English.'],[
 ['[learning]을 동사원형 또는 to부정사로 고쳐 쓰세요.\nThis course helps students [learning] English.',['learn','to learn'],'help students learn과 help students to learn 모두 가능하다.'],
 ['[becoming]을 동사원형 또는 to부정사로 고쳐 쓰세요.\nPractice helps me [becoming] confident.',['become','to become'],'help me become과 help me to become을 모두 정답으로 인정한다.']]);
 add(id('difficulty'),'have difficulty (in) -ing','have difficulty 뒤에는 in을 넣거나 생략하고 -ing를 쓸 수 있다.','in이 없어도 연결되는 표현',['I have difficulty remembering names.','I have difficulty in remembering names.'],[
 ['[remember]만 고쳐 쓰세요.\nI have difficulty in [remember] names.','remembering','in 뒤에 remembering을 쓴다. in은 생략할 수도 있다.'],
 ['[understand]를 -ing형으로 고쳐 쓰세요. 이 표현에서 선택적인 전치사 in은 함께 써도 됩니다.\nShe has difficulty [understand] the rule.',['understanding','in understanding'],'have difficulty understanding과 have difficulty in understanding 모두 가능하다. in을 넣거나 생략할 수 있다는 규칙을 채점에도 똑같이 적용한다.']]);
 add(id('used-to'),'get used to -ing','get used to의 to는 전치사다. 명사 또는 -ing가 뒤따른다.','~하는 생활에 익숙해지기',['I got used to working at night.'],[
 ['동사 [answer]를 -ing형으로 고쳐 쓰세요.\nI got used to [answer] calls at night.','answering','answer calls는 전화를 받는다는 뜻이다. get used to의 to는 전치사이므로 뒤의 동사 answer를 answering으로 바꾼다.'],
 ['[live]만 고쳐 쓰세요.\nShe is getting used to [live] alone.','living','get used to 뒤에 living을 쓴다.']]);
 add(id('both-whom'),'them을 관계절로 연결','별도 문장에서는 both of them, 앞의 사람을 받는 관계절에서는 both of whom을 쓴다.','of them의 목적격 → of whom의 목적격',['I have two sisters. Both of them are doctors.','I have two sisters, both of whom are doctors.'],[
 ['[them]만 관계대명사로 고쳐 쓰세요.\nI have two sisters, both of [them] are doctors.','whom','콤마 뒤를 앞의 sisters에 연결하는 관계절로 만들려면 whom을 쓴다.'],
 ['두 개의 독립된 문장입니다. them 또는 whom 중 하나를 쓰세요.\nI have two sisters. Both of ___ are doctors.','them','마침표로 나눈 별도 문장이므로 Both of them이다.']]);
 add(id('all-whom'),'전체 역할과 내부 역할','all of whom were kind에서는 all of whom 전체가 were의 주어이고, 그 안의 whom은 전치사 of의 목적어다. all of whom I liked에서는 I가 주어이고 all of whom은 liked의 목적어다. 전체의 역할은 뒤 절의 구조를 보고 판단한다.','of 뒤의 whom / 전체 역할은 문장에 따라',['I met three teachers, all of whom were kind. → 전체가 were의 주어','I met three teachers, all of whom I liked. → 전체가 liked의 목적어'],[
 ['who 또는 whom 중 하나를 쓰세요.\nI met three teachers, all of ___ were kind.','whom','of 뒤의 목적격이므로 whom이다. all of whom 전체는 were의 주어다.'],
 ['who 또는 whom 중 하나를 쓰세요.\nI met three teachers ___ were kind.','who','이번에는 전치사 of가 없고 관계대명사 자체가 were의 주어이므로 who다.']]);
 add(id('provided'),'provided의 조건','provided (that)과 providing (that)은 조건을 나타낼 수 있다. -ed라는 끝모양만 보고 접속사인지 판단하지 않는다.','조건이 충족되면 가능',['You may borrow my pen provided that you return it.'],[
 ['“비밀로 한다는 조건으로 알려 줄게.”\nI will tell you ___ that you keep it secret.\nprovided 또는 considered 중 하나를 쓰세요.','provided','provided that은 조건을 나타낸다. considered that에는 이 접속사 용법이 없다.'],
 ['“조용히 한다는 조건으로 여기 있어도 돼.”\nYou can stay here ___ you keep quiet.\nprovided를 사용해 빈칸을 쓰세요. that은 넣거나 생략해도 됩니다.',['provided','provided that'],'provided 뒤의 that은 생략할 수 있다. 주절은 머물러도 된다는 허용, 뒤 절은 그 조건이다.']]);
 add(id('while-short'),'while절 줄이기','while절과 주절의 주어가 같고 while절에 be동사가 있을 때, 이 예문들에서는 주어와 be동사를 함께 생략할 수 있다. -ing 행동의 주인이 주절 주어인지 확인한다.','누가 행동하는지 같아야 한다',['While she was cooking, she listened to the radio. → While cooking, she listened to the radio.'],[
 ['While I was waiting for the bus, I read the notice.\n같은 뜻이 되도록 줄인 문장의 빈칸을 wait의 -ing형으로 채우세요.\nWhile ___ for the bus, I read the notice.','waiting','기다린 사람과 안내문을 읽은 사람이 모두 I다. I was를 함께 빼고 waiting을 남긴다.'],
 ['While she was checking the file, she noticed an error.\n주어와 be동사를 생략한 문장에서 check의 -ing형을 쓰세요.\nWhile ___ the file, she noticed an error.','checking','확인한 사람과 오류를 알아챈 사람이 she로 같다. While checking the file로 줄일 수 있다.']]);
 add(id('nothing'),'nothing과 원급 비교','Nothing is as ... as X는 X만큼 ...한 것이 없다는 뜻이다. everything으로 바꾸면 모든 것이 X만큼 그렇다는 뜻으로 달라진다.','아무것도 그만큼은 아니다',['Nothing is as valuable as trust.'],[
 ['“이보다 더 중요한 것은 없다.”\n___ is more important than this.\nNothing 또는 Everything 중 하나를 쓰세요.','nothing','Nothing이 더 중요한 것이 하나도 없다는 부정을 만든다.'],
 ['“그 여행에서 집만큼 편안한 곳은 없었다.”\nOn that trip, nowhere was as comfortable ___ home.\n원급 비교를 완성하는 한 단어를 쓰세요.','as','as + 형용사 + as로 같은 정도를 비교한다. nowhere와 결합하여 집만큼 편안한 곳이 없었다는 뜻이다.']]);
 add(id('debate-head'),'관계절의 주인 찾기','관계절의 동작을 누가 하거나 어떤 것이 겪는지 확인한다. 후보 명사를 관계절의 주어 자리에 넣어 뜻과 구조를 비교한 뒤, 가리키는 명사에 동사를 맞춘다. 가장 가까운 명사나 주절의 중심 명사라고 무조건 고르지 않는다.','후보를 넣어 읽기 → 뜻 확인 → 수일치',['The discussion of the plans that has lasted all day is still unresolved. → 하루 종일 이어진 것은 논의','The files in the box that contain the data are encrypted. → 데이터를 담는 것은 파일들'],[
 ['데이터를 담고 있는 것은 상자가 아니라 여러 파일이다.\nThe files in the box that ___ the data are encrypted.\ncontain 또는 contains 중 하나를 쓰세요.','contain','관계절에 후보를 넣으면 the files contain the data가 이 문맥에 맞는다. files가 복수이므로 contain이다. 가까운 box에 끌려가 contains를 고르지 않는다.'],
 ['작년에 개관한 것은 방이 아니라 박물관이다.\nThe rooms in the museum that ___ opened last year are spacious.\nwas 또는 were 중 하나를 쓰세요.','was','관계절의 주어로 the museum을 넣으면 박물관이 작년에 개관했다는 뜻이 된다. museum은 단수이므로 was다. 이 예문에서는 가까운 명사가 선행사다.']]);
 add('core-en-2026national-3','요구절의 동사원형','요구의 의미로 쓰인 require 등의 that절에서는 주어의 수와 상관없이 동사원형을 쓸 수 있다. and로 병렬인 동사도 같은 구조로 맞춘다. 모든 that절의 규칙은 아니다.','요구한 행동들을 같은 형태로',['The rule requires that each visitor show an ID and sign the form.'],[
 ['요구를 나타내는 that절에서 [attends]를 앞의 read와 병렬이 되도록 한 단어로 고치세요.\nThe director requests that every member read the report and [attends] the meeting.','attend','read와 attend가 요구된 행동으로 나란히 연결됐다. 주어 every member가 단수여도 이 구문에서는 동사원형이다.'],
 ['다음 that절은 요구를 나타내며, 앞의 check와 같은 동사 형태를 써야 합니다.\nThe policy requires that every clerk check the date and [records] the number.\n[records]만 고쳐 쓰세요.','record','check와 record를 병렬로 쓴다. requires의 -s를 that절 안의 record에 옮기지 않는다.']]);
 add('core-en-2026national-13','관계절의 빈자리','장소 명사 뒤라도 관계절에 주어가 없으면 which나 that 같은 관계대명사를 쓴다. where는 장소를 나타내며 주어 역할을 대신하지 않는다.','장소라는 뜻보다 뒤 절의 빈자리',['This is a town that attracts many visitors.','This is the town where my aunt lives.'],[
 ['which 또는 where 중 하나를 쓰세요.\nWe visited an island ___ attracts many tourists.','which','attracts의 주어가 비어 있다. which가 island를 받아 주어가 된다. where는 이 주어 자리를 채우지 못한다.'],
 ['which 또는 where 중 하나를 쓰세요.\nThis is the village ___ my grandparents live.','where','my grandparents가 주어, live가 동사로 이미 있다. 빈칸은 사는 장소를 연결하므로 where다.']]);
 add('core-en-2026national-14','to부정사의 능동·수동','주어가 부정사 동작을 하는지 받는지 확인한다. 해결되는 문제, 수리되는 장치는 수동 부정사 to be + 과거분사로 쓴다.','누가 고치고 무엇이 고쳐지는가',['The device is expected to be repaired tomorrow.'],[
 ['“그 장치는 내일 수리될 것으로 예상된다.”\nThe device is expected ___ tomorrow.\nrepair를 사용하여 수동형 to부정사를 쓰세요.','to be repaired','장치는 수리되는 대상이다. to be repaired가 수동형 to부정사다.'],
 ['“이 보고서는 금요일까지 완성될 것이다.”라는 예상을 나타낸다.\nThe report is expected [to finish] by Friday.\nfinish를 사용해 대괄호 부분을 수동형 to부정사로 고치세요.','to be finished','보고서는 완성되는 대상이므로 to be finished다. expected 자체가 수동형이어도 뒤 부정사의 태를 따로 확인한다.']]);
 const extra=(key,title,rule,hook,examples,rows)=>add('grammar-agreement-'+key,title,rule,hook,examples,rows);
 extra('each','each의 위치','Each of the students는 학생들 중 각 한 명을 가리킨다. The students each는 학생들이 주어이고 each가 뒤에 붙는다. each/every가 각각의 단수 명사에 붙은 each A and each B, every A and every B도 단수로 쓴다.','각 한 명 / 학생들이 각각',['Each of them has a book.','They each have a book.','Every driver and every passenger has a ticket.'],[
 ['has 또는 have를 쓰세요.\nEach of the students ___ a book.','has','학생들 중 각 한 명을 가리키는 each가 주어다. 단수이므로 has다.'],['has 또는 have를 쓰세요.\nThe students each ___ a book.','have','이번에는 students가 주어이고 each는 뒤에 붙었다. 학생들이 여럿이므로 have다.'],['[have]만 고쳐 쓰세요.\nEach of them [have] a ticket.','has','each of them에서 중심은 단수 each다.']]);
 extra('number','여러 학생과 학생 수','a number of는 “여러”, the number of는 “~의 수”이다.','학생들 / 숫자 하나',['A number of students are absent.','The number of students is increasing.'],[
 ['is 또는 are를 쓰세요.\nThe number of visitors ___ increasing.','is','방문객 수라는 숫자 하나를 말하므로 is다.'],['is 또는 are를 쓰세요.\nA number of visitors ___ waiting outside.','are','여러 방문객을 뜻하므로 are다.'],['[are]만 고쳐 쓰세요.\nThe number of books [are] increasing.','is','책들이 아니라 책의 수가 주어다.']]);
 extra('portion','무엇의 일부인가','some of는 일부, half of는 절반이다. all of와 most of도 무엇을 가리키는지 of 뒤의 대상 명사를 본다. 물은 불가산이라 is, 학생들은 복수라 are에 맞춘다.','물 일부 / 학생 일부',['Some of the water is dirty.','Some of the students are absent.','Most of the furniture is old.','All of the chairs are broken.'],[
 ['is 또는 are를 쓰세요.\nHalf of the water ___ gone.','is','water는 불가산명사이므로 is다.'],['is 또는 are를 쓰세요.\nHalf of the students ___ here.','are','students는 복수이므로 are다.'],['[are]만 고쳐 쓰세요.\nSome of the equipment [are] broken.','is','equipment는 불가산명사이므로 is다.']]);
 extra('pair','scissors와 pair','가위 한 개여도 scissors라고 쓰고 are를 붙인다. a pair of scissors에서는 pair가 주어의 중심이므로 is다. 실제 가위 개수가 달라진 것은 아니다.','실제 개수보다 중심 명사의 형태',['These scissors are sharp.','This pair of scissors is sharp.'],[
 ['is 또는 are를 쓰세요.\nThis pair of scissors ___ sharp.','is','중심 명사 pair가 단수다.'],['is 또는 are를 쓰세요.\nThese scissors ___ sharp.','are','scissors는 복수형으로 취급한다. 실제 가위가 한 개여도 같다.'],['is 또는 are를 쓰세요.\nTwo pairs of scissors ___ on the desk.','are','중심 명사 pairs가 복수다.']]);
 extra('identity','역할 둘과 사람 둘','친구이자 동료인 한 명인지, 친구와 동료 두 명인지 앞 문장부터 읽는다. 한 명이라고 적혀 있으면 is, 두 명이면 are다.','역할의 개수와 사람의 개수는 다르다',['민호 한 명이 친구이면서 동료다: My friend and colleague is here.','친구 민호와 동료 지수 두 명이다: My friend and my colleague are here.'],[
 ['방문자는 민호 한 명뿐이다. 민호는 내 친구이면서 동료다.\nMy friend and colleague ___ here.\nis 또는 are를 쓰세요.','is','앞 문장이 민호 한 명뿐이라고 알려 줬다. 친구와 동료는 그 한 사람의 역할이므로 is다.'],['방문자는 친구 민호와 동료 지수, 두 명이다.\nMy friend and my colleague ___ here.\nis 또는 are를 쓰세요.','are','서로 다른 두 사람을 함께 주어로 묶었으므로 are다.'],['내 남자 형제와 여자 형제가 각각 한 명씩 와 있다.\nMy brother and sister ___ here.\nis 또는 are를 쓰세요.','are','my를 한 번만 썼어도 문맥상 두 사람이므로 복수다.']]);
 extra('together','함께 온 사람은 덧붙임','together with나 along with 뒤의 B는 함께 온 사람이나 물건을 덧붙인 말이다. 그 부분을 지우고 앞의 A에 동사를 맞춘다.','동행자가 늘어도 중심은 A',['The teacher, together with the students, is here.'],[
 ['is 또는 are를 쓰세요.\nThe teacher, together with the students, ___ here.','is','학생들은 함께 온 사람들이다. 진짜 주어는 teacher 한 명이므로 is다.'],['is 또는 are를 쓰세요.\nThe players, including their captain, ___ ready.','are','including their captain은 주장이 포함된다는 설명이다. 진짜 주어 players는 여러 명이므로 are다.'],['[are]만 고쳐 쓰세요.\nThe box, along with the bags, [are] missing.','is','중심 주어 box가 단수다.']]);
 extra('existential','뒤에 놓인 주어','there is/are와 장소 도치에서는 동사 뒤에 나오는 주어의 수를 확인한다. 구어의 there’s + 복수 용례와 격식 문법 문제의 기준을 구별한다. There + A and B처럼 단복수가 섞인 목록은 이번 앱에서 단일 정답 문제로 출제하지 않는다. 실제 기출은 제시된 문맥과 기준에 따라 판단한다.','장소가 아니라 존재하는 대상',['There are two chairs by the window.','On the shelf is a small clock.','There is a notebook, and there are two pens. → 절을 나누어 일치를 분명하게 쓴 대안'],[
 ['격식 문법 기준으로 is 또는 are를 쓰세요.\nThere ___ several messages in the inbox.','are','존재하는 대상은 여러 messages다. 복수에 맞춰 are를 쓴다.'],
 ['is 또는 are를 쓰세요.\nOn the wall ___ a large map.','is','On the wall은 장소이고 실제 주어는 뒤의 a large map이다. 지도 하나이므로 is다.']]);
 extra('collective','팀 하나와 팀원들','team, audience 같은 집합명사는 하나의 집단으로 보면 단수로, 구성원을 떠올리는 영국식 용례에서는 복수로도 쓴다. members처럼 복수 명사가 명시된 경우와 구별한다.','집합명사는 문맥·사용역 확인',['The team is ready. → 팀을 하나로 보는 단수 일치','The team members are ready. → 주어가 복수 members'],[
 ['is 또는 are를 쓰세요.\nThe committee members ___ discussing the proposal.','are','중심 명사는 복수 members다. committee가 단수형으로 보인다는 이유로 is를 쓰지 않는다.'],
 ['영국식 영어를 포함하여 가능한 형태 하나를 is 또는 are 중에서 쓰세요.\nThe audience ___ waiting quietly.',['is','are'],'audience를 하나의 집단으로 보면 is, 구성원들을 떠올리는 영국식 용례에서는 are도 가능하다. 이 문제는 두 형태를 모두 인정한다.']]);
 extra('noun-form','s와 실제 문법상 수','news와 학문명 mathematics는 s로 끝나도 단수다. information과 equipment는 불가산명사다. 일반적으로 경찰들을 뜻하는 the police는 복수로 쓴다.','철자 s만 보고 세지 않기',['The news is encouraging.','The police are investigating.'],[
 ['is 또는 are를 쓰세요.\nThe information on these pages ___ accurate.','is','주어 information은 불가산명사다. pages가 복수여도 정보 자체에 맞춰 is다.'],
 ['학문 이름으로 사용한 mathematics입니다. is 또는 are를 쓰세요.\nMathematics ___ my favorite subject.','is','학문 한 분야를 나타내는 mathematics는 단수로 취급한다.'],
 ['경찰관들을 가리키는 일반적인 용법입니다. is 또는 are를 쓰세요.\nThe police ___ searching for the missing child.','are','이 뜻의 police는 복수로 취급한다. s가 없다고 단수로 판단하지 않는다.'],
 ['is 또는 are를 쓰세요.\nThe news about the rescue ___ encouraging.','is','news는 복수형처럼 보여도 단수 동사를 쓴다.']]);
 extra('one','one을 중심으로 읽기','one of + 복수명사는 여럿 중 하나를 가리킨다. more than one + 단수명사는 의미가 여럿이어도 보통 단수 동사를 쓴다.','여럿 중 하나 / 뜻은 여럿이어도 one',['One of the tickets is missing.','More than one applicant has called.'],[
 ['is 또는 are를 쓰세요.\nOne of the windows ___ open.','is','창문들 중 하나가 주어다. windows의 복수형에 끌려가지 않고 one에 맞춘다.'],
 ['일반적인 격식 문법 기준으로 has 또는 have를 쓰세요.\nMore than one employee ___ asked for a copy.','has','more than one + 단수명사 employee의 보통 일치는 단수 has다. 뜻이 두 명 이상이라는 이유만으로 have로 바꾸지 않는다.']]);
 extra('amount','총액 하나와 지폐 여러 장','돈·시간·거리 등을 하나의 총량으로 말할 때는 단수 동사를 쓴다. 지폐처럼 개별 물건을 세는 복수 명사와 구분한다.','총액 / 낱장',['Twenty dollars is enough for lunch.','Twenty one-dollar bills are in the envelope.'],[
 ['점심값의 총액을 말합니다. is 또는 are를 쓰세요.\nFifteen dollars ___ enough for lunch.','is','15달러라는 총액 하나를 주어로 말하므로 is다.'],
 ['각각의 지폐를 셉니다. is 또는 are를 쓰세요.\nFifteen one-dollar bills ___ in the drawer.','are','중심 명사는 복수 bills다. 총액의 충분함이 아니라 지폐들이 어디 있는지를 말한다.']]);
 extra('none','none은 무조건 단수가 아님','none of 뒤에 불가산명사가 오면 단수로 쓴다. 복수명사일 때는 단수와 복수 용례가 있으며 격식 문체에서는 단수를 선호하는 기준도 있다. 문항의 문맥과 사용역을 확인한다.','무엇이 하나도 없는가',['None of the juice is fresh.','None of the students is here. / None of the students are here.'],[
 ['is 또는 are를 쓰세요.\nNone of the water ___ drinkable.','is','water는 불가산명사이므로 is다.'],
 ['격식 문체와 일상 용례를 모두 포함합니다. is 또는 are 중 가능한 형태 하나를 쓰세요.\nNone of the players ___ ready.',['is','are'],'복수 players를 받는 none of는 단수와 복수로 모두 쓰인다. 이 문제는 사용역을 한쪽으로 한정하지 않았으므로 둘 다 인정한다.']]);
 extra('indefinite','everyone과 어느 한쪽','everyone, someone, nobody 등은 의미상 사람 수와 별개로 문법상 단수다. either/neither of도 격식 문법에서는 단수 일치를 기본으로 연습한다.','여러 사람을 가리켜도 문법상 단수',['Everyone has a seat.','Neither of the answers is correct.'],[
 ['has 또는 have를 쓰세요.\nEveryone in these rooms ___ a badge.','has','주어 everyone은 단수다. rooms는 수식어 안의 복수 명사다.'],
 ['격식 문법 기준으로 is 또는 are를 쓰세요.\nNeither of these routes ___ safe.','is','neither of는 격식 문법의 단수 일치 기준에서 is다. 일상 영어의 복수 용례까지 금지하는 설명은 아니다.'],
 ['격식 문법 기준으로 is 또는 are를 쓰세요.\nEither of the answers ___ acceptable.','is','둘 중 어느 하나라는 either에 맞춰 단수 is를 쓴다. either 자체는 부정어가 아니다.']]);
 extra('rich','사람 집단을 뜻하는 the rich','the rich나 the poor가 각각 부유한 사람들, 가난한 사람들을 뜻하면 복수 동사를 쓴다. the + 형용사라는 모양이 언제나 복수인 것은 아니다.','부유한 사람들 = 복수',['The rich are not a single uniform group.','The poor need access to education.'],[
 ['부유한 사람들을 뜻합니다. is 또는 are를 쓰세요.\nThe rich ___ affected by the new tax.','are','the rich는 이 문장에서 부유한 사람들을 집단적으로 가리키는 복수 표현이다.'],
 ['가난한 사람들을 뜻합니다. need 또는 needs 중 하나를 쓰세요.\nThe poor ___ affordable housing.','need','사람 집단인 the poor는 복수 동사 need와 일치한다.']]);
 extra('both','both가 묶는 자리 확인','both A and B로 두 주어를 연결하면 복수 동사를 쓴다. 하지만 He is both kind and patient처럼 both가 보어를 연결하면 주어 He는 그대로 단수다. both라는 단어만 보고 동사를 바꾸지 않는다.','주어 둘인지 / 보어 둘인지',['Both Mina and Joon are ready.','Mina is both a teacher and a writer.'],[
 ['방문자는 누나와 남동생, 서로 다른 두 명입니다. is 또는 are를 쓰세요.\nBoth my sister and my brother ___ here.','are','both가 서로 다른 두 사람을 주어로 연결하므로 are다.'],
 ['민지는 교사이면서 작가인 한 명입니다. is 또는 are를 쓰세요.\nMinji ___ both a teacher and a writer.','is','주어는 Minji 한 명이다. both는 동사 뒤에서 역할 두 개를 연결하므로 단수 is를 바꾸지 않는다.']]);
 extra('unit','구·절 하나를 주어로','동명사구·to부정사구·that절 하나가 주어로 쓰이면 단수로 취급한다. 행동이 실제로 몇 번인지가 아니라 주어인 구나 절을 하나로 보는 구조다.','하나의 활동·내용',['Reading novels is relaxing.','That he arrived early is surprising.'],[
 ['is 또는 are를 쓰세요.\nLearning new languages ___ rewarding.','is','Learning new languages라는 동명사구 전체가 하나의 주어다. languages에 맞추지 않는다.'],
 ['is 또는 are를 쓰세요.\nThat the students arrived early ___ surprising.','is','that절 전체가 주어다. 절 안의 students는 arrived의 주어이고, 바깥 is는 that절 하나에 맞춘다.']]);
 bank[id('neither')].variants.push(
  {type:'text',question:'격식 문법 기준으로 is 또는 are를 쓰세요.\nEither the receptionist or the managers ___ available.',answers:['are'],explanation:'either는 둘 중 하나라는 선택이다. 동사 가까이의 managers가 복수이므로 are다.'},
  {type:'text',question:'격식 문법 기준으로 is 또는 are를 쓰세요.\nNot only the captain but also the players ___ ready.',answers:['are'],explanation:'주어를 잇는 not only A but also B는 이 예문에서 가까운 players에 맞춰 are를 쓴다. 뜻은 선택이 아니라 A뿐 아니라 B도라는 강조다.'});
 bank['grammar-agreement-each'].variants.push(
  {type:'text',question:'has 또는 have를 쓰세요.\nEvery boy and every girl ___ a seat.',answers:['has'],explanation:'every가 각 단수 명사에 붙어 각각 한 명씩 보므로 단수 has다. 단순한 A and B 주어와 구분한다.'},
  {type:'text',question:'has 또는 have를 쓰세요.\nEach driver and each passenger ___ a ticket.',answers:['has'],explanation:'each가 각 단수 명사에 붙어 하나하나 가리키므로 단수 has다.'});
 bank['grammar-agreement-portion'].variants.push(
  {type:'text',question:'is 또는 are를 쓰세요.\nMost of the furniture ___ old.',answers:['is'],explanation:'무엇의 대부분인지 보면 불가산명사 furniture다. is를 쓴다.'},
  {type:'text',question:'is 또는 are를 쓰세요.\nAll of the chairs ___ broken.',answers:['are'],explanation:'all of 뒤의 대상 chairs가 복수이므로 are다.'});
 const agreement=['as-well','neither','knowledge','debate-head'];
 for(const [key,value]of Object.entries(bank))value.topic=key.startsWith('grammar-agreement-')||agreement.some(k=>key===id(k))?'수일치':'영문법';
 root.PRACTICE_BANK=bank;
 if(typeof module!=='undefined'&&module.exports)module.exports=bank;
})(globalThis);
