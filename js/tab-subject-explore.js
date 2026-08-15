/* ==========================================================================
   tab-subject-explore.js — 선택과목 탐색 탭
   ========================================================================== */
const TabSubjectExplore = (() => {
  let subjects = [];
  let state = { category: '', selectedSubject: '', query: '' };
  const root = () => document.getElementById('tab-subject-explore');

  function init(appData) {
    subjects = appData.subjectsInfo;
    render();
  }

  function getCategories() { return [...new Set(subjects.map(s => s.category))]; }
  function getSubjectNameOptions() {
    return subjects.filter(s => !state.category || s.category === state.category);
  }
  function getFilteredList() {
    const q = state.query.trim().toLowerCase();
    if (q) {
      // 텍스트 검색 시에는 교과(군) 드롭박스 선택과 무관하게 전체에서 검색합니다.
      return subjects.filter(s => s.name.toLowerCase().includes(q));
    }
    return subjects.filter(s => !state.category || s.category === state.category);
  }
  function findSubject(name) { return subjects.find(s => s.name === name); }

  function render() {
    const categories = getCategories();
    const nameOptions = getSubjectNameOptions();
    const list = getFilteredList();

    root().innerHTML = `
      <div class="panel-head">
        <h2>선택과목 탐색</h2>
        <p>교과(군)별로 살펴보거나 과목명을 검색해서, 평가 방식과 배우는 내용을 미리 확인해보세요.</p>
      </div>
      <div class="filter-bar">
        <select id="se-category">
          <option value="">교과(군) 전체</option>
          ${categories.map(c => `<option value="${ScrapUI.escapeHtml(c)}" ${state.category===c?'selected':''}>${ScrapUI.escapeHtml(c)}</option>`).join('')}
        </select>
        <select id="se-subject-select">
          <option value="">과목선택</option>
          ${nameOptions.map(s => `<option value="${ScrapUI.escapeHtml(s.name)}" ${state.selectedSubject===s.name?'selected':''}>${ScrapUI.escapeHtml(s.name)}</option>`).join('')}
        </select>
        <span class="filter-or">또는</span>
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input id="se-search" type="text" placeholder="과목명으로 검색 (예: 미적분, 지구과학)" value="${ScrapUI.escapeHtml(state.query)}">
        </div>
      </div>

      <div class="two-col-grid">
        <div class="result-list" id="se-list">
          ${list.length ? list.map(s => `
            <div class="result-item ${state.selectedSubject===s.name?'selected':''}" data-name="${ScrapUI.escapeHtml(s.name)}">
              <span>${ScrapUI.escapeHtml(s.name)}</span>
              <span class="tag">${ScrapUI.escapeHtml(s.category)}</span>
            </div>
          `).join('') : `<div class="result-empty">조건에 맞는 과목이 없습니다.</div>`}
        </div>
        <div id="se-detail">${renderDetail()}</div>
      </div>
    `;

    document.getElementById('se-category').addEventListener('change', e => {
      state.category = e.target.value; render();
    });
    document.getElementById('se-subject-select').addEventListener('change', e => {
      state.selectedSubject = e.target.value; render();
    });
    document.getElementById('se-search').addEventListener('input', e => {
      state.query = e.target.value; renderListOnly();
    });
    bindListClicks();
  }

  function bindListClicks() {
    root().querySelectorAll('#se-list .result-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selectedSubject = item.dataset.name;
        render();
      });
    });
  }

  function renderListOnly() {
    const list = getFilteredList();
    const listEl = document.getElementById('se-list');
    listEl.innerHTML = list.length ? list.map(s => `
      <div class="result-item ${state.selectedSubject===s.name?'selected':''}" data-name="${ScrapUI.escapeHtml(s.name)}">
        <span>${ScrapUI.escapeHtml(s.name)}</span>
        <span class="tag">${ScrapUI.escapeHtml(s.category)}</span>
      </div>
    `).join('') : `<div class="result-empty">조건에 맞는 과목이 없습니다.</div>`;
    bindListClicks();
  }

  function splitIntro(raw) {
    if (!raw) return { line: '', keywords: '' };
    const m = raw.match(/과목을 여는 한 줄:\s*([\s\S]*?)(?:주요 키워드:\s*([\s\S]*))?$/);
    if (m) return { line: (m[1]||'').trim(), keywords: (m[2]||'').trim() };
    return { line: raw, keywords: '' };
  }

  function renderDetail() {
    if (!state.selectedSubject) {
      return `<div class="detail-card"><p class="small-muted">왼쪽 목록에서 과목을 선택하면 상세 정보가 표시됩니다.</p></div>`;
    }
    const s = findSubject(state.selectedSubject);
    if (!s) return `<div class="detail-card"><p class="small-muted">과목 정보를 찾을 수 없습니다.</p></div>`;

    const intro = splitIntro(s.introRaw);

    return `
      <div class="detail-card">
        <div class="detail-breadcrumb">${ScrapUI.escapeHtml(s.category)} · ${ScrapUI.escapeHtml(s.selectType)}</div>
        <div class="detail-title-row">
          <h3>${ScrapUI.escapeHtml(s.name)}</h3>
        </div>

        <div class="field-block">
          <h4>과목 프로필</h4>
          <table class="info-table profile-table">
            <thead>
              <tr>
                <th colspan="2">절대평가</th><th>상대평가</th><th colspan="3">통계정보</th><th>2029 수능 출제 과목</th>
              </tr>
              <tr>
                <th>원점수</th><th>성취도</th><th>석차등급</th><th>성취도별 분포비율</th><th>과목평균</th><th>수강자수</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${ScrapUI.escapeHtml(s.absoluteScore)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.absoluteGrade)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.relativeGrade)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.statDist)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.statAvg)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.statCount)||'-'}</td>
                <td>${ScrapUI.escapeHtml(s.csat2029)||'-'}</td>
              </tr>
            </tbody>
          </table>
          ${intro.line ? `<div class="body-text" style="margin-top:12px;"><strong>과목을 여는 한 줄</strong><br>${ScrapUI.escapeHtml(intro.line)}</div>` : ''}
          ${intro.keywords ? `<div class="body-text" style="margin-top:8px;"><strong>주요 키워드</strong><br>${ScrapUI.escapeHtml(intro.keywords)}</div>` : ''}
        </div>

        <div class="field-block">
          <h4>무엇을 배울 수 있나요?</h4>
          ${s.daeyeok.length ? `
            <table class="info-table daeyeok-table">
              <thead><tr><th style="width:120px;">대영역</th><th>생각 열기 및 핵심 개념</th><th>주요 학습 활동예시</th></tr></thead>
              <tbody>
                ${s.daeyeok.map(d => `
                  <tr>
                    <td><strong>${ScrapUI.escapeHtml(d.title)}</strong></td>
                    <td>${ScrapUI.escapeHtml(d.hook)}</td>
                    <td>${ScrapUI.escapeHtml(d.activity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p class="small-muted">등록된 대영역 정보가 없습니다.</p>`}
        </div>
      </div>
    `;
  }

  return { init, findSubject, splitIntro };
})();
