# 상일고 과목선택 도우미

2026 상일고 입학생을 위한 학과탐색 · 과목선택 웹앱입니다. 순수 HTML/CSS/JS로 만들어져
별도의 빌드 과정이나 서버 없이 GitHub + Netlify로 바로 배포할 수 있습니다.

## 데이터는 이렇게 동작합니다

엑셀 파일들의 내용을 미리 JSON으로 변환해 `js/data-embedded.js` 안에 통째로 넣어뒀습니다.
그래서 앱을 열면 **엑셀을 읽거나 인터넷에서 뭔가를 더 받아올 필요 없이 즉시** 화면이 뜹니다.
`index.html`을 그냥 더블클릭해서 열어도 바로 작동합니다(로컬 서버 없이도 됩니다).

`/data` 폴더의 원본 엑셀 파일들은 참고용으로 그대로 남겨뒀지만, 실제 화면에는 더 이상
쓰이지 않습니다.

## 폴더 구조

```
index.html                메인 페이지
css/style.css              전체 스타일
js/
  data-embedded.js          엑셀 내용을 미리 변환해 넣어둔 데이터 (자동 생성 파일, 직접 수정 X)
  data-loader.js             위 데이터를 앱에 즉시 전달하는 모듈
  store.js                   스크랩 · 나의 과목선택 · 학생정보를 localStorage에 저장
  scrap.js                   스크랩 사이드바 UI
  app.js                     탭 전환 및 초기 부트스트랩
  tab-dept-explore.js         1) 학과탐색
  tab-dept-univ.js            2) 대학별 학과 탐색
  tab-job-explore.js          3) 직업탐색
  tab-univ-recommend.js       4) 대학별 권장과목 조회
  tab-subject-explore.js      5) 선택과목 탐색
  tab-my-select.js            6) 나의 과목선택 (체크리스트 · PDF 인쇄)
data/                       원본 엑셀 (참고용, 화면에서 직접 사용되진 않음)
tools/
  convert_to_json.py         엑셀 → data-embedded.js 재생성 스크립트 (파이썬 필요)
```

## 로컬에서 미리보기

`index.html`을 더블클릭해서 여는 것만으로 충분합니다. 별도 서버 설정이 필요 없습니다.

## GitHub + Netlify 배포

1. 이 폴더 전체를 GitHub 저장소에 업로드합니다.
2. Netlify에서 "Add new site → Import an existing project"로 해당 저장소를 연결합니다.
3. Build command는 비워두고, Publish directory는 저장소 루트(`/`)로 지정합니다.
4. 배포 후 발급되는 주소를 학생들과 공유하면 됩니다.

## 나중에 데이터를 바꾸고 싶어지면

지금은 엑셀을 직접 관리하지 않기로 하셨지만, 혹시 나중에 마음이 바뀌어 내용을 갱신하고
싶어지면 두 가지 방법이 있습니다.

**방법 A. 저에게 새 엑셀을 다시 올려주시면** 제가 `data-embedded.js`를 다시 만들어드립니다.
가장 간단한 방법입니다.

**방법 B. 직접 재생성하려면** (파이썬이 설치되어 있어야 합니다)
1. `/data` 폴더의 해당 엑셀 파일을 새 버전으로 교체합니다(파일명은 그대로 유지).
2. `pip install openpyxl` (최초 1회)
3. `python3 tools/convert_to_json.py` 실행 → `js/data-embedded.js`가 새로 생성됩니다.
4. 새로 생성된 `js/data-embedded.js`를 그대로 커밋 → push 하면 Netlify가 자동 재배포합니다.

이때도 원본 엑셀의 열 구성(예: 학과분류표는 A열 대분류/B열 중분류/C열 학과명 등 기존 순서)은
그대로 유지해야 합니다.

## 참고사항

- 스크랩 항목, 나의 과목선택 체크 상태, 학번/이름은 **브라우저의 localStorage**에 저장됩니다.
  기기·브라우저별로 별도 저장되며 별도 로그인/서버가 없습니다. 기기를 바꾸면 스크랩/선택
  내역이 이어지지 않는다는 점을 학생들에게 안내해주세요.
- '나의 과목선택' 탭의 제2외국어 위계 체크에서, 실제 편성표에 '심화 중국어' 과목이 없어
  3학년에 개설된 심화 과정인 '관광 중국어'를 대응 과목으로 사용했습니다. 교육과정이 바뀌면
  `js/tab-my-select.js` 상단의 `FOREIGN_LANG_CHAINS` 등 규칙 목록을 함께 봐주세요.
- 워크피디아(직업탐색) 사이트는 정책상 iframe 삽입이 제한될 수 있어 '새 창에서 열기'
  버튼을 함께 제공했습니다.
