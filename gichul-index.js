// 공무원 9급 기출 회차 색인. 앱이 시작할 때 싣는 것은 이 파일뿐이고, 문제 본문은 회차를 열 때 gichul/<회차 id>.json을 받는다.
// 출처: 인사혁신처가 공공데이터포털에 「이용허락범위 제한 없음」으로 공개한 9급 공채 기출문제(국가직 15060915 · 지방직 15060917).
// a: 문항 번호 순서의 공식 최종 정답(docs/gichul-answer-keys.json과 같은 값). 0은 공식 정답이 한 개가 아니거나(복수 정답·정답 없음) 비어 있는 칸이다.
// skip: 텍스트로 원문을 재현할 수 없거나 채점할 수 없어 수록하지 않은 문항 번호. 사유는 회차 파일의 skipped에 있다.
// 회차 순서: 최신 연도부터, 같은 해에는 늦게 치른 시험부터(지방직 추가선발 → 지방직 → 국가직), 과목은 컴퓨터일반·정보보호론·한국사·국어·영어.
globalThis.GICHUL_INDEX={
 schema:2,
 sources:{"national9":{"body":"인사혁신처","datasetTitle":"인사혁신처_국가직 9급 공채 기출문제","dataset":"https://www.data.go.kr/data/15060915/fileData.do"},"local9":{"body":"인사혁신처","datasetTitle":"인사혁신처_지방직 9급 공채 기출문제","dataset":"https://www.data.go.kr/data/15060917/fileData.do"},"local9extra":{"body":"인사혁신처","datasetTitle":"인사혁신처_지방직 9급 공채 기출문제","dataset":"https://www.data.go.kr/data/15060917/fileData.do"}},
 subjects:{"computer":"컴퓨터일반","security":"정보보호론","history":"한국사","korean":"국어","english":"영어"},
 sittings:{
  "local9-2026":{"range":"2026 지방직 9급","exam":"2026년도 지방공무원 9급 공개경쟁임용 등 필기시험(6월 20일 시행)","book":"D책형"},
  "national9-2026":{"range":"2026 국가직 9급","exam":"2026년도 국가공무원 9급 공개경쟁채용 필기시험(4월 4일 시행)","book":"가책형"}
 },
 papers:[
  {"id":"local9-2026-computer","a":"11313222434433423213","skip":[16]},
  {"id":"local9-2026-security","a":"43311242142133444112","skip":[3]},
  {"id":"local9-2026-history","a":"41424113334321442432"},
  {"id":"local9-2026-korean","a":"21332114231324344433","skip":[13,16]},
  {"id":"local9-2026-english","a":"11224431313434324233","skip":[4,6,7,11,12,13,14]},
  {"id":"national9-2026-korean","a":"31432314422342421431","skip":[8]},
  {"id":"national9-2026-english","a":"23112433321144423124","skip":[4,6,7,11,13,14]}
 ]
};
