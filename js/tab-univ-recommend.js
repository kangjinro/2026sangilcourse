/* ==========================================================================
   tab-univ-recommend.js — 대학별 권장과목 조회 탭 (2028 대입 권장과목 · 대교협)
   ========================================================================== */
const TabUnivRecommend = (() => {
  let rows = [];
  let state = { region: '', university: '', unitBroad: '' };
  let seriesData = null; // { columns, records, note }
  let seriesState = { unit: '' };
  const root = () => document.getElementById('tab-univ-recommend');

  function init(appData) {
    rows = appData.univRecommend;
    seriesData = appData.univRecommendSeries;
    render();
  }

  function getRegions() { return [...new Set(rows.map(r => r.region).filter(Boolean))]; }
  function getUniversities(region) {
    return [...new Set(rows.filter(r => !region || r.region === region).map(r => r.university).filter(Boolean))];
  }
  function getUnitBroads(region, univ) {
    return [...new Set(rows.filter(r =>
      (!region || r.region === region) && (!univ || r.university === univ)
    ).map(r => r.unitBroad).filter(Boolean))];
  }
  function getFiltered() {
    return rows.filter(r =>
      (!state.region || r.region === state.region) &&
      (!state.university || r.university === state.university) &&
      (!state.unitBroad || r.unitBroad === state.unitBroad)
    );
  }

  function render() {
    const regions = getRegions();
    const universities = getUniversities(state.region);
    const unitBroads = getUnitBroads(state.region, state.university);
    const filtered = state.university ? getFiltered() : [];

    root().innerHTML = `
      <div class="panel-head">
        <h2>대학별 권장과목 조회</h2>
        <p>2028학년도 대입 권장과목(대교협) 자료를 기준으로 대학·모집단위별 반영과목을 확인해보세요.</p>
      </div>
      <div class="filter-bar">
        <select id="ur-region">
          <option value="">권역 전체</option>
          ${regions.map(r => `<option value="${ScrapUI.escapeHtml(r)}" ${state.region===r?'selected':''}>${ScrapUI.escapeHtml(r)}</option>`).join('')}
        </select>
        <select id="ur-univ" ${!state.region && !universities.length ? '' : ''}>
          <option value="">대학명 전체</option>
          ${universities.map(u => `<option value="${ScrapUI.escapeHtml(u)}" ${state.university===u?'selected':''}>${ScrapUI.escapeHtml(u)}</option>`).join('')}
        </select>
        <select id="ur-unit" ${!state.university?'disabled':''}>
          <option value="">모집단위(계열, 단과대) 전체</option>
          ${unitBroads.map(u => `<option value="${ScrapUI.escapeHtml(u)}" ${state.unitBroad===u?'selected':''}>${ScrapUI.escapeHtml(u)}</option>`).join('')}
        </select>
        <div class="filter-hint">대학명을 선택하면 결과가 표시됩니다. 모집단위(계열, 단과대)까지 선택하면 더 좁혀서 볼 수 있어요.</div>
      </div>

      ${!state.university ? `
        <div class="detail-card"><p class="small-muted">권역과 대학명을 선택해주세요.</p></div>
      ` : `
        <div class="result-count">${ScrapUI.escapeHtml(state.university)} · 총 ${filtered.length}개 모집단위</div>
        <div class="univ-table-wrap">
          <table class="univ-table">
            <thead>
              <tr>
                <th style="width:20%">모집단위(학과)</th>
                <th style="width:28%">반영과목 (핵심과목)</th>
                <th style="width:28%">반영과목 (권장과목)</th>
                <th style="width:16%">비고</th>
                <th style="width:8%"></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((r, i) => `
                <tr>
                  <td><strong>${ScrapUI.escapeHtml(r.unitDept || r.unitBroad)}</strong></td>
                  <td>${ScrapUI.escapeHtml(r.coreSubjects) || '-'}</td>
                  <td>${ScrapUI.escapeHtml(r.recommendSubjects) || '-'}</td>
                  <td>${ScrapUI.escapeHtml(r.note) || '-'}</td>
                  <td><button class="btn-scrap ur-scrap-btn" data-idx="${i}" style="padding:6px 10px;font-size:11.5px;">스크랩</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}

      <div class="panel-head" style="margin-top:40px;">
        <h2>계열별 대표 모집단위별 대학의 권장과목</h2>
        <p>2028학년도 계열별 대표 모집단위별 반영과목(대교협) 자료입니다. 모집단위를 선택하면 대학별 반영과목 현황표가 표시됩니다.</p>
        ${seriesData && seriesData.note ? `<p class="filter-hint" style="margin-top:6px;">${ScrapUI.escapeHtml(seriesData.note)}</p>` : ''}
      </div>
      ${renderSeriesSection()}
    `;

    document.getElementById('ur-region').addEventListener('change', e => {
      state.region = e.target.value; state.university = ''; state.unitBroad = ''; render();
    });
    document.getElementById('ur-univ').addEventListener('change', e => {
      state.university = e.target.value; state.unitBroad = ''; render();
    });
    document.getElementById('ur-unit').addEventListener('change', e => {
      state.unitBroad = e.target.value; render();
    });
    root().querySelectorAll('.ur-scrap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = filtered[Number(btn.dataset.idx)];
        const metaParts = [
          `핵심과목: ${r.coreSubjects || '-'}`,
          `권장과목: ${r.recommendSubjects || '-'}`,
          `비고: ${r.note || '-'}`,
        ];
        const added = Store.toggleScrap({
          id: 'univrec:' + r.university + ':' + (r.unitDept || r.unitBroad),
          type: '대학별 권장과목',
          name: `${r.university} · ${r.unitDept || r.unitBroad}`,
          meta: metaParts.join('\n'),
        });
        btn.textContent = added ? '✓ 완료' : '스크랩';
      });
    });

    root().querySelectorAll('.unit-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        seriesState.unit = seriesState.unit === chip.dataset.unit ? '' : chip.dataset.unit;
        render();
      });
    });

    adjustStickyHeaderOffset();
  }

  function adjustStickyHeaderOffset() {
    const table = root().querySelector('.series-table');
    if (!table) return;
    const firstRow = table.querySelector('thead tr:first-child');
    if (!firstRow) return;
    const h = firstRow.getBoundingClientRect().height;
    if (h) table.style.setProperty('--series-head1-h', h + 'px');
  }

  /* ---------------- 계열별 대표 모집단위별 반영과목 섹션 ---------------- */
  function renderSeriesSection() {
    if (!seriesData || !seriesData.records.length) {
      return `<div class="detail-card"><p class="small-muted">데이터를 불러오지 못했습니다.</p></div>`;
    }
    const units = [...new Set(seriesData.records.map(r => r.unit))];
    const matched = seriesData.records.filter(r => r.unit === seriesState.unit);

    // 그룹 헤더 colspan 계산
    const groupSpans = [];
    seriesData.columns.forEach(col => {
      const last = groupSpans[groupSpans.length - 1];
      if (last && last.group === col.group) last.span++;
      else groupSpans.push({ group: col.group, span: 1 });
    });

    return `
      <div class="unit-chip-grid">
        ${units.map(u => `
          <button class="unit-chip ${seriesState.unit===u?'active':''}" data-unit="${ScrapUI.escapeHtml(u)}">${ScrapUI.escapeHtml(u)}</button>
        `).join('')}
      </div>

      ${!seriesState.unit ? `
        <div class="detail-card"><p class="small-muted">위 16개 모집단위 중 하나를 선택하면 대학별 반영과목 표가 표시됩니다.</p></div>
      ` : `
        <div class="result-count">모집단위 '${ScrapUI.escapeHtml(seriesState.unit)}' · 총 ${matched.length}개 대학</div>
        <div class="univ-table-wrap">
          <table class="univ-table series-table">
            <thead>
              <tr>
                <th class="sticky-col sticky-corner" rowspan="2" style="width:16%;">대학명</th>
                ${groupSpans.map(g => `<th colspan="${g.span}">${ScrapUI.escapeHtml(g.group)}</th>`).join('')}
              </tr>
              <tr>
                ${seriesData.columns.map(col => `<th>${ScrapUI.escapeHtml(col.sub)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${matched.map(r => `
                <tr>
                  <td class="sticky-col"><strong>${ScrapUI.escapeHtml(r.university)}</strong></td>
                  ${r.cells.map(v => `<td class="${v==='-'?'cell-dash':'cell-mark'}">${ScrapUI.escapeHtml(v)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;
  }

  return { init };
})();
