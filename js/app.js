/* ==========================================================================
   app.js — 앱 부트스트랩 / 탭 전환 / 팝업 공통 처리
   ========================================================================== */
(function () {
  const TAB_MAP = {
    'dept-explore': { panel: 'tab-dept-explore', mod: () => TabDeptExplore },
    'dept-univ': { panel: 'tab-dept-univ', mod: () => TabDeptUniv },
    'job-explore': { panel: 'tab-job-explore', mod: () => TabJobExplore },
    'univ-recommend': { panel: 'tab-univ-recommend', mod: () => TabUnivRecommend },
    'subject-explore': { panel: 'tab-subject-explore', mod: () => TabSubjectExplore },
    'my-select': { panel: 'tab-my-select', mod: () => TabMySelect },
  };

  let appData = null;
  let initedTabs = new Set();

  function switchTab(tabKey) {
    Object.values(TAB_MAP).forEach(({ panel }) => {
      document.getElementById(panel).hidden = true;
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });
    document.getElementById(TAB_MAP[tabKey].panel).hidden = false;

    document.getElementById('myselect-checklist-col').hidden = (tabKey !== 'my-select');
    document.getElementById('scrap-sidebar').hidden = !(tabKey === 'my-select' || tabKey === 'univ-recommend');

    if (!initedTabs.has(tabKey)) {
      TAB_MAP[tabKey].mod().init(appData);
      initedTabs.add(tabKey);
    }
  }

  function bindTabNav() {
    document.getElementById('tab-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      switchTab(btn.dataset.tab);
    });
  }

  function bindPopup() {
    document.getElementById('popup-close-btn').addEventListener('click', () => {
      document.getElementById('popup-overlay').hidden = true;
    });
    document.getElementById('popup-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'popup-overlay') document.getElementById('popup-overlay').hidden = true;
    });
  }

  async function boot() {
    bindTabNav();
    bindPopup();
    ScrapUI.init();

    const loadingEl = document.getElementById('loading-indicator');
    try {
      appData = await DataLoader.loadAll((doneCount, total) => {
        loadingEl.querySelector('p').textContent = `데이터를 불러오는 중입니다… (${doneCount}/${total})`;
      });
    } catch (err) {
      loadingEl.innerHTML = `<p style="color:#C24444;">데이터를 불러오지 못했습니다.<br>${err.message}<br><span class="small-muted">정적 서버(예: Netlify, GitHub Pages, 또는 로컬 http 서버)로 열람했는지 확인해주세요.</span></p>`;
      return;
    }
    loadingEl.hidden = true;

    // 첫 탭 렌더
    switchTab('dept-explore');
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
