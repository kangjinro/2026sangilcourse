/* ==========================================================================
   tab-job-explore.js — 직업탐색 탭 (임금직업정보포털 워크피디아, 스크랩 없음)
   ========================================================================== */
const TabJobExplore = (() => {
  const URL = 'https://www.wagework.go.kr/pt/b/a/retrieveCtgrSrch.do?topPageId=PT06000000&pageId=PT06010200';
  const root = () => document.getElementById('tab-job-explore');

  function init() { render(); }

  function render() {
    root().innerHTML = `
      <div class="panel-head">
        <h2>직업탐색</h2>
        <p>임금직업정보포털 <strong>워크피디아</strong>에서 다양한 직업 정보를 살펴보세요.</p>
      </div>
      <div class="job-embed-wrap">
        <div class="job-embed-actions">
          <span class="small-muted">사이트가 아래에 보이지 않는다면 새 창에서 열어주세요.</span>
          <a href="${URL}" target="_blank" rel="noopener noreferrer">새 창에서 열기 ↗</a>
        </div>
        <iframe src="${URL}" title="워크피디아" loading="lazy"></iframe>
        <p class="job-embed-note">※ 워크피디아 사이트 정책에 따라 화면 내 표시가 제한될 수 있습니다. 이 경우 위의 '새 창에서 열기' 버튼을 이용해주세요.</p>
      </div>
    `;
  }

  return { init };
})();
