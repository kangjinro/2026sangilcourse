/* ==========================================================================
   tab-dept-explore.js — 학과탐색 탭
   ========================================================================== */
const TabDeptExplore = (() => {
  let data = null;      // { deptClass, deptInfo }
  let state = { major: '', middle: '', selectedDept: '', query: '' };
  const root = () => document.getElementById('tab-dept-explore');

  function init(appData) {
    data = appData;
    render();
  }

  function getMajors() {
    return [...new Set(data.deptClass.map(r => r.major))];
  }
  function getMiddles(major) {
    return [...new Set(data.deptClass.filter(r => !major || r.major === major).map(r => r.middle))];
  }
  function getDeptList() {
    return data.deptClass.filter(r =>
      (!state.major || r.major === state.major) &&
      (!state.middle || r.middle === state.middle)
    );
  }
  function searchDepts(q) {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return data.deptInfo.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.similar.toLowerCase().includes(query)
    ).map(d => {
      const cls = data.deptClass.find(c => c.dept === d.name);
      return { major: cls ? cls.major : '', middle: cls ? cls.middle : '', dept: d.name };
    });
  }

  function findDeptClass(name) {
    return data.deptClass.find(c => c.dept === name);
  }
  function findDeptInfo(name) {
    return data.deptInfo.find(d => d.name === name);
  }

  function render() {
    const majors = getMajors();
    const middles = getMiddles(state.major);
    const listItems = state.query.trim() ? searchDepts(state.query) : getDeptList();

    root().innerHTML = `
      <div class="panel-head">
        <h2>학과탐색</h2>
        <p>대분류 · 중분류로 좁혀보거나, 학과명/유사 키워드로 바로 검색해보세요.</p>
      </div>
      <div class="filter-bar">
        <select id="de-major">
          <option value="">대분류 전체</option>
          ${majors.map(m => `<option value="${ScrapUI.escapeHtml(m)}" ${state.major===m?'selected':''}>${ScrapUI.escapeHtml(m)}</option>`).join('')}
        </select>
        <select id="de-middle">
          <option value="">중분류 전체</option>
          ${middles.map(m => `<option value="${ScrapUI.escapeHtml(m)}" ${state.middle===m?'selected':''}>${ScrapUI.escapeHtml(m)}</option>`).join('')}
        </select>
        <span class="filter-or">또는</span>
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="de-search" type="text" placeholder="학과명 또는 유사학과 키워드로 검색 (예: 데이터, AI, 심리)" value="${ScrapUI.escapeHtml(state.query)}">
        </div>
        <div class="filter-hint">${state.query.trim() ? '유사학과 정보까지 포함해 검색합니다.' : '대분류/중분류를 선택하면 해당 학과 목록이 아래에 표시됩니다.'}</div>
      </div>

      <div class="two-col-grid">
        <div class="result-list" id="de-list">
          ${listItems.length ? listItems.map(r => `
            <div class="result-item ${state.selectedDept===r.dept?'selected':''}" data-dept="${ScrapUI.escapeHtml(r.dept)}">
              <span>${ScrapUI.escapeHtml(r.dept)}</span>
              <span class="tag">${ScrapUI.escapeHtml(r.middle)}</span>
            </div>
          `).join('') : `<div class="result-empty">조건에 맞는 학과가 없습니다.</div>`}
        </div>
        <div id="de-detail">${renderDetail()}</div>
      </div>
    `;

    document.getElementById('de-major').addEventListener('change', e => {
      state.major = e.target.value; state.middle = ''; state.query = ''; render();
    });
    document.getElementById('de-middle').addEventListener('change', e => {
      state.middle = e.target.value; state.query = ''; render();
    });
    document.getElementById('de-search').addEventListener('input', e => {
      state.query = e.target.value; renderListOnly();
    });
    root().querySelectorAll('#de-list .result-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedDept = item.dataset.dept;
        render();
      });
    });
  }

  function renderListOnly() {
    // 입력 중 focus 유지를 위해 목록/상세만 갱신
    const listItems = state.query.trim() ? searchDepts(state.query) : getDeptList();
    const listEl = document.getElementById('de-list');
    listEl.innerHTML = listItems.length ? listItems.map(r => `
      <div class="result-item ${state.selectedDept===r.dept?'selected':''}" data-dept="${ScrapUI.escapeHtml(r.dept)}">
        <span>${ScrapUI.escapeHtml(r.dept)}</span>
        <span class="tag">${ScrapUI.escapeHtml(r.middle)}</span>
      </div>
    `).join('') : `<div class="result-empty">조건에 맞는 학과가 없습니다.</div>`;
    listEl.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedDept = item.dataset.dept;
        render();
      });
    });
  }

  function renderDetail() {
    if (!state.selectedDept) {
      return `<div class="detail-card"><p class="small-muted">왼쪽 목록에서 학과를 선택하면 상세 정보가 표시됩니다.</p></div>`;
    }
    const info = findDeptInfo(state.selectedDept);
    const cls = findDeptClass(state.selectedDept);
    if (!info) {
      return `<div class="detail-card"><p class="small-muted">'${ScrapUI.escapeHtml(state.selectedDept)}'에 대한 상세 정보가 아직 준비되지 않았습니다.</p></div>`;
    }
    return `
      <div class="detail-card">
        <div class="detail-breadcrumb">${cls ? `${ScrapUI.escapeHtml(cls.major)} · ${ScrapUI.escapeHtml(cls.middle)}` : ''}</div>
        <div class="detail-title-row">
          <h3>${ScrapUI.escapeHtml(info.name)}</h3>
        </div>

        <div class="field-block">
          <h4>학과 소개</h4>
          <div class="body-text">${ScrapUI.escapeHtml(info.intro)}</div>
        </div>
        <div class="field-block">
          <h4>주요 전공 교과목</h4>
          <div class="body-text">${ScrapUI.escapeHtml(info.majorCourses)}</div>
        </div>
        <div class="field-block">
          <h4>이런 학생에게 추천</h4>
          <div class="body-text">${ScrapUI.escapeHtml(info.recommendFor)}</div>
        </div>

        <div class="field-block">
          <h4>유사학과 · 개설대학 · 졸업 후 진로</h4>
          <table class="info-table">
            <tr><th>유사학과</th><td>${ScrapUI.escapeHtml(info.similar) || '-'}</td></tr>
            <tr><th>개설대학</th><td>${ScrapUI.escapeHtml(info.universities) || '-'}</td></tr>
            <tr><th>졸업 후 진로</th><td>${ScrapUI.escapeHtml(info.career) || '-'}</td></tr>
          </table>
        </div>

        <div class="field-block">
          <h4>고교 추천 선택과목</h4>
          <table class="info-table">
            <tr><th>일반선택</th><td>${ScrapUI.escapeHtml(info.general) || '-'}</td></tr>
            <tr><th>진로선택</th><td>${ScrapUI.escapeHtml(info.career_subj) || '-'}</td></tr>
            <tr><th>융합선택</th><td>${ScrapUI.escapeHtml(info.fusion) || '-'}</td></tr>
          </table>
        </div>
      </div>
    `;
  }

  return { init };
})();
