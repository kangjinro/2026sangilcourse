/* ==========================================================================
   tab-dept-univ.js — 대학별 학과 탐색 탭 (외부 사이트 링크 모음, 스크랩 없음)
   ========================================================================== */
const TabDeptUniv = (() => {
  const LINKS = [
    { name: '서울대학교', url: 'https://www.snu.ac.kr/academics/undergraduate/colleges', desc: '단과대학·학과 안내' },
    { name: '한양대학교', url: 'https://www.hanyang.ac.kr/web/www/s_college_department-info', desc: '단과대학·학과 안내' },
    { name: '중앙대학교', url: 'https://www.cau.ac.kr/cms/FR_CON/index.do?MENU_ID=800', desc: '단과대학·학과 안내' },
    { name: '동국대학교', url: 'https://ipsi.dongguk.edu/admission/html/campus/hub.asp', desc: '입학처 학과 안내' },
    { name: '가톨릭대학교', url: 'https://www.catholic.ac.kr/ko/academics/edu_undergraduate1.do', desc: '단과대학·학과 안내' },
    { name: '대학알리미 (기타 대학)', url: 'https://www.academyinfo.go.kr/mjrinfo/mjrinfo0460/doInit.do', desc: '전국 대학 학과별 정보 공시' },
  ];

  const root = () => document.getElementById('tab-dept-univ');

  function init() { render(); }

  function render() {
    root().innerHTML = `
      <div class="panel-head">
        <h2>대학별 학과 탐색</h2>
        <p>주요 대학의 학과 안내 페이지로 바로 이동할 수 있어요. 새 창에서 열립니다.</p>
      </div>
      <div class="link-grid">
        ${LINKS.map(l => `
          <a class="link-card" href="${l.url}" target="_blank" rel="noopener noreferrer">
            <span class="univ-name">${l.name}</span>
            <span class="small-muted">${l.desc}</span>
            <span class="univ-url">${l.url}</span>
            <span class="go-btn">사이트 방문하기 →</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  return { init };
})();
