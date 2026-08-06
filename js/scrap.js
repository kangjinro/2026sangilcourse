/* ==========================================================================
   scrap.js — 스크랩 사이드바('내 스크랩') 렌더링
   사이드바 자체의 표시/숨김은 app.js의 switchTab에서 탭에 따라 제어합니다.
   ========================================================================== */
const ScrapUI = (() => {
  const listEl = () => document.getElementById('scrap-list');

  function render() {
    const scraps = Store.getScraps();
    const el = listEl();
    if (!el) return;
    if (!scraps.length) {
      el.innerHTML = '<p class="scrap-empty">아직 스크랩한 항목이 없어요.<br>학과나 과목을 살펴보다가 마음에 드는 항목을 스크랩해보세요.</p>';
      return;
    }
    el.innerHTML = scraps.map(s => `
      <div class="scrap-item" data-id="${escapeAttr(s.id)}">
        <div class="scrap-item-top">
          <div>
            <span class="scrap-type">${escapeHtml(s.type)}</span>
            <div class="scrap-name">${escapeHtml(s.name)}</div>
          </div>
          <button class="scrap-del" title="삭제" data-id="${escapeAttr(s.id)}">✕</button>
        </div>
        ${s.meta ? `<div class="scrap-meta">${escapeHtml(s.meta)}</div>` : ''}
      </div>
    `).join('');

    el.querySelectorAll('.scrap-del').forEach(btn => {
      btn.addEventListener('click', () => {
        Store.removeScrap(btn.dataset.id);
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(str) { return escapeHtml(str); }

  function init() {
    render();
    document.addEventListener('scraps-changed', render);
  }

  return { init, render, escapeHtml };
})();
