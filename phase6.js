/* ZERO TO EMPIRE — PHASE LOADER: 6 → 7 → 8 → 9 */
(()=>{
  const files=['/phase6-core.js','/phase7.js','/phase8.js','/phase9.js'];
  let i=0;
  const next=()=>{
    if(i>=files.length)return;
    const s=document.createElement('script');
    s.src=files[i++]+'?v=009';
    s.onload=next;
    s.onerror=()=>console.error('Zero to Empire phase failed to load:',s.src);
    document.body.appendChild(s);
  };
  next();
})();