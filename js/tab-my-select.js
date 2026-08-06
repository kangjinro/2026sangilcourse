/* ==========================================================================
   tab-my-select.js — 나의 과목선택 탭
   2026 상일고 입학생 교육과정 편성표 기반 2·3학년 과목 선택 + 체크리스트 + PDF
   ========================================================================== */
const TabMySelect = (() => {
  let appData = null;
  let curriculum = null; // { semesterDefs, bySemester }
  let subjIndex = {};    // subjIndex[sem][name] = { group, quota, kind, category, subjectType, credit }
  const root = () => document.getElementById('tab-my-select');

  // 제2외국어 위계: 실제 편성표 상 '심화 중국어' 과목이 없어, 3학년에 개설된
  // 심화 중국어 계열 진로선택 과목인 '관광 중국어'를 대응 과목으로 사용합니다.
  const FOREIGN_LANG_CHAINS = [
    { from: ['2-1', '일본어'], to: ['2-2', '일본어 회화'] },
    { from: ['2-1', '중국어'], to: ['2-2', '중국어 회화'] },
    { from: ['2-1', '일본어'], to: ['3-2', '심화 일본어'] },
    { from: ['2-1', '중국어'], to: ['3-2', '관광 중국어'] },
  ];
  const SCIENCE_2ND = [
    { pre: ['2-1', '물리학'], adv: ['2-2', '역학과 에너지'] },
    { pre: ['2-1', '화학'], adv: ['2-2', '물질과 에너지'] },
    { pre: ['2-1', '생명과학'], adv: ['2-2', '세포와 물질대사'] },
    { pre: ['2-1', '지구과학'], adv: ['2-2', '지구시스템과학'] },
  ];
  const SCIENCE_3RD = [
    { pre: ['2-1', '물리학'], adv: ['3-1', '전자기와 양자'] },
    { pre: ['2-1', '화학'], adv: ['3-1', '화학 반응의 세계'] },
    { pre: ['2-1', '생명과학'], adv: ['3-1', '생물의 유전'] },
    { pre: ['2-1', '지구과학'], adv: ['3-1', '행성우주과학'] },
  ];
  const ADV_KOR_ENG_MATH = ['기하', '인공지능 수학', '세계 문화와 영어', '영미 문학 읽기', '미적분Ⅱ', '이산수학'];
  const KEM_CATEGORIES = ['국어', '영어', '수학'];
  const LIFE_CULTURE_CATEGORIES = ['제2외국어/한문', '기술가정/정보'];

  function init(data) {
    appData = data;
    curriculum = data.curriculum;
    buildIndex();
    render();
    document.addEventListener('scraps-changed', () => {});
  }

  function buildIndex() {
    subjIndex = {};
    Object.keys(curriculum.bySemester).forEach(sem => {
      subjIndex[sem] = {};
      curriculum.bySemester[sem].forEach(s => {
        subjIndex[sem][s.name] = {
          group: s.selectType.kind === 'choice' ? s.selectType.group : null,
          quota: s.selectType.kind === 'choice' ? s.selectType.quota : null,
          kind: s.selectType.kind,
          category: s.category,
          subjectType: s.subjectType,
          credit: s.credit,
        };
      });
    });
  }

  function isChosen(sem, name) {
    const meta = subjIndex[sem] && subjIndex[sem][name];
    if (!meta) return false;
    if (meta.kind === 'fixed') return true;
    return Store.isSelected(sem, name);
  }

  const CATEGORY_ORDER = ['국어', '수학', '영어', '사회', '과학', '제2외국어/한문', '기술가정/정보', '예술', '체육'];

  function gradeCategories(sem1, sem2) {
    const seen = [];
    [...curriculum.bySemester[sem1], ...curriculum.bySemester[sem2]].forEach(s => {
      if (!seen.includes(s.category)) seen.push(s.category);
    });
    // 지정된 표시 순서를 우선 적용하고, 목록에 없는 교과군은 뒤에 붙입니다.
    const ordered = CATEGORY_ORDER.filter(c => seen.includes(c));
    seen.forEach(c => { if (!ordered.includes(c)) ordered.push(c); });
    return ordered;
  }

  function countGroupSelected(sem, group) {
    const sel = Store.getSelections()[sem] || {};
    return Object.keys(sel).filter(name => {
      const meta = subjIndex[sem][name];
      return meta && meta.group === group;
    }).length;
  }

  function clearGroupSelections(sem, group) {
    const sel = Store.getSelections()[sem] || {};
    Object.keys(sel).forEach(name => {
      const meta = subjIndex[sem][name];
      if (meta && meta.group === group) Store.setSelection(sem, name, false);
    });
  }

  function countSelectedQuota(sem, group) {
    return countGroupSelected(sem, group);
  }

  /* ---------------- Rendering ---------------- */
  function render() {
    const info = Store.getStudentInfo();
    root().innerHTML = `
      <div class="panel-head">
        <h2>나의 과목선택</h2>
        <p>2·3학년 선택과목을 직접 체크하며 나만의 시간표를 구성해보세요. 오른쪽 '과목 선택 점검표'에서 이수 요건을 실시간으로 확인할 수 있어요.</p>
      </div>

      <div class="student-info-row">
        <label>학번
          <input type="text" id="ms-student-id" placeholder="예: 20501" value="${ScrapUI.escapeHtml(info.studentId)}">
        </label>
        <label>이름
          <input type="text" id="ms-student-name" placeholder="이름 입력" value="${ScrapUI.escapeHtml(info.name)}">
        </label>
        <label>희망 학과(계열)
          <input type="text" id="ms-student-major" placeholder="예: 컴퓨터공학과" value="${ScrapUI.escapeHtml(info.desiredMajor || '')}">
        </label>
        <button class="btn-reset" id="ms-reset-btn" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
          과목선택 초기화
        </button>
      </div>

      <div class="myselect-main">
        ${renderGradeBlock('2학년', '2-1', '2-2', 5)}
        ${renderGradeBlock('3학년', '3-1', '3-2', 6)}
      </div>
    `;

    document.getElementById('ms-student-id').addEventListener('input', e => {
      const cur = Store.getStudentInfo();
      Store.setStudentInfo({ ...cur, studentId: e.target.value });
    });
    document.getElementById('ms-student-name').addEventListener('input', e => {
      const cur = Store.getStudentInfo();
      Store.setStudentInfo({ ...cur, name: e.target.value });
    });
    document.getElementById('ms-student-major').addEventListener('input', e => {
      const cur = Store.getStudentInfo();
      Store.setStudentInfo({ ...cur, desiredMajor: e.target.value });
    });
    document.getElementById('ms-reset-btn').addEventListener('click', () => {
      const sel = Store.getSelections();
      const hasAny = Object.values(sel).some(s => Object.keys(s).length > 0);
      if (!hasAny) return;
      if (confirm('선택한 과목을 모두 초기화할까요? 이 작업은 되돌릴 수 없습니다.')) {
        Store.resetSelections();
        render();
      }
    });

    root().querySelectorAll('.ms-checkbox').forEach(cb => {
      cb.addEventListener('change', onCheckboxChange);
    });
    root().querySelectorAll('.subj-balloon').forEach(b => {
      b.addEventListener('click', () => showSubjectPopup(b.dataset.name));
    });

    renderSidebarPanel();
  }

  function renderSidebarPanel() {
    const slot = document.getElementById('myselect-checklist-col');
    if (!slot) return;
    slot.innerHTML = `
      <div class="scrap-sidebar-header myselect-panel-header">
        <h3>과목 선택 점검표</h3>
      </div>
      ${renderChecklist()}
      ${renderThreeYearCreditTable()}
      <p class="checklist-footnote">▷ 수능 출제 과목은 모두 이수 충족함.</p>
      <button class="btn-pdf" id="ms-pdf-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        PDF 인쇄 / 저장
      </button>
    `;
    document.getElementById('ms-pdf-btn').addEventListener('click', openPrintPopup);
  }

  // 같은 학년 내 1·2학기에 동시 개설되어 중복 선택될 수 있는 과목 쌍
  const DUPLICATE_SEMESTER_PAIRS = [
    { subject: '과학의 역사와 문화', pair: ['3-1', '3-2'] },
  ];

  function findDuplicatePair(sem, name) {
    return DUPLICATE_SEMESTER_PAIRS.find(d => d.subject === name && d.pair.includes(sem));
  }

  function onCheckboxChange(e) {
    const cb = e.target;
    const sem = cb.dataset.sem, name = cb.dataset.name;
    const group = cb.dataset.group ? Number(cb.dataset.group) : null;
    const quota = cb.dataset.quota ? Number(cb.dataset.quota) : null;

    if (cb.checked) {
      const dup = findDuplicatePair(sem, name);
      if (dup) {
        const otherSem = dup.pair.find(s => s !== sem);
        if (isChosen(otherSem, name)) {
          alert('같은 과목의 1, 2학기 중복 이수는 안됩니다.');
          render();
          return;
        }
      }
      if (group) {
        if (quota === 1) {
          clearGroupSelections(sem, group);
        } else if (countGroupSelected(sem, group) >= quota) {
          alert(`같은 그룹에서는 최대 ${quota}개까지만 선택할 수 있어요.`);
          render();
          return;
        }
      }
      Store.setSelection(sem, name, true);
    } else {
      Store.setSelection(sem, name, false);
    }
    render();
  }

  function renderGradeBlock(gradeLabel, sem1, sem2, quotaPerSem) {
    const categories = gradeCategories(sem1, sem2);
    const count1 = countSemesterChosenChoiceOnly(sem1);
    const count2 = countSemesterChosenChoiceOnly(sem2);
    return `
      <div class="grade-block">
        <h3 class="grade-title">${gradeLabel} 교육과정 <span class="badge">학기별 ${quotaPerSem}개 선택</span></h3>
        <div class="legend-row">
          <span class="legend-chip"><span class="dot" style="background:#fff;border:1px solid var(--line-strong);"></span>지정(필수)</span>
          <span class="legend-chip"><span class="dot" style="background:var(--gold-bg);border:1px solid #EBD190;"></span>그룹1 (택1)</span>
          <span class="legend-chip"><span class="dot" style="background:var(--teal-bg);border:1px solid #A9D9CC;"></span>그룹2 (택4)</span>
          ${gradeLabel==='3학년' ? `<span class="legend-chip"><span class="dot" style="background:var(--violet-bg);border:1px solid #CFC0EA;"></span>그룹3 (택1)</span>`:''}
          <span class="legend-chip"><span class="dot" style="background:#1D4FB8;"></span>사회·과학 융합과목(굵은 파란글씨)</span>
        </div>
        <table class="curr-table">
          <thead>
            <tr>
              <th style="width:78px;">교과군</th>
              <th>${gradeLabel} 1학기 <span class="cnt">${count1}/${quotaPerSem}</span></th>
              <th>${gradeLabel} 2학기 <span class="cnt">${count2}/${quotaPerSem}</span></th>
            </tr>
          </thead>
          <tbody>
            ${categories.map(cat => `
              <tr>
                <td class="subj-col-label">${ScrapUI.escapeHtml(cat)}</td>
                <td>${renderCell(sem1, cat)}</td>
                <td>${renderCell(sem2, cat)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function countSemesterChosenChoiceOnly(sem) {
    const sel = Store.getSelections()[sem] || {};
    return Object.keys(sel).length;
  }

  function renderCell(sem, category) {
    const subjects = curriculum.bySemester[sem].filter(s => s.category === category);
    if (!subjects.length) return '<span class="small-muted">-</span>';
    return subjects.map(s => renderBox(sem, s)).join('');
  }

  function renderBox(sem, s) {
    const isFixed = s.selectType.kind === 'fixed';
    const group = s.selectType.kind === 'choice' ? s.selectType.group : null;
    const quota = s.selectType.kind === 'choice' ? s.selectType.quota : null;
    const checked = isFixed ? true : Store.isSelected(sem, s.name);
    const fusionStrong = (s.category === '사회' || s.category === '과학') && s.subjectType === '융합';
    const cls = ['subj-box'];
    if (isFixed) cls.push('fixed');
    if (group) cls.push('grp-' + group);
    if (fusionStrong) cls.push('fusion-strong');

    return `
      <div class="${cls.join(' ')}">
        <div class="subj-left">
          <input type="checkbox" class="ms-checkbox"
            ${checked ? 'checked' : ''} ${isFixed ? 'disabled' : ''}
            data-sem="${sem}" data-name="${ScrapUI.escapeHtml(s.name)}"
            ${group ? `data-group="${group}" data-quota="${quota}"` : ''}>
          <span class="subj-name" title="${ScrapUI.escapeHtml(s.name)}">${ScrapUI.escapeHtml(s.name)}</span>
          <span class="subj-balloon" data-name="${ScrapUI.escapeHtml(s.name)}" title="과목 소개 보기">i</span>
        </div>
        <div class="subj-right">
          <div>${ScrapUI.escapeHtml(s.subjectType)}</div>
          <div class="credit">${s.credit}학점</div>
        </div>
      </div>
    `;
  }

  // 제2외국어 계열 과목은 subjects_info의 공통(언어 통합) 과목 항목을 그대로 연결해 보여줍니다.
  const SECOND_LANG_SUFFIX = '\n독일어, 프랑스어, 스페인어, 중국어, 일본어, 러시아어, 아랍어, 베트남어';
  const SECOND_LANG_LOOKUP = {
    '일본어': '제2외국어' + SECOND_LANG_SUFFIX,
    '중국어': '제2외국어' + SECOND_LANG_SUFFIX,
    '일본어 회화': '제2외국어 회화' + SECOND_LANG_SUFFIX,
    '중국어 회화': '제2외국어 회화' + SECOND_LANG_SUFFIX,
    '일본 문화': '제2외국어권 문화' + SECOND_LANG_SUFFIX,
    '중국 문화': '제2외국어권 문화' + SECOND_LANG_SUFFIX,
    '심화 일본어': '심화 제2외국어' + SECOND_LANG_SUFFIX,
  };

  function showSubjectPopup(name) {
    const overlay = document.getElementById('popup-overlay');
    const content = document.getElementById('popup-content');

    const lookupName = SECOND_LANG_LOOKUP[name] || name;
    const s = appData.subjectsInfo.find(x => x.name === lookupName);
    if (!s) {
      content.innerHTML = `<h4>${ScrapUI.escapeHtml(name)}</h4><p class="body-text small-muted">등록된 과목 소개가 없습니다.</p>`;
    } else {
      const intro = TabSubjectExplore.splitIntro(s.introRaw);
      content.innerHTML = `
        <h4>${ScrapUI.escapeHtml(name)}</h4>
        ${intro.line ? `<p class="body-text"><strong>과목을 여는 한 줄</strong><br>${ScrapUI.escapeHtml(intro.line)}</p>` : ''}
        ${intro.keywords ? `<p class="body-text"><strong>주요 키워드</strong><br>${ScrapUI.escapeHtml(intro.keywords)}</p>` : ''}
        ${lookupName !== name ? `<p class="body-text small-muted">※ '${ScrapUI.escapeHtml(lookupName.split('\\n')[0])}' 공통 과목 정보를 표시합니다.</p>` : ''}
      `;
    }
    overlay.hidden = false;
  }

  /* ---------------- 체크리스트 로직 ---------------- */
  function sumCredits(categories, semesters) {
    let total = 0;
    semesters.forEach(sem => {
      curriculum.bySemester[sem].forEach(s => {
        if (categories.includes(s.category) && isChosen(sem, s.name)) total += s.credit;
      });
    });
    return total;
  }

  function checkChain(chain) {
    // chain 항목의 adv가 선택되었는데 pre가 선택되지 않았으면 위반
    let ok = true;
    chain.forEach(({ pre, adv }) => {
      const advChosen = isChosen(adv[0], adv[1]);
      const preChosen = isChosen(pre[0], pre[1]);
      if (advChosen && !preChosen) ok = false;
    });
    return ok;
  }

  function checkForeignLangChain() {
    let ok = true;
    FOREIGN_LANG_CHAINS.forEach(({ from, to }) => {
      const toChosen = isChosen(to[0], to[1]);
      const fromChosen = isChosen(from[0], from[1]);
      if (toChosen && !fromChosen) ok = false;
    });
    return ok;
  }

  function computeChecklist() {
    const allSemesters = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2'];
    const kemTotal = sumCredits(KEM_CATEGORIES, allSemesters);
    let c = 0;
    ['2-1', '2-2', '3-1', '3-2'].forEach(sem => {
      curriculum.bySemester[sem].forEach(s => {
        if (ADV_KOR_ENG_MATH.includes(s.name) && isChosen(sem, s.name)) c += s.credit;
      });
    });
    const kemOk = c <= 13;

    const a = sumCredits(['예술'], ['2-1', '2-2', '3-1', '3-2']);
    const artOk = a >= 6;

    const socialCredit = sumCredits(['사회'], ['2-1', '2-2', '3-1', '3-2']);
    const socialOk = socialCredit >= 2;

    const scienceCredit = sumCredits(['과학'], ['2-1', '2-2', '3-1', '3-2']);
    const scienceOk = scienceCredit >= 2;

    const b = sumCredits(LIFE_CULTURE_CATEGORIES, ['2-1', '2-2', '3-1', '3-2']);
    const lifeOk = b >= 10;

    const sci2Ok = checkChain(SCIENCE_2ND);
    const sci3Ok = checkChain(SCIENCE_3RD);
    const langOk = checkForeignLangChain();

    const d = countSelectedQuota('2-1', 2), e = countSelectedQuota('2-1', 1);
    const f = countSelectedQuota('2-2', 2), g = countSelectedQuota('2-2', 1);
    const h = countSelectedQuota('3-1', 2), i = countSelectedQuota('3-1', 1), j = countSelectedQuota('3-1', 3);
    const k = countSelectedQuota('3-2', 2), l = countSelectedQuota('3-2', 1), m = countSelectedQuota('3-2', 3);

    return {
      credits: [
        { label: '국·영·수 상한', sub: `${kemTotal}/81학점`, ok: kemOk },
        { label: '사회(한국사 별도) 필수 이수 학점', sub: `${socialCredit + 6}/8학점`, ok: socialOk },
        { label: '과학 필수 이수 학점 충족', sub: `${scienceCredit + 8}/10학점`, ok: scienceOk },
        { label: '예술 필수 이수 학점', sub: `${a + 4}/10학점`, ok: artOk },
        { label: '생활교양 필수 이수 학점', sub: `${b + 6}/16학점`, ok: lifeOk },
      ],
      hierarchy: [
        { label: '2학년 과학 과목 위계', sub: '1학기 이수 후 2학기 심화 선택', ok: sci2Ok },
        { label: '3학년 과학 과목 위계', sub: '2학년 1학기 이수 후 3학년 1학기 심화 선택', ok: sci3Ok },
        { label: '제2외국어 과목 위계', sub: '기초 이수 후 심화/회화 선택', ok: langOk },
      ],
      semesters: [
        { label: '2학년 1학기 선택', sub: `교과간선택 ${d}/4 · 생활교양 ${e}/1`, ok: d === 4 && e === 1 },
        { label: '2학년 2학기 선택', sub: `교과간선택 ${f}/4 · 생활교양 ${g}/1`, ok: f === 4 && g === 1 },
        { label: '3학년 1학기 선택', sub: `교과간선택 ${h}/4 · 생활교양 ${i}/1 · 예술 ${j}/1`, ok: h === 4 && i === 1 && j === 1 },
        { label: '3학년 2학기 선택', sub: `교과간선택 ${k}/4 · 생활교양 ${l}/1 · 예술 ${m}/1`, ok: k === 4 && l === 1 && m === 1 },
      ],
    };
  }

  function renderChecklist() {
    const cl = computeChecklist();
    const row = it => `
      <div class="check-row">
        <div>
          <div class="cr-label">${ScrapUI.escapeHtml(it.label)}</div>
          <div class="cr-count">${ScrapUI.escapeHtml(it.sub)}</div>
        </div>
        <div class="check-icon ${it.ok ? 'ok' : 'bad'}">${it.ok ? 'O' : 'X'}</div>
      </div>
    `;
    return `
      <div class="checklist-section-title">3개년 이수학점 요건</div>
      ${cl.credits.map(row).join('')}
      <div class="checklist-section-title">과목 이수 위계</div>
      ${cl.hierarchy.map(row).join('')}
      <div class="checklist-section-title">학기별 선택 개수</div>
      ${cl.semesters.map(row).join('')}
    `;
  }

  /* ---------------- 교과별 3개년 이수학점 ---------------- */
  const THREE_YEAR_TARGET = 174;

  function computeThreeYearCredits() {
    const sems = ['2-1', '2-2', '3-1', '3-2'];
    const a = sumCredits(['국어'], sems) + 8;
    const b = sumCredits(['수학'], sems) + 8;
    const c = sumCredits(['영어'], sems) + 8;
    const d = sumCredits(['사회'], sems) + 12;
    const e = sumCredits(['과학'], sems) + 8;
    const f = sumCredits(['제2외국어/한문', '기술가정/정보', '예술', '체육'], sems) + 14;
    const total = a + b + c + d + e + f;
    return { a, b, c, d, e, f, total, ok: total === THREE_YEAR_TARGET };
  }

  function renderThreeYearCreditTable() {
    const t = computeThreeYearCredits();
    return `
      <div class="checklist-section-title">교과별 3개년 이수학점</div>
      <table class="info-table credit3y-table">
        <tr><th>국어</th><td>${t.a}</td><th>사회(史 포함)</th><td>${t.d}</td></tr>
        <tr><th>수학</th><td>${t.b}</td><th>과학</th><td>${t.e}</td></tr>
        <tr><th>영어</th><td>${t.c}</td><th>기타</th><td>${t.f}</td></tr>
      </table>
      <div class="check-row credit3y-total">
        <div>
          <div class="cr-label">합계</div>
          <div class="cr-count">${t.total} / ${THREE_YEAR_TARGET}학점</div>
        </div>
        <div class="check-icon ${t.ok ? 'ok' : 'bad'}">${t.ok ? 'O' : 'X'}</div>
      </div>
      ${!t.ok ? `<p class="credit3y-error">⚠ 합계가 ${THREE_YEAR_TARGET}학점이 아닙니다. 교육과정 편성표 데이터나 학점 배정을 확인해주세요.</p>` : ''}
    `;
  }

  /* ---------------- PDF 인쇄 ---------------- */
  function openPrintPopup() {
    const info = Store.getStudentInfo();
    const cl = computeChecklist();
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.`;

    function selectedListHtml(sem) {
      const chosen = curriculum.bySemester[sem].filter(s => s.selectType.kind === 'choice' && isChosen(sem, s.name));
      if (!chosen.length) return '<li class="small-muted">선택한 과목이 없습니다.</li>';
      return chosen.map(s => `<li>${ScrapUI.escapeHtml(s.name)} <span style="color:#888;">(${s.category} · ${s.credit}학점)</span></li>`).join('');
    }

    function semesterPairHtml(gradeLabel, sem1, sem2) {
      return `
        <h2>${gradeLabel} 선택 과목</h2>
        <div class="sem-grid">
          <div>
            <div class="sem-col-title">${gradeLabel} 1학기</div>
            <ul>${selectedListHtml(sem1)}</ul>
          </div>
          <div>
            <div class="sem-col-title">${gradeLabel} 2학기</div>
            <ul>${selectedListHtml(sem2)}</ul>
          </div>
        </div>
      `;
    }

    const t = computeThreeYearCredits();

    const html = `
      <!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>상일고등학교 수강과목 선택 점검표</title>
      <style>
        @page{ margin:8mm 7mm; }
        *{box-sizing:border-box;}
        body{font-family:'Malgun Gothic','Pretendard',sans-serif;color:#222;padding:4px 16px;}
        h1{font-size:19px;text-align:center;margin:0 0 2px;}
        .meta{text-align:center;color:#555;font-size:13px;margin-bottom:9px;}
        h2{font-size:14.5px;border-left:4px solid #E08E32;padding-left:8px;margin:9px 0 4px;}
        .sem-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:3px;}
        .sem-col-title{font-size:12.5px;font-weight:700;color:#E08E32;margin-bottom:2px;}
        ul{margin:2px 0;padding-left:18px;font-size:12.5px;line-height:1.4;}
        table{width:100%;border-collapse:collapse;margin-top:4px;font-size:12.5px;}
        th,td{border:1px solid #ccc;padding:4px 8px;text-align:left;line-height:1.25;}
        th{background:#f2f2f2;}
        .section-row td{background:#fbf1da;font-weight:700;color:#B96A1C;}
        .result-table th:nth-child(1),.result-table td:nth-child(1){width:34%;}
        .result-table th:nth-child(3),.result-table td:nth-child(3){width:38px;white-space:nowrap;text-align:center;}
        .credit3y-print-table{max-width:420px;}
        .ok{color:#2F8F5B;font-weight:700;}
        .bad{color:#C24444;font-weight:700;}
        .bottom-grid{display:block;}
        .bottom-grid > div + div{margin-top:2px;}
        .footnote{font-size:11px;color:#666;margin-top:6px;}
        @media print{ body{padding:0 12px;} }
      </style></head>
      <body>
        <h1>상일고등학교 수강과목 선택 점검표 (2026입학생)</h1>
        <div class="meta">학번: ${ScrapUI.escapeHtml(info.studentId) || '____'} &nbsp;&nbsp;|&nbsp;&nbsp; 이름: ${ScrapUI.escapeHtml(info.name) || '____'} &nbsp;&nbsp;|&nbsp;&nbsp; 희망 학과(계열): ${ScrapUI.escapeHtml(info.desiredMajor) || '____'} &nbsp;&nbsp;|&nbsp;&nbsp; 작성일: ${dateStr}</div>

        ${semesterPairHtml('2학년', '2-1', '2-2')}
        ${semesterPairHtml('3학년', '3-1', '3-2')}

        <div class="bottom-grid">
          <div>
            <h2>점검 결과</h2>
            <table class="result-table">
              <thead><tr><th>항목</th><th>세부 내용</th><th>결과</th></tr></thead>
              <tbody>
                <tr class="section-row"><td colspan="3">3개년 이수학점 요건</td></tr>
                ${cl.credits.map(r => `<tr><td>${ScrapUI.escapeHtml(r.label)}</td><td>${ScrapUI.escapeHtml(r.sub)}</td><td class="${r.ok?'ok':'bad'}">${r.ok?'O':'X'}</td></tr>`).join('')}
                <tr class="section-row"><td colspan="3">과목 이수 위계</td></tr>
                ${cl.hierarchy.map(r => `<tr><td>${ScrapUI.escapeHtml(r.label)}</td><td>${ScrapUI.escapeHtml(r.sub)}</td><td class="${r.ok?'ok':'bad'}">${r.ok?'O':'X'}</td></tr>`).join('')}
                <tr class="section-row"><td colspan="3">학기별 선택 개수</td></tr>
                ${cl.semesters.map(r => `<tr><td>${ScrapUI.escapeHtml(r.label)}</td><td>${ScrapUI.escapeHtml(r.sub)}</td><td class="${r.ok?'ok':'bad'}">${r.ok?'O':'X'}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div>
            <h2>교과별 3개년 이수학점</h2>
            <table class="credit3y-print-table">
              <tbody>
                <tr><th>국어</th><td>${t.a}</td><th>사회(史 포함)</th><td>${t.d}</td></tr>
                <tr><th>수학</th><td>${t.b}</td><th>과학</th><td>${t.e}</td></tr>
                <tr><th>영어</th><td>${t.c}</td><th>기타</th><td>${t.f}</td></tr>
                <tr><th>합계</th><td colspan="3" class="${t.ok?'ok':'bad'}">${t.total} / ${THREE_YEAR_TARGET}학점 (${t.ok ? 'O' : 'X'})</td></tr>
              </tbody>
            </table>
            <p class="footnote">▷ 수능 출제 과목은 모두 이수 충족함.</p>
          </div>
        </div>
      </body></html>
    `;

    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) { alert('팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제해주세요.'); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => win.print();
  }

  return { init };
})();
