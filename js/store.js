/* ==========================================================================
   store.js — localStorage 기반 상태 저장 (스크랩 / 나의 과목선택 / 학생정보)
   ========================================================================== */
const Store = (() => {
  const KEY_SCRAPS = 'sangil_scraps_v1';
  const KEY_SELECT = 'sangil_myselect_v1';
  const KEY_STUDENT = 'sangil_student_v1';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* noop */ }
  }

  /* ---------------- Scraps ---------------- */
  function getScraps() { return read(KEY_SCRAPS, []); }

  function isScrapped(id) { return getScraps().some(s => s.id === id); }

  function addScrap(item) {
    const list = getScraps();
    if (list.some(s => s.id === item.id)) return;
    list.unshift({ ...item, ts: Date.now() });
    write(KEY_SCRAPS, list);
    document.dispatchEvent(new CustomEvent('scraps-changed'));
  }

  function removeScrap(id) {
    const list = getScraps().filter(s => s.id !== id);
    write(KEY_SCRAPS, list);
    document.dispatchEvent(new CustomEvent('scraps-changed'));
  }

  function toggleScrap(item) {
    if (isScrapped(item.id)) { removeScrap(item.id); return false; }
    addScrap(item);
    return true;
  }

  /* ---------------- 나의 과목선택 ---------------- */
  // shape: { "2-1": { "물리학": true, ... }, "2-2": {...}, "3-1": {...}, "3-2": {...} }
  function getSelections() { return read(KEY_SELECT, { '2-1': {}, '2-2': {}, '3-1': {}, '3-2': {} }); }

  function setSelection(semesterKey, subjectName, checked) {
    const sel = getSelections();
    if (!sel[semesterKey]) sel[semesterKey] = {};
    if (checked) sel[semesterKey][subjectName] = true;
    else delete sel[semesterKey][subjectName];
    write(KEY_SELECT, sel);
    document.dispatchEvent(new CustomEvent('myselect-changed'));
  }

  function isSelected(semesterKey, subjectName) {
    const sel = getSelections();
    return !!(sel[semesterKey] && sel[semesterKey][subjectName]);
  }

  function resetSelections() {
    write(KEY_SELECT, { '2-1': {}, '2-2': {}, '3-1': {}, '3-2': {} });
    document.dispatchEvent(new CustomEvent('myselect-changed'));
  }

  function resetPersonalInfo() {
    write(KEY_STUDENT, { studentId: '', name: '', desiredMajor: '' });
    write(KEY_SELECT, { '2-1': {}, '2-2': {}, '3-1': {}, '3-2': {} });
    write(KEY_SCRAPS, []);
    document.dispatchEvent(new CustomEvent('student-info-changed'));
    document.dispatchEvent(new CustomEvent('myselect-changed'));
    document.dispatchEvent(new CustomEvent('scraps-changed'));
  }

  /* ---------------- 학생 정보 ---------------- */
  function getStudentInfo() { return read(KEY_STUDENT, { studentId: '', name: '', desiredMajor: '' }); }
  function setStudentInfo(info) {
    write(KEY_STUDENT, info);
    document.dispatchEvent(new CustomEvent('student-info-changed'));
  }

  return {
    getScraps, isScrapped, addScrap, removeScrap, toggleScrap,
    getSelections, setSelection, isSelected, resetSelections, resetPersonalInfo,
    getStudentInfo, setStudentInfo,
  };
})();
