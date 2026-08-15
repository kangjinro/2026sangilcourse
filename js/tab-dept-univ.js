/* ==========================================================================
   tab-dept-univ.js — 대학별 학과 탐색 탭 (외부 사이트 링크 모음, 스크랩 없음)
   ========================================================================== */
const TabDeptUniv = (() => {
  const UNIVERSITIES = [
    { name: '서울대학교', links: [
      { label: '단과대학·학과 안내', url: 'https://www.snu.ac.kr/academics/undergraduate/colleges' },
      { label: '학과 설명 (스누아로리)', url: 'https://snuarori.snu.ac.kr/campus-life/majors?sc=y' },
    ]},
    { name: '고려대학교', links: [
      { label: '학과 안내', url: 'https://oku.korea.ac.kr/oku/cms/FR_CON/index.do?MENU_ID=820' },
    ]},
    { name: '연세대학교', links: [
      { label: '학과 안내', url: 'https://admission.yonsei.ac.kr/seoul/admission/html/campus/major.asp' },
    ]},
    { name: '성균관대학교', links: [
      { label: '학과정보', url: 'https://www.skku.edu/skku/edu/education.do' },
    ]},
    { name: '한양대학교', links: [
      { label: '단과대학·학과 안내', url: 'https://www.hanyang.ac.kr/web/www/s_college_department-info' },
    ]},
    { name: '중앙대학교', links: [
      { label: '단과대학·학과 안내', url: 'https://www.cau.ac.kr/cms/FR_CON/index.do?MENU_ID=800' },
    ]},
    { name: '경희대학교', links: [
      { label: '학과 안내', url: 'https://iphak.khu.ac.kr/submenu.do?menuurl=k%2bqZC0HTrql005wmLhNoXA%3d%3d&' },
    ]},
    { name: '서울시립대학교', links: [
      { label: '모집단위(학과) 안내', url: 'https://admission.uos.ac.kr/admissionNew/information/department.do#none' },
      { label: '모집단위별 인재상', url: 'https://www.uos.ac.kr/admissionNew/html/susi/total2.do' },
    ]},
    { name: '동국대학교', links: [
      { label: '입학처 학과 안내', url: 'https://ipsi.dongguk.edu/admission/html/campus/hub.asp' },
    ]},
    { name: '가톨릭대학교', links: [
      { label: '학과 안내', url: 'https://ipsi.catholic.ac.kr/submenu.do?menuurl=PhxW6o7uK2chIyJVY7KlCw%3d%3d&' },
    ]},
    { name: '인하대학교', links: [
      { label: '학과 안내', url: 'https://www.inha.ac.kr/kr/988/subview.do' },
      { label: '전공 가이드북 (PDF)', url: 'https://admission.inha.ac.kr/ajaxfile/CMN_SVC/FileView.do?GBN=X09_1&SITE_NO=2&BROCHURE_SEQ=65' },
    ]},
  ];

  const ETC = [
    { name: '대학알리미', links: [
      { label: '전국 대학 학과별 정보 공시', url: 'https://www.academyinfo.go.kr/mjrinfo/mjrinfo0460/doInit.do' },
    ]},
    { name: '5등급 → 9등급 변환', links: [
      { label: '등급 변환 계산기', url: 'https://jinhakai.pen.go.kr/entrance/gradeConversion' },
    ]},
  ];

  const root = () => document.getElementById('tab-dept-univ');

  function init() { render(); }

  function renderCard(item) {
    return `
      <div class="link-card">
        <span class="univ-name">${item.name}</span>
        <div class="link-card-links">
          ${item.links.map(l => `
            <a class="go-btn" href="${l.url}" target="_blank" rel="noopener noreferrer">
              ${l.label} ↗
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    root().innerHTML = `
      <div class="panel-head">
        <h2>대학별 학과 탐색</h2>
        <p>주요 대학의 학과 안내 페이지로 바로 이동할 수 있어요. 새 창에서 열립니다.</p>
      </div>
      <div class="link-grid">
        ${UNIVERSITIES.map(renderCard).join('')}
      </div>

      <div class="panel-head" style="margin-top:34px;">
        <h2>기타</h2>
      </div>
      <div class="link-grid">
        ${ETC.map(renderCard).join('')}
      </div>
    `;
  }

  return { init };
})();
