// Curated practice, not verbatim exam questions. Typed items request only the specified word.
(function(root){
 const bank={};
 function add(id,title,rule,hook,examples,rows){bank[id]={title,rule,hook,examples,variants:rows.map(([question,answer,explanation])=>({question,answers:Array.isArray(answer)?answer:[answer],explanation,type:'text'}))};}
 const id=k=>'en-session-20260909-'+k;
 add(id('wish'),'과거의 아쉬움','지금 과거의 일을 아쉬워하면 I wish + 주어 + had p.p.를 쓴다.','wish는 지금, had p.p.는 실제와 다른 과거',['I wish I had studied harder last year.'],[
 ['작년에 더 열심히 공부했더라면 좋을 텐데.\nI wish I ___ harder last year.\nstudy를 알맞은 형태로 바꿔 빈칸에 쓸 말만 입력하세요.','had studied','지금 과거를 아쉬워하므로 had studied를 쓴다.'],
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
 add(id('as-well'),'A 중심에 B 덧붙이기','격식 문법에서 A as well as B의 중심 주어는 A다. B는 덧붙임이다.','B를 괄호로 빼고 A 확인',['The teacher, as well as the students, is ready.','The students, as well as the teacher, are ready.'],[
 ['격식 문법 기준으로 현재 상태를 나타내는 빈칸에 is 또는 are를 쓰세요.\nThe students, as well as their teacher, ___ ready.','are','중심 주어 students가 복수다. teacher는 덧붙인 설명이다.'],
 ['격식 문법 기준으로 [are]만 고쳐 쓰세요.\nThe teacher, as well as the students, [are] ready.','is','덧붙인 as well as the students를 빼면 The teacher is ready가 남는다.']]);
 add(id('adverb'),'형용사를 꾸미는 부사','형용사를 “어느 정도로”라고 꾸미려면 부사를 쓴다.','놀라운 결과 / 놀라울 정도로 긴',['a surprising result / a surprisingly long trip'],[
 ['[surprising]만 고쳐 쓰세요.\nThe trip was [surprising] long.','surprisingly','형용사 long을 꾸미는 부사 surprisingly가 필요하다.'],
 ['[extreme]만 고쳐 쓰세요.\nThe water is [extreme] cold.','extremely','형용사 cold를 꾸미는 부사는 extremely다.']]);
 add(id('neither'),'대등한 선택·부정','이 예문처럼 주어 뒤에 동사가 오는 either/or, neither/nor 구문은 가까운 주어에 동사를 맞춘다.','B가 중요해서가 아니라 가까워서',['Neither the teacher nor the students are ready.','Neither the teachers nor the student is ready.'],[
 ['격식 문법의 수일치 기준으로 is 또는 are를 쓰세요.\nNeither the manager nor the workers ___ ready.','are','가까운 주어 workers가 복수이므로 are다.'],
 ['격식 문법의 수일치 기준으로 [are]만 고쳐 쓰세요.\nNeither the workers nor the manager [are] ready.','is','판별 연습용 예문이다. 가까운 manager가 단수이므로 is다. 직접 쓸 때는 복수 주어를 뒤에 두면 더 매끄럽다.']]);
 add(id('rage'),'진행형과 수동태','rage는 여기서 주어 자체가 맹렬하게 벌어지거나 몰아친다는 자동사다.','폭풍 자체가 몰아친다',['The storm has been raging all night.','People have discussed the issue. → The issue has been discussed.'],[
 ['현재완료진행형 문장이 되도록 [raged]만 고쳐 쓰세요.\nThe storm has been [raged] all night.','raging','폭풍이 몰아치는 것이므로 진행형 raging이다. rage의 이 의미는 수동태로 쓰지 않는다.'],
 ['“그 사안은 여러 번 논의되어 왔다.”\nThe issue has been ___ many times.\ndiscuss를 알맞게 바꿔 빈칸만 쓰세요.','discussed','사람들이 사안을 논의한다는 능동문이 가능하다. 사안은 논의되는 대상이므로 수동형 discussed다.']]);
 add(id('time-clause'),'미래 시간절의 현재형','미래 시간을 나타내는 부사절에서는 현재형을 쓴다. 모든 when절에 적용하는 규칙은 아니다.','언제 할지 정하는 부분은 현재형',['When she arrives, we will leave.'],[
 ['[will arrive]만 고쳐 쓰세요.\nWhen she [will arrive], we will leave.','arrives','미래 시간을 나타내는 부사절이므로 arrives를 쓴다.'],
 ['“비가 그칠 때까지 기다릴게.”\nI will wait until the rain ___.\nstop을 알맞게 바꿔 빈칸만 쓰세요.','stops','until이 이끄는 미래 시간 부사절에서 현재형 stops를 쓴다.']]);
 add(id('knowledge'),'긴 설명 속 중심 주어','수식어를 빼고 중심 명사를 확인한다. 단, some of 같은 수량 표현은 별도로 판단한다.','문들이 아니라 열쇠 하나',['The key to the front doors is missing.'],[
 ['is 또는 are를 쓰세요.\nThe key to the front doors ___ missing.','is','중심 주어 key가 단수다. doors는 열쇠가 어떤 문에 쓰이는지 설명한다.'],
 ['[are]만 고쳐 쓰세요.\nKnowledge of these rules [are] useful.','is','중심 주어 knowledge는 불가산명사이므로 단수 동사를 쓴다.']]);
 add(id('help'),'help 뒤의 동사','help + 목적어 뒤에는 동사원형과 to부정사가 모두 가능하다.','help는 두 형태 허용',['This course helps students learn English.','This course helps students to learn English.'],[
 ['[learning]을 동사원형 또는 to부정사로 고쳐 쓰세요.\nThis course helps students [learning] English.',['learn','to learn'],'help students learn과 help students to learn 모두 가능하다.'],
 ['[becoming]을 동사원형 또는 to부정사로 고쳐 쓰세요.\nPractice helps me [becoming] confident.',['become','to become'],'help me become과 help me to become을 모두 정답으로 인정한다.']]);
 add(id('difficulty'),'have difficulty (in) -ing','have difficulty 뒤에는 in을 넣거나 생략하고 -ing를 쓸 수 있다.','in이 없어도 연결되는 표현',['I have difficulty remembering names.','I have difficulty in remembering names.'],[
 ['[remember]만 고쳐 쓰세요.\nI have difficulty in [remember] names.','remembering','in 뒤에 remembering을 쓴다. in은 생략할 수도 있다.'],
 ['[understand]만 고쳐 쓰세요.\nShe has difficulty [understand] the rule.','understanding','have difficulty understanding으로 쓴다. 전치사 in이 없어도 맞는 표현이다.']]);
 add(id('used-to'),'get used to -ing','get used to의 to는 전치사다. 명사 또는 -ing가 뒤따른다.','~하는 생활에 익숙해지기',['I got used to working at night.'],[
 ['[work]만 고쳐 쓰세요.\nI got used to [work] at night.','working','get used to working = 일하는 것에 익숙해지다.'],
 ['[live]만 고쳐 쓰세요.\nShe is getting used to [live] alone.','living','get used to 뒤에 living을 쓴다.']]);
 add(id('both-whom'),'them을 관계절로 연결','별도 문장에서는 both of them, 앞의 사람을 받는 관계절에서는 both of whom을 쓴다.','of them의 목적격 → of whom의 목적격',['I have two sisters. Both of them are doctors.','I have two sisters, both of whom are doctors.'],[
 ['[them]만 관계대명사로 고쳐 쓰세요.\nI have two sisters, both of [them] are doctors.','whom','콤마 뒤를 앞의 sisters에 연결하는 관계절로 만들려면 whom을 쓴다.'],
 ['두 개의 독립된 문장입니다. them 또는 whom 중 하나를 쓰세요.\nI have two sisters. Both of ___ are doctors.','them','마침표로 나눈 별도 문장이므로 Both of them이다.']]);
 add(id('all-whom'),'전체의 주어와 내부의 목적어','all of whom 전체는 관계절의 주어지만 whom은 그 안의 전치사 of의 목적어다.','전체 역할과 내부 역할을 구분',['I met three teachers, all of whom were kind.'],[
 ['who 또는 whom 중 하나를 쓰세요.\nI met three teachers, all of ___ were kind.','whom','of 뒤의 목적격이므로 whom이다. all of whom 전체는 were의 주어다.'],
 ['who 또는 whom 중 하나를 쓰세요.\nI met three teachers ___ were kind.','who','이번에는 전치사 of가 없고 관계대명사 자체가 were의 주어이므로 who다.']]);
 const extra=(key,title,rule,hook,examples,rows)=>add('grammar-agreement-'+key,title,rule,hook,examples,rows);
 extra('each','each의 위치','Each of the students는 each에, The students each는 students에 동사를 맞춘다.','각 한 명 / 학생들이 각각',['Each of them has a book.','They each have a book.'],[
 ['has 또는 have를 쓰세요.\nEach of the students ___ a book.','has','중심 주어 each는 단수다.'],['has 또는 have를 쓰세요.\nThe students each ___ a book.','have','중심 주어 students가 복수다.'],['[have]만 고쳐 쓰세요.\nEach of them [have] a ticket.','has','each of them에서 중심은 단수 each다.']]);
 extra('number','여러 학생과 학생 수','a number of는 “여러”, the number of는 “~의 수”이다.','학생들 / 숫자 하나',['A number of students are absent.','The number of students is increasing.'],[
 ['is 또는 are를 쓰세요.\nThe number of visitors ___ increasing.','is','방문객 수라는 숫자 하나를 말하므로 is다.'],['is 또는 are를 쓰세요.\nA number of visitors ___ waiting outside.','are','여러 방문객을 뜻하므로 are다.'],['[are]만 고쳐 쓰세요.\nThe number of books [are] increasing.','is','책들이 아니라 책의 수가 주어다.']]);
 extra('portion','무엇의 일부인가','some of, half of 같은 부분 표현은 대상 명사의 수·성질을 확인한다.','물 일부 / 학생 일부',['Some of the water is dirty.','Some of the students are absent.'],[
 ['is 또는 are를 쓰세요.\nHalf of the water ___ gone.','is','water는 불가산명사이므로 is다.'],['is 또는 are를 쓰세요.\nHalf of the students ___ here.','are','students는 복수이므로 are다.'],['[are]만 고쳐 쓰세요.\nSome of the equipment [are] broken.','is','equipment는 불가산명사이므로 is다.']]);
 extra('pair','scissors와 pair','가위 한 개도 scissors라고 하며 복수 동사를 쓴다. a pair of scissors는 중심 명사 pair에 맞춘다.','실제 개수보다 중심 명사의 형태',['These scissors are sharp.','This pair of scissors is sharp.'],[
 ['is 또는 are를 쓰세요.\nThis pair of scissors ___ sharp.','is','중심 명사 pair가 단수다.'],['is 또는 are를 쓰세요.\nThese scissors ___ sharp.','are','scissors는 복수형으로 취급한다. 실제 가위가 한 개여도 같다.'],['is 또는 are를 쓰세요.\nTwo pairs of scissors ___ on the desk.','are','중심 명사 pairs가 복수다.']]);
 extra('identity','역할 둘과 사람 둘','and로 연결한 역할이 한 사람을 가리키는지는 문맥으로 확인한다.','역할의 개수와 사람의 개수는 다르다',['민호 한 명이 친구이면서 동료다: My friend and colleague is here.','친구 민호와 동료 지수 두 명이다: My friend and my colleague are here.'],[
 ['방문자는 민호 한 명뿐이다. 민호는 내 친구이면서 동료다.\nMy friend and colleague ___ here.\nis 또는 are를 쓰세요.','is','선행 문맥이 한 사람임을 확정했으므로 단수 is다.'],['방문자는 친구 민호와 동료 지수, 두 명이다.\nMy friend and my colleague ___ here.\nis 또는 are를 쓰세요.','are','서로 다른 두 사람을 함께 주어로 묶었으므로 are다.'],['내 남자 형제와 여자 형제가 각각 한 명씩 와 있다.\nMy brother and sister ___ here.\nis 또는 are를 쓰세요.','are','my를 한 번만 썼어도 문맥상 두 사람이므로 복수다.']]);
 extra('together','함께 온 사람은 덧붙임','A together with B, A along with B에서는 A가 중심 주어다.','동행자가 늘어도 중심은 A',['The teacher, together with the students, is here.'],[
 ['is 또는 are를 쓰세요.\nThe teacher, together with the students, ___ here.','is','중심 주어 teacher가 단수다.'],['is 또는 are를 쓰세요.\nThe players, including their captain, ___ ready.','are','중심 주어 players가 복수다.'],['[are]만 고쳐 쓰세요.\nThe box, along with the bags, [are] missing.','is','중심 주어 box가 단수다.']]);
 const agreement=['as-well','neither','knowledge','debate-head'];
 for(const [key,value]of Object.entries(bank))value.topic=key.startsWith('grammar-agreement-')||agreement.some(k=>key===id(k))?'수일치':'영문법';
 root.PRACTICE_BANK=bank;
 if(typeof module!=='undefined'&&module.exports)module.exports=bank;
})(globalThis);
