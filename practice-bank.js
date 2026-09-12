// Curated practice, not verbatim exam questions. Variants can be written or multiple-choice.
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
 // New applications of the agreement document. Append to preserve existing written variants.
 function agreementChoice(key,question,choices,correctIndex,explanation){
  bank[key].variants.push({type:'choice',question,choices,correctIndex,explanation});
 }
 agreementChoice(id('as-well'),
  '격식 문법 기준으로 두 빈칸에 들어갈 말을 순서대로 고르세요.\nThe technicians as well as their supervisor ___ access to the lab.\nThe supervisor, as well as the technicians, ___ access to the lab.',
  ['has / have','have / have','have / has','has / has'],2,
  '첫 문장의 중심 주어는 복수 technicians이므로 have, 둘째는 단수 supervisor이므로 has다. as well as 뒤의 덧붙임을 지우고 남는 주어를 본다. 쉼표가 있거나 없다는 이유로 일치 기준이 바뀌지는 않는다.');
 agreementChoice(id('neither'),
  '격식 문법 기준으로 두 빈칸에 들어갈 말을 순서대로 고르세요.\nNot only the technician but also the assistants ___ ready.\nNeither the assistants nor the technician ___ ready.',
  ['is / are','are / are','is / is','are / is'],3,
  '주어들을 동사 앞에서 잇는 이 두 구문은 동사에 가까운 쪽에 맞춘다. 첫 문장은 assistants가 복수라 are, 둘째는 technician이 단수라 is다. not only는 둘 다 포함하는 강조이고 neither는 둘 다 부정한다. 뜻이 같아서 같은 일치 기준을 쓰는 것은 아니다.');
 agreementChoice(id('knowledge'),
  '다음 문장 중 대괄호 안 동사의 수일치가 틀린 문장을 고르세요.',
  ['The labels on these boxes [are] clear.','The list of required documents [are] on my desk.','The key to the storage rooms [is] missing.','Instructions for the new printer [are] available online.'],1,
  'The list of required documents의 중심 주어는 list 하나이므로 are를 is로 고쳐야 한다. 나머지는 각각 labels → are, key → is, Instructions → are로 맞다. 동사와 가까운 documents·rooms·printer가 아니라 각 문장의 중심 주어를 확인한다.');
 agreementChoice(id('debate-head'),
  '두 빈칸에 들어갈 말을 순서대로 고르세요.\nI know a technician who ___ the servers.\nI know several technicians who ___ the servers.',
  ['maintains / maintain','maintain / maintains','maintains / maintains','maintain / maintain'],0,
  '첫 who는 a technician 한 명을 받아 maintains, 둘째 who는 several technicians 여러 명을 받아 maintain이다. 관계절 안에서 who를 그 앞의 명사로 바꾸면 A technician maintains와 Technicians maintain이 된다. 주절의 I나 목적어 servers에 관계절 동사를 맞추지 않는다.');
 agreementChoice('grammar-agreement-each',
  '격식 문법 기준으로 대괄호 안 동사의 수일치가 틀린 문장을 고르세요.',
  ['The employees each [have] a locker.','Every driver [has] a ticket.','Each of my neighbors [has] a bicycle.','Each of the employees [have] a locker.'],3,
  'Each of the employees에서는 each가 중심이므로 have를 has로 고친다. The employees each에서는 employees가 주어라 have가 맞다. Every driver는 한 명씩 가리키므로 has, Each of my neighbors도 each에 맞춰 has다. each라는 단어가 있는지만 보지 말고 주어 자리를 확인한다.');
 agreementChoice('grammar-agreement-number',
  '두 빈칸에 들어갈 말을 순서대로 고르세요.\nA number of files on this computer ___ damaged.\nThe number of damaged files ___ small.',
  ['is / is','are / is','is / are','are / are'],1,
  'A number of files는 여러 파일을 가리켜 are다. The number of damaged files는 손상된 파일의 수라는 숫자 하나를 가리켜 is다. 첫 문장의 computer나 둘째 문장의 files처럼 뒤에 있는 명사에 끌려가지 않는다.');
 agreementChoice('grammar-agreement-portion',
  '두 빈칸에 들어갈 말을 순서대로 고르세요.\nThirty percent of the equipment ___ new.\nThirty percent of the machines ___ new.',
  ['are / is','are / are','is / is','is / are'],3,
  '첫 문장은 불가산명사 equipment의 일부이므로 is, 둘째는 복수 machines의 일부이므로 are다. 30이라는 숫자나 percent만 보지 않고 무엇의 30%인지를 확인한다.');
 agreementChoice('grammar-agreement-pair',
  '다음 문장 중 대괄호 안 동사의 수일치가 틀린 문장을 고르세요.',
  ['These scissors [is] very sharp.','A pair of trousers [is] on the bed.','Two pairs of gloves [are] in the drawer.','Those trousers [are] clean.'],0,
  'scissors는 복수형으로 취급하므로 is를 are로 고친다. 가위가 실제로 한 개여도 scissors 자체에는 복수 동사를 쓴다. 나머지는 단수 pair → is, 복수 pairs → are, 복수형 trousers → are로 맞다.');
 agreementChoice('grammar-agreement-identity',
  '첫 문장에는 누나 수진과 남동생 도현, 서로 다른 두 명이 방문했습니다.\nMy sister and brother ___ here.\n둘째 문장의 방문자는 준호 한 명이며, 준호가 내 친구이면서 동료입니다.\nMy friend and colleague ___ here.\n두 빈칸에 들어갈 말을 순서대로 고르세요.',
  ['is / are','is / is','are / is','are / are'],2,
  '첫 문장은 서로 다른 두 사람이라 are, 둘째는 한 사람의 두 역할이라 is다. 두 문장 모두 my를 한 번만 썼지만 정답이 다르다. 소유격의 개수만으로 인원수를 정하지 말고, 제시된 문맥에서 한 명인지 두 명인지 확인한다.');
 agreementChoice('grammar-agreement-together',
  '격식 문법 기준으로 두 빈칸에 들어갈 말을 순서대로 고르세요.\nThe engineers, including their manager, ___ here.\nThe manager, together with the engineers, ___ here.',
  ['are / is','is / are','are / are','is / is'],0,
  '첫 문장은 engineers가 복수라 are, 둘째는 manager가 단수라 is다. including과 together with로 덧붙인 부분은 중심 주어를 바꾸지 않는다. 두 문장을 각각 The engineers are here와 The manager is here로 줄여 본다.');
 agreementChoice('grammar-agreement-existential',
  '격식 문법 기준으로 두 빈칸에 들어갈 말을 순서대로 고르세요.\nNear the door ___ two empty boxes.\nThere ___ a spare key in this drawer.',
  ['is / are','are / are','are / is','is / is'],2,
  '첫 문장은 장소 표현을 앞으로 보낸 도치다. 뒤의 two empty boxes가 주어이므로 are다. 둘째 there 구문에서는 뒤의 a spare key가 단수라 is다. door나 drawer는 장소를 설명하는 말이며 일치 기준이 아니다.');
 agreementChoice('grammar-agreement-collective',
  '영국식 용례도 포함하며 집단을 하나로 보는지 구성원 각각으로 보는지 문맥을 한정하지 않습니다. 두 빈칸에 가능한 형태를 빠짐없이 제시한 보기를 고르세요.\nThe committee ___ ready.\nThe members of the committee ___ ready.',
  ['is만 / are','is 또는 are / are','are만 / is','is 또는 are / is'],1,
  '첫 committee는 집합명사라 집단 하나를 뜻하는 is와 구성원들을 떠올리는 영국식 are 용례가 모두 있다. 둘째는 중심 주어 members가 분명한 복수라 are다. committee가 들어 있다는 이유만으로 두 문장에 같은 기준을 적용하지 않는다.');
 agreementChoice('grammar-agreement-noun-form',
  'police는 경찰관들을, physics는 학문 이름을 뜻합니다. 대괄호 안 동사의 수일치가 틀린 문장을 고르세요.',
  ['The news [is] surprising.','The police [are] investigating the case.','Information about these courses [is] available online.','Physics [are] my favorite subject.'],3,
  '학문 이름 Physics는 단수로 취급하므로 are를 is로 고친다. news도 단수라 is, 경찰관들을 뜻하는 police는 복수라 are다. Information은 불가산명사라 is이며 courses의 복수형에 맞추지 않는다.');
 agreementChoice('grammar-agreement-one',
  '일반적인 격식 문법 기준으로 대괄호 안 동사의 수일치가 틀린 문장을 고르세요.',
  ['One of the train doors [is] open.','Several passengers [have] complained.','More than one passenger [have] complained.','The doors of the train [are] open.'],2,
  'more than one + 단수명사 passenger는 보통 단수 동사를 쓰므로 have를 has로 고친다. 의미가 두 명 이상이어도 이 구문의 기본 일치는 단수다. 나머지는 one → is, Several passengers → have, doors → are로 맞다.');
 agreementChoice('grammar-agreement-amount',
  '첫 문장은 작업에 필요한 시간의 총량, 둘째는 시계 두 개의 위치를 말합니다. 두 빈칸에 들어갈 말을 순서대로 고르세요.\nTwo hours ___ enough to finish this task.\nTwo clocks ___ hanging on the wall.',
  ['is / are','are / is','is / is','are / are'],0,
  '첫 문장은 두 시간이라는 총량 하나가 충분한지를 말하므로 is다. 둘째는 실제 물건인 시계 두 개를 복수 명사 clocks로 세므로 are다. 숫자 two가 있다는 사실만으로 두 동사를 모두 복수로 정하지 않는다.');
 agreementChoice('grammar-agreement-none',
  '격식 문체와 일상 용례를 모두 포함합니다. 두 빈칸에 가능한 형태를 빠짐없이 제시한 보기를 고르세요.\nNone of the furniture ___ damaged.\nNone of the chairs ___ damaged.',
  ['is / is만','are / are만','are / is 또는 are','is / is 또는 are'],3,
  'furniture는 불가산명사라 첫 빈칸에는 is를 쓴다. 복수 chairs를 받는 none of에는 is와 are 용례가 모두 있다. 둘째 문장의 문체를 한쪽으로 제한하지 않았으므로 어느 하나만 가능하다고 말한 보기는 맞지 않는다.');
 agreementChoice('grammar-agreement-indefinite',
  '두 빈칸에 들어갈 말을 순서대로 고르세요.\nNobody in these buildings ___ access to the roof.\nSeveral of the residents ___ bicycles.',
  ['have / has','has / have','has / has','have / have'],1,
  'nobody는 문법상 단수라 has다. buildings는 주어를 수식하는 전치사구 안의 명사다. 둘째는 여러 주민을 가리키는 several of the residents이므로 have다. 실제 사람이 여러 명 관련돼 있다는 뜻과 문법상 주어의 수를 구별한다.');
 agreementChoice('grammar-agreement-rich',
  'the rich는 부유한 사람들, the poor는 가난한 사람들을 가리킵니다. 두 빈칸에 들어갈 말을 순서대로 고르세요.\nThe rich ___ not immune to illness.\nThe poor ___ not a uniform group.',
  ['is / are','are / is','are / are','is / is'],2,
  '두 주어 모두 사람들을 집단적으로 가리키므로 are / are다. 둘째 문장의 a uniform group은 주어가 아니라 보어다. 동사를 뒤의 단수형 group에 맞추지 않는다.');
 agreementChoice('grammar-agreement-both',
  '미나는 과학자이면서 소설가인 한 명이며, 편집자는 미나와 다른 사람입니다. 두 빈칸에 들어갈 말을 순서대로 고르세요.\nMina ___ both a scientist and a novelist.\nBoth Mina and her editor ___ here.',
  ['are / is','is / are','is / is','are / are'],1,
  '첫 문장은 주어 Mina가 한 명이라 is다. both는 동사 뒤에서 두 역할을 연결한다. 둘째는 both가 Mina와 her editor라는 두 주어를 연결하므로 are다. both라는 단어가 보이면 먼저 무엇을 연결하는지 본다.');
 agreementChoice('grammar-agreement-unit',
  '두 빈칸에 들어갈 말을 순서대로 고르세요.\nThat the prices have risen ___ clear.\nTo repair these machines ___ time.',
  ['is / takes','are / take','is / take','are / takes'],0,
  '첫 문장의 주어는 That the prices have risen이라는 절 전체라 is다. 절 안의 prices는 have risen의 주어일 뿐, 바깥 빈칸의 일치 기준이 아니다. 둘째는 To repair these machines라는 to부정사구 하나가 주어라 단수 takes를 쓴다. 목적어 machines에 맞춰 take로 바꾸지 않는다.');
 // PART 01 문장의 구조·동사 유형(001~030) 정리를 적용한 자체 제작 문항.
 // 원서의 예문은 쓰지 않고, 같은 규칙을 다른 어휘·상황의 새 문장으로 다시 만들었다.
 // 객관식은 9급 어법 문항과 같은 형식이다. 네 문장 중 어법상 옳지 않은 하나가 정답이고,
 // 나머지 세 문장은 같은 정리의 다른 규칙을 지킨 옳은 문장이라 오답을 읽어도 배우는 것이 있다.
 const verb=k=>'grammar-verb-'+k;
 function judge(key,choices,wrongIndex,explanation){
  bank[verb(key)].variants.push({type:'choice',question:'다음 중 어법상 옳지 않은 문장을 고르세요.',choices,correctIndex:wrongIndex,explanation});
 }
 add(verb('preposition'),'전치사를 넣을 자리와 넣지 않을 자리','introduce·explain·suggest·announce는 전달하는 내용을 목적어로 두고 듣는 사람은 to로 연결한다. 사람을 먼저 쓰는 4형식으로는 쓰지 않는다. 반대로 approach·discuss·enter·marry·reach·resemble·answer는 목적어를 바로 받는 타동사라 전치사를 넣지 않는다. wait처럼 목적어를 바로 받지 못하는 동사에는 for가 반드시 필요하다.','한국어 “~에게·~에”를 전치사로 그대로 옮기지 않기',['The guide explained the rules to the visitors.','The reporter approached the mayor after the vote.','We are waiting for the results.'],[
 ['“회의에서 네게 새 팀장을 소개할게.”가 되도록 대괄호 부분의 어순과 전치사를 고쳐 다섯 단어로 쓰세요.\nI will introduce [you the new manager] at the meeting.','the new manager to you','introduce는 4형식으로 쓰지 않는다. 소개하는 대상을 목적어로 두고 듣는 사람은 to로 연결해 introduce the new manager to you로 쓴다. explain·suggest·announce도 같은 방식이다.'],
 ['“그 형사는 말없이 용의자에게 다가갔다.”\nThe detective ___ the suspect without a word.\napproach의 과거형을 전치사 없이 한 단어로 쓰세요.','approached','approach는 목적어를 바로 받는 타동사다. 한국어의 “용의자에게” 때문에 approached to를 붙이지 않는다. discuss·enter·marry·reach·resemble·answer도 마찬가지다.'],
 ['“우리는 연극이 시작되기를 기다리고 있다.”\nWe are waiting ___ the play to start.\n빠진 한 단어를 쓰세요.','for','wait는 목적어를 바로 받지 못하므로 for가 필요하다. wait for + 목적어 + to부정사로 “~가 …하기를 기다린다”를 나타낸다. 앞의 approach와 정반대인 셈이다.']]);
 judge('preposition',['The guide explained the safety rules to the visitors.','The officer approached to the driver without a word.','We are still waiting for the play to start on time.','Her younger brother closely resembles their father.'],1,'approach는 목적어를 바로 받는 타동사라 to를 붙이지 않는다. approached the driver로 고친다. 첫 문장의 explain은 전달 내용을 목적어로 두고 듣는 사람을 to로 연결했으므로 맞다. 셋째의 wait는 목적어를 바로 받지 못해 for가 있어야 하므로 맞다. 넷째의 resemble도 전치사 없이 목적어를 받는 타동사라 맞다.');
 add(verb('lookalike'),'형태가 겹쳐서 헷갈리는 동사','lie(눕다·놓여 있다)는 lie-lay-lain으로 목적어가 없고, lay(놓다)는 lay-laid-laid로 목적어가 있다. lie의 과거형이 lay라서 두 동사가 겹쳐 보인다. find(찾다)는 find-found-found, found(설립하다)는 found-founded-founded다. 철자가 같아 보이는 지점에서 뜻과 목적어 유무를 확인한다.','lie의 과거가 lay / found는 서로 다른 두 동사',['Infants lie face down when they sleep.','She laid the documents on the desk.','They founded the company in 1998.'],[
 ['“아기들은 잘 때 엎드려 눕는다.”\nInfants ___ face down when they sleep.\nlie 또는 lay 중 알맞은 동사를 현재형 한 단어로 쓰세요.','lie','“눕다”는 목적어가 없는 자동사 lie다. 아기를 눕히는 사람이 나오지 않으므로 타동사 lay(놓다)는 맞지 않다. 주어 Infants가 복수라 lie 그대로 쓴다.'],
 ['“그는 어제 열쇠를 식탁 위에 놓았다.”\nHe ___ the keys on the table yesterday.\nlie 또는 lay 중 알맞은 동사를 과거형 한 단어로 쓰세요.','laid','the keys라는 목적어가 있으므로 “놓다”인 타동사 lay를 쓰고, 과거형은 laid다. lie의 과거형도 lay라서 형태가 겹치지만 목적어 유무로 갈린다.'],
 ['“반란군은 왕을 몰아내고 공화국을 세웠다.”\nThe rebels overthrew the king and ___ a republic.\nfound(설립하다)의 과거형을 한 단어로 쓰세요.','founded','“세우다”는 found-founded-founded이므로 founded다. find(찾다)의 과거형 found와 철자가 겹치지만, 나라를 세웠다는 뜻이라 founded를 쓴다.']]);
 judge('lookalike',['The workers founded this small company right after the war.','She laid her passport on the counter and stepped back.','He laid on the sofa all afternoon without saying a word.','The old maps lay in that drawer for more than a decade.'],2,'눕는 동작에는 목적어가 없으므로 자동사 lie를 쓴다. 과거형이 lay이므로 He lay on the sofa로 고친다. laid는 타동사 lay(놓다)의 과거형이다. 첫 문장은 “설립하다”인 found의 과거형 founded라서 맞다. 둘째는 her passport라는 목적어가 있어 laid가 맞다. 넷째의 lay는 자동사 lie의 과거형이라 맞다.');
 add(verb('no-passive'),'수동태를 쓰지 않는 자리','rise(오르다)는 목적어가 없는 자동사라 수동태로 쓰지 않는다. 값을 올리는 타동사는 raise다. sell·read·wash처럼 일부 동사는 능동형 그대로 “잘 팔린다·잘 읽힌다”라는 수동의 뜻을 나타내며, 이때도 수동태로 바꾸지 않는다.','자동사 rise / 능동형으로 수동 뜻인 sell',['Rents have risen sharply this year.','The landlord raised the rent again.','Her first novel sold surprisingly well.'],[
 ['현재완료 문장이 되도록 대괄호 부분을 두 단어로 고쳐 쓰세요.\nThe price of coffee [has been risen] twice this year.','has risen','rise는 목적어가 없는 자동사라 수동태로 쓰지 않는다. 값이 스스로 올랐다는 뜻이므로 has risen이다. 누가 값을 올렸다고 말하려면 타동사 raise를 써서 has raised the price로 바꾼다.'],
 ['“그 정비소는 작년에 요금을 두 번 올렸다.”\nThe garage ___ its fees twice last year.\nrise 또는 raise 중 알맞은 동사를 과거형 한 단어로 쓰세요.','raised','its fees라는 목적어가 있으므로 타동사 raise의 과거형 raised다. 자동사 rise는 목적어를 받지 못한다.'],
 ['“그 신형 모델은 불티나게 팔리고 있다.”\nThe new model ___ like hot cakes.\nsell을 현재진행형 능동태 두 단어로 쓰세요.','is selling','sell은 주어가 상품일 때 능동형 그대로 “잘 팔린다”라는 뜻을 나타낸다. 팔리는 대상이라는 이유로 is being sold로 바꾸지 않는다.']]);
 judge('no-passive',['The council raised the parking fees again last December.','This pocket dictionary sells well among first-year students.','Housing prices have risen faster than wages in this city.','The water level has been risen since the heavy rainfall.'],3,'rise는 목적어가 없는 자동사라 수동태로 쓰지 않는다. has risen으로 고친다. 사람이 수위를 올렸다는 뜻이라면 타동사를 써서 has been raised로 쓴다. 첫 문장은 the parking fees라는 목적어가 있어 타동사 raised가 맞다. 둘째의 sell은 능동형 그대로 “잘 팔린다”라는 뜻이라 맞다. 셋째는 자동사 rise의 현재완료 능동형이라 맞다.');
 add(verb('object-voice'),'목적어가 동작을 받을 때의 보어','목적어가 동작을 직접 하면 목적격보어에 현재분사나 원형을 쓰고, 목적어가 동작을 받으면 과거분사를 쓴다. 형태는 앞의 동사가 정한다. see·hear·listen to 같은 지각동사와 keep·have는 과거분사를 바로 쓰고, let·make 같은 사역동사는 원형 자리에 be + 과거분사를 넣으며, want·expect는 to be + 과거분사를 쓴다.','목적어가 하는가 받는가 → 형태는 앞 동사가 결정',['I saw the gate locked from the inside.','Keep me informed about the schedule.','Do not let the paint be exposed to sunlight.','I want this form to be signed today.'],[
 ['문은 누군가가 잠그는 쪽입니다. 대괄호 부분만 한 단어로 고쳐 쓰세요.\nI saw the doors [locking] from the outside.','locked','문은 잠기는 대상이므로 과거분사 locked를 쓴다. 문이 스스로 무엇을 잠그는 것이 아니라서 현재분사 locking은 맞지 않다.'],
 ['“진행 상황을 계속 알려 주세요.”라는 뜻이 되도록 대괄호 부분만 한 단어로 고쳐 쓰세요.\nPlease keep me [posting] on the progress.','posted','keep + 목적어 + 과거분사다. 소식을 전해 받는 쪽이 me이므로 posted를 쓴다. keep me posted는 “계속 알려 달라”는 뜻으로 굳은 표현이다.'],
 ['“아기를 직사광선에 노출되게 두지 마세요.”\nDo not let your baby ___ to direct sunlight.\nexpose를 사용해 두 단어로 쓰세요.','be exposed','let 뒤에는 원형부정사를 쓰고, 목적어가 동작을 받으면 그 원형 자리에 be + 과거분사를 넣는다. 아기는 노출되는 쪽이므로 be exposed다.'],
 ['“이 계약서가 금요일까지 검토되기를 바랍니다.”\nI want this contract ___ by Friday.\nreview를 사용해 수동형 to부정사 세 단어로 쓰세요.','to be reviewed','계약서는 검토되는 대상이므로 want + 목적어 + to be + 과거분사다. want 뒤에는 원형부정사가 아니라 to부정사를 쓴다.']]);
 judge('object-voice',['We listened to the children singing in the room next door.','The owner let the old sign remove during the renovation.','She had her passport renewed at the embassy last Tuesday.','The manager kept the customers waiting for nearly an hour.'],1,'간판은 떼어지는 대상이므로 let 뒤 원형 자리에 be + 과거분사를 넣어 let the old sign be removed로 고친다. 첫 문장은 노래하는 쪽이 아이들이라 현재분사 singing이 맞다. 셋째는 여권이 갱신되는 대상이라 have + 목적어 + 과거분사 renewed가 맞다. 넷째는 기다린 쪽이 손님이라 현재분사 waiting이 맞다.');
 add(verb('object-form'),'동사가 정해 주는 목적어 뒤 형태','encourage·allow·advise·cause·force·persuade는 목적어 뒤에 to부정사를 쓴다. make·let·have는 원형부정사를 쓴다. keep·prevent·stop·discourage는 A from -ing로 “A가 ~하지 못하게 하다”를 나타낸다. 뜻이 비슷해도 동사마다 뒤에 오는 형태가 정해져 있다.','뜻이 아니라 동사별로 고정된 형태',['The city encouraged residents to recycle.','The noise made everyone leave early.','The strike kept us from reaching the airport.'],[
 ['“회사는 직원들이 재택근무하도록 장려한다.”\nThe company encourages its staff ___ from home.\nwork를 알맞은 형태로 바꿔 두 단어로 쓰세요.','to work','encourage는 목적어 뒤에 to부정사를 쓴다. allow·advise·cause·force·persuade도 같다. encourage staff working처럼 -ing를 쓰지 않는다.'],
 ['“폭설 때문에 우리는 회의를 이어 갈 수 없었다.”\nThe heavy snow kept us ___ the meeting.\ncontinue를 사용해 두 단어로 쓰세요.','from continuing','keep A from -ing로 “A가 ~하지 못하게 하다”를 나타낸다. prevent·stop·discourage도 같은 짝이다. kept us to continue라는 형태는 쓰지 않는다.'],
 ['“이 설정이 TV 소리를 더 좋게 만들어 준다.”\nThis setting makes your TV ___ better.\nsound를 알맞은 형태로 바꿔 한 단어로 쓰세요.','sound','make는 목적어 뒤에 원형부정사를 쓰므로 sound 그대로다. to sound나 sounds로 바꾸지 않는다. let·have도 같은 원형 자리를 쓴다.']]);
 judge('object-form',['The lawyer advised his client to stay silent in the hearing.','A flat tire prevented her from arriving at the office on time.','The teacher had every student read the passage out loud.','The heavy rain forced the crew stopping work around noon.'],3,'force는 목적어 뒤에 to부정사를 쓰므로 forced the crew to stop으로 고친다. 첫 문장의 advise도 to부정사를 쓰는 동사라 맞다. 둘째의 prevent는 A from -ing 짝이라 맞다. 셋째의 have는 원형부정사를 쓰므로 read가 맞다.');
 add(verb('linking'),'2형식 동사 뒤의 보어','taste·smell·sound·look·feel처럼 감각을 나타내는 동사는 주어의 상태를 설명하므로 보어에 부사가 아니라 형용사를 쓴다. remain·stay처럼 상태가 이어짐을 말하는 동사도 보어를 두며, 주어가 동작을 받은 상태라면 과거분사를 보어로 쓴다.','주어를 설명하는 자리 → 형용사·과거분사',['This soup tastes salty.','Please remain seated until the bus stops.'],[
 ['대괄호 부분만 한 단어로 고쳐 쓰세요.\nThis milk tastes [badly] now.','bad','taste는 주어의 상태를 설명하는 동사라 보어에 형용사 bad를 쓴다. 우유가 맛을 “나쁘게 본다”는 뜻이 아니므로 부사 badly는 맞지 않다.'],
 ['“항공기가 완전히 멈출 때까지 앉아 계세요.”\nPlease remain ___ until the aircraft stops completely.\nseat을 알맞은 형태로 바꿔 한 단어로 쓰세요.','seated','승객은 좌석에 앉혀진 상태로 있는 것이므로 과거분사 seated를 쓴다. remain seating은 누군가를 앉히고 있다는 뜻이 되어 맞지 않다.']]);
 judge('linking',['The fresh bread smelled wonderful throughout the whole house.','The audience remained seated until the credits had finished.','Your voice sounds hoarsely on this recording from yesterday.','He felt uneasy about signing the contract without a lawyer.'],2,'sound는 주어의 상태를 설명하는 동사라 보어에 형용사를 쓴다. sounds hoarse로 고친다. 첫 문장의 smelled wonderful과 넷째의 felt uneasy도 같은 이유로 형용사 보어가 맞다. 둘째는 관객이 앉혀진 상태라 remain 뒤에 과거분사 seated가 맞다.');
 add(verb('prep-pair'),'A of B와 A as B 짝','accuse A of B는 “A를 B의 이유로 고발·비난하다”이며 of 뒤에는 명사나 -ing가 온다. think of A as B·regard A as B·refer to A as B는 “A를 B로 여기다·부르다”로 as가 짝이다. 동사마다 붙는 전치사가 정해져 있으므로 뜻이 비슷하다고 바꿔 쓰지 않는다.','이유는 of / 자격·명칭은 as',['They accused the clerk of leaking the file.','Many people think of him as a pioneer.'],[
 ['“경찰은 그를 증거를 조작한 혐의로 고발했다.”\nThe police accused him ___ tampering with the evidence.\n빠진 한 단어를 쓰세요.','of','accuse A of B로 무엇 때문에 고발하는지를 of로 연결한다. 뒤에 동사가 오면 tampering처럼 -ing 형태가 된다.'],
 ['“많은 사람이 그 도시를 금융 중심지로 여긴다.”\nMany people think of the city ___ a financial center.\n빠진 한 단어를 쓰세요.','as','think of A as B로 A를 B로 여긴다는 뜻을 나타낸다. regard A as B도 같은 짝이다. as를 for나 to로 바꾸지 않는다.']]);
 judge('prep-pair',['Her colleagues accused her of hiding the survey results.','The committee regarded the long delay for a warning sign.','Most critics think of the film as her finest work so far.','The report referred to the leak as a minor clerical error.'],1,'regard는 as와 짝을 이루므로 regarded the long delay as a warning sign으로 고친다. 첫 문장의 accuse A of B는 고발 사유를 of로 연결하므로 맞다. 셋째의 think of A as B와 넷째의 refer to A as B도 모두 as가 짝이라 맞다.');
 add(verb('question-form'),'간접의문문과 부가의문문','의문사절이 다른 동사의 목적어로 들어가면 의문사 + 주어 + 동사라는 평서문 어순이 되고, 의문문의 도치를 쓰지 않는다. 부가의문문은 주절의 주어와 동사에 맞춘다. 뒤에 딸린 that절의 주어와 동사에 맞추지 않는다.','안에 든 절은 평서문 어순 / 꼬리표는 주절 기준',['I do not know when the office opens.','She thinks that he is honest, doesn’t she?'],[
 ['“그를 얼마나 오래 기다려야 하는지 모르겠다.”\nI do not know how long ___ to wait for him.\nwe와 have를 알맞은 어순으로 빈칸에 쓰세요.','we have','의문사절이 know의 목적어로 들어갔으므로 how long we have to wait라는 평서문 어순이다. do we have처럼 의문문 어순으로 도치하지 않는다.'],
 ['“그녀는 그가 매우 친절하다고 생각한다, 그렇지?”\nShe thinks that he is very kind, ___?\n부가의문문 두 단어를 쓰세요.',"doesn't she",'부가의문문은 주절 She thinks에 맞춘다. 일반동사 현재형이고 주어가 3인칭 단수이므로 doesn’t she다. that절의 he is에 끌려 isn’t he로 쓰지 않는다.']]);
 judge('question-form',['Nobody told me where the budget meeting would be held today.','She hardly ever checks her email at weekends, does she?','I really wonder how much does this repair cost in the end.','He said that the mountain road was closed, didn’t he?'],2,'의문사절이 wonder의 목적어로 들어갔으므로 평서문 어순인 how much this repair costs로 고친다. 첫 문장도 where 뒤가 주어와 동사 순서라 맞다. 둘째는 hardly라는 부정어가 이미 있어 긍정형 부가의문문 does she가 맞다. 넷째는 that절이 아니라 주절 He said에 맞춘 didn’t he라서 맞다.');
 add(verb('gerund-only'),'동명사만 목적어로 쓰는 동사','resist·admit·avoid·deny·mind·postpone·enjoy·finish는 목적어로 동명사를 쓰고 to부정사를 쓰지 않는다. 목적어가 동작을 받는 뜻이면 being + 과거분사 형태의 동명사가 된다.','이 동사들 뒤에는 -ing',['He avoided answering the question.','They postponed announcing the result.'],[
 ['“그 남자는 현장에서 체포에 저항했다.”\nThe man resisted ___ at the scene.\narrest를 사용해 수동 동명사 두 단어로 쓰세요.','being arrested','resist는 목적어로 동명사를 쓰므로 to be arrested가 아니라 being arrested다. 체포되는 쪽이 주어이므로 수동형 being + 과거분사가 된다.'],
 ['“그들은 결과 발표를 다음 주로 연기했다.”\nThey postponed ___ the result until next week.\nannounce를 알맞은 형태로 바꿔 한 단어로 쓰세요.','announcing','postpone은 동명사를 목적어로 쓴다. avoid·deny·mind·admit도 같아서 to announce로 바꾸지 않는다.']]);
 judge('gerund-only',['The witness denied seeing anyone near the gate that evening.','Would you mind opening the window for just a few minutes?','They finally finished repairing the leaking roof last Friday.','The suspect resisted to be questioned about the missing file.'],3,'resist는 동명사를 목적어로 쓰므로 resisted being questioned로 고친다. 조사받는 쪽이 주어라 수동 동명사 being + 과거분사다. 첫 문장의 deny, 둘째의 mind, 셋째의 finish도 모두 동명사를 목적어로 쓰므로 맞다.');
 add(verb('infinitive-gerund'),'to부정사와 동명사의 뜻 차이','forget·remember·regret·stop은 뒤에 오는 형태에 따라 뜻이 달라진다. to부정사는 앞으로 할 일이나 지금 하려는 목적을 가리키고, 동명사는 이미 한 일을 가리킨다. stop -ing는 하던 일을 그만두는 것이고, stop to do는 무엇을 하려고 잠시 멈추는 것이다.','to는 앞으로 할 일 / -ing는 이미 한 일',['Do not forget to lock the door.','I regret telling her the truth.','He stopped to answer the phone.'],[
 ['“안전벨트 매는 것을 잊지 마세요.”라는 뜻이 되도록 대괄호 부분을 두 단어로 고쳐 쓰세요.\nDo not forget [fastening] your seat belt.','to fasten','아직 하지 않은 일을 잊지 말라는 뜻이므로 forget to fasten이다. forget -ing는 이미 한 일을 잊는다는 뜻이라 이 문맥에는 맞지 않다.'],
 ['“그렇게 많이 먹은 것을 나중에 후회할 것이다.”라는 뜻이 되도록 대괄호 부분을 한 단어로 고쳐 쓰세요.\nYou will regret [to eat] so much later.','eating','이미 많이 먹은 일을 후회하는 것이므로 regret eating이다. regret to do는 “~하게 되어 유감이다”라며 지금 전하려는 내용을 가리킨다.'],
 ['“그는 집에 오는 길에 잡지를 사려고 잠깐 멈췄다.”라는 뜻이 되도록 대괄호 부분을 두 단어로 고쳐 쓰세요.\nOn the way home he stopped [buying] a magazine.','to buy','잡지를 사려고 멈춘 것이므로 목적을 나타내는 stopped to buy다. stopped buying은 잡지를 사던 일을 그만두었다는 뜻이 된다.']]);
 judge('infinitive-gerund',['I regret to inform you that your application was rejected.','Please do not forget mailing this letter tomorrow morning.','She stopped drinking coffee after her doctor warned her twice.','Remember to submit the completed form before the deadline.'],1,'내일 할 일을 잊지 말라는 뜻이므로 forget to mail로 고친다. forget -ing는 이미 한 일을 잊는다는 뜻이다. 첫 문장은 지금 전하려는 소식이 유감이라는 뜻이라 regret to inform이 맞다. 셋째는 마시던 습관을 그만두었다는 뜻이라 stopped drinking이 맞다. 넷째도 앞으로 낼 서류라 remember to submit이 맞다.');
 add(verb('finite'),'명사의 전치사와 문장의 본동사','명사 demand는 무엇에 대한 수요인지를 for로 연결한다. 또 문장에는 반드시 본동사가 있어야 하므로, 주어부가 길어도 being·having 같은 분사가 서술어를 대신할 수 없다.','demand for ~ / 서술어는 분사가 아니라 정동사',['The demand for electric cars is rising.','The reason for the delay was a broken signal box.'],[
 ['“이 지역의 물 수요가 줄었다.”가 되도록 대괄호 부분을 전치사와 현재시제 본동사를 갖춘 세 단어로 고쳐 쓰세요.\nThe demand [on water being] down in this area.','for water is','명사 demand는 for로 대상을 연결하므로 the demand for water다. 또 분사 being은 서술어가 되지 못하므로 정동사 is로 바꾼다. 중심 주어가 The demand 하나이므로 is다.'],
 ['“중고 교과서 수요가 해마다 늘고 있다.”\nThe demand ___ used textbooks grows every year.\n빠진 한 단어를 쓰세요.','for','명사 demand 뒤에는 for가 온다. demand of나 demand on으로 바꾸지 않는다.'],
 ['본동사가 없는 문장입니다. 대괄호 부분을 현재시제 본동사 한 단어로 고쳐 쓰세요.\nThe response from local farmers [being] unusually positive.','is','분사 being은 문장의 서술어가 되지 못한다. 중심 주어 The response에 맞춰 정동사 is를 쓴다.']]);
 judge('finite',['The demand for cheap flights is falling again this winter.','The complaints from nearby residents are already on record.','The reason for the long delay being a broken signal box.','The demand for bottled water rose during the last heat wave.'],2,'분사 being은 문장의 서술어가 되지 못한다. The reason for the long delay was a broken signal box로 고친다. 첫 문장과 넷째는 명사 demand를 for로 연결하고 각각 is falling·rose라는 본동사를 갖췄으므로 맞다. 둘째도 중심 주어 The complaints에 맞춘 본동사 are가 있어 맞다.');
 add(verb('it-takes'),'It takes 시간 to do','It takes + (사람) + 시간 + to부정사로 “~하는 데 시간이 걸린다”를 나타낸다. It은 가주어이고 실제 내용은 to부정사가 맡는다. 시간을 주어로 올려 수동태로 바꾸거나, to부정사 대신 for -ing를 쓰지 않는다.','가주어 It + take + 시간 + to do',['It takes about ten minutes to walk there.','It took her three years to finish the thesis.'],[
 ['“그 서식을 작성하는 데 20분쯤 걸린다.”\nIt ___ about twenty minutes to fill out the form.\ntake를 현재형으로 바꿔 한 단어로 쓰세요.','takes','가주어 It은 3인칭 단수이므로 takes다. 걸리는 시간을 말할 때는 It takes + 시간 + to부정사를 쓴다.'],
 ['“그가 내 메시지에 답하는 데 이틀이 걸렸다.”\nIt took him two days ___ to my message.\nreply를 to부정사 두 단어로 쓰세요.','to reply','이 구문에서 실제 내용은 to부정사가 맡는다. It took him two days for replying처럼 전치사 + 동명사로 바꾸지 않는다.']]);
 judge('it-takes',['It takes about two hours to get to the airport by shuttle.','It takes about three days for finishing all the paperwork.','It took the whole team a month to finish the final report.','It will take quite a while to repair the roof of this house.'],1,'이 구문에서 실제 내용은 to부정사가 맡으므로 It takes about three days to finish all the paperwork로 고친다. 뜻이 통한다고 for + 동명사로 바꾸지 않는다. 나머지 세 문장은 모두 It + take + (사람) + 시간 + to부정사 구조를 지켰고, 셋째처럼 사람을 넣으면 It took the whole team a month가 된다.');
 const agreement=['as-well','neither','knowledge','debate-head'];
 for(const [key,value]of Object.entries(bank))value.topic=key.startsWith('grammar-agreement-')||agreement.some(k=>key===id(k))?'수일치':'영문법';
 root.PRACTICE_BANK=bank;
 if(typeof module!=='undefined'&&module.exports)module.exports=bank;
})(globalThis);
