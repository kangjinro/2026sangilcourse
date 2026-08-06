/* ==========================================================================
   data-loader.js
   엑셀 데이터를 미리 변환해 js/data-embedded.js 에 내장해두었기 때문에,
   네트워크 요청이나 엑셀 파싱 없이 즉시 데이터를 반환합니다.
   (엑셀을 다시 반영하려면 convert_to_json.py 로 재생성하세요.)
   ========================================================================== */
const DataLoader = (() => {
  async function loadAll(onProgress) {
    const keys = ['deptClass', 'deptInfo', 'subjectsInfo', 'univRecommend', 'curriculum', 'univRecommendSeries'];
    keys.forEach((k, i) => { if (onProgress) onProgress(i + 1, keys.length, k); });
    return EMBEDDED_APP_DATA;
  }
  return { loadAll };
})();
