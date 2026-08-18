/* ZERO TO EMPIRE — PHASE LOADER: 6 → 7 */
(()=>{
  const core=document.createElement('script');
  core.src='/phase6-core.js';
  core.onload=()=>{
    const p7=document.createElement('script');
    p7.src='/phase7.js';
    document.body.appendChild(p7);
  };
  document.body.appendChild(core);
})();
