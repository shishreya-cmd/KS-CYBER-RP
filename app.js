
const KEY="cyberOS_state_v1";
const state=JSON.parse(localStorage.getItem(KEY)||'{"status":{},"notes":{},"customTasks":[],"settings":{"startDate":""},"evidence":{},"selfTests":{}}');
let currentView="today", selectedDay=1;

const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const day=n=>CURRICULUM.days.find(d=>d.id===Number(n));
const status=n=>state.status[n]||"pending";
const setStatus=(n,v)=>{state.status[n]=v;save();};
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const completed=()=>CURRICULUM.days.filter(d=>status(d.id)==="done").length;
const percent=()=>Math.round(completed()/168*100);
const todayDay=()=>{
  if(!state.settings.startDate) return 1;
  const diff=Math.floor((new Date()-new Date(state.settings.startDate+"T00:00:00"))/86400000)+1;
  return Math.min(168,Math.max(1,diff));
};
const nextPending=()=>CURRICULUM.days.find(d=>status(d.id)!=="done")?.id||168;
const effectiveToday=()=>state.settings.startDate?todayDay():nextPending();

function openDay(n){selectedDay=Number(n); renderDay(selectedDay);}
function render(){
  document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));
  const titles={today:"Today",roadmap:"168-Day Roadmap",calendar:"Calendar",tasks:"Task Manager",notes:"Notes",reviews:"Review & Analytics",settings:"Settings"};
  $("#pageTitle").textContent=titles[currentView]||"KS CYBER RP";
  ({today:renderToday,roadmap:renderRoadmap,calendar:renderCalendar,tasks:renderTasks,notes:renderNotes,reviews:renderReviews,settings:renderSettings}[currentView])();
}
function renderToday(){
  const n=effectiveToday(), d=day(n), done=completed();
  const upcoming=CURRICULUM.days.filter(x=>status(x.id)!=="done").slice(0,5);
  $("#content").innerHTML=`
  <div class="grid stats">
    <div class="card stat"><div class="muted small">CURRENT DAY</div><div class="num">${n}/168</div><div class="progress"><i style="width:${n/168*100}%"></i></div></div>
    <div class="card stat"><div class="muted small">COURSE PROGRESS</div><div class="num">${percent()}%</div><div class="muted small">${done} days completed</div></div>
    <div class="card stat"><div class="muted small">PENDING</div><div class="num">${168-done}</div><div class="muted small">days remaining</div></div>
    <div class="card stat"><div class="muted small">STATUS</div><div class="num">${status(n)==="done"?"✓":"→"}</div><div class="muted small">${status(n)}</div></div>
  </div>
  <div class="section-title"><h2>TODAY'S MISSION</h2><button class="btn primary" onclick="openDay(${n})">Open Day ${n}</button></div>
  <div class="card">
    <div class="day-head"><div><div class="day-meta">DAY ${d.id} • WEEK ${d.week} • MONTH ${d.month}</div><h2>${escapeHTML(d.title)}</h2></div><span class="pill ${status(n)}">${status(n).toUpperCase()}</span></div>
    <p class="mission">${escapeHTML(d.mission)}</p>
    <div class="toolbar">
      <button class="btn primary" onclick="setDayStatus(${n},'done')">✓ Complete</button>
      <button class="btn" onclick="setDayStatus(${n},'in-progress')">In progress</button>
      <button class="btn" onclick="setDayStatus(${n},'rescheduled')">Reschedule</button>
      <button class="btn" onclick="openDay(${n})">Study page</button>
    </div>
  </div>
  <div class="today-grid grid">
    <div><div class="section-title"><h2>NEXT UP</h2></div><div class="day-list">${upcoming.map(x=>row(x)).join("")}</div></div>
    <div><div class="section-title"><h2>QUICK NOTES</h2></div><div class="card"><textarea id="quickNote" class="note-area" placeholder="Write today's notes…">${escapeHTML(state.notes[n]||"")}</textarea><button class="btn primary" onclick="saveNote(${n})">Save note</button></div></div>
  </div>`;
}
function row(d){return `<div class="day-row" onclick="openDay(${d.id})"><div class="day-no">D${d.id}</div><div style="flex:1"><strong>${escapeHTML(d.title)}</strong><div class="muted small">Week ${d.week} • Month ${d.month}</div></div><span class="pill ${status(d.id)}">${status(d.id)}</span></div>`}
function renderDay(n){
  const d=day(n);
  $("#content").innerHTML=`
  <div class="toolbar"><button class="btn" onclick="currentView='roadmap';render()">← Roadmap</button><button class="btn" onclick="openDay(${Math.max(1,n-1)})">← Previous</button><button class="btn" onclick="openDay(${Math.min(168,n+1)})">Next →</button></div>
  <div class="card"><div class="day-head"><div><div class="day-meta">DAY ${d.id} • WEEK ${d.week} • MONTH ${d.month}</div><h2>${escapeHTML(d.title)}</h2></div><span class="pill ${status(n)}">${status(n)}</span></div><p class="mission">${escapeHTML(d.mission)}</p></div>
  <div class="grid lesson-grid">
    ${card("MENTAL MODEL",d.mentalModel)}${card("ANALOGY",d.analogy)}${card("VISUALIZE THE FLOW",d.flow)}${card("DO THIS — STEP BY STEP",d.steps,"wide")}
    ${card("RESOURCE",d.resource)}${card("PROOF / OUTPUT",d.proof)}${card("SELF-TEST",d.selfTest)}${card("CYBER CONNECTION",d.cyberConnection)}${card("COMMON CONFUSION",d.commonConfusion)}${card("TIME PLAN",d.timePlan)}
  </div>
  <div class="card" style="margin-top:14px"><div class="section-title"><h2>YOUR DAY RECORD</h2></div>
    <div class="toolbar">
      <button class="btn primary" onclick="setDayStatus(${n},'done');openDay(${n})">✓ Complete</button>
      <button class="btn" onclick="setDayStatus(${n},'in-progress');openDay(${n})">In progress</button>
      <button class="btn" onclick="rescheduleDay(${n})">Reschedule</button>
    </div>
    <textarea id="dayNote" class="note-area" placeholder="Your own explanation, mistakes, observations, revision notes…">${escapeHTML(state.notes[n]||"")}</textarea>
    <button class="btn primary" onclick="saveNote(${n})">Save Day Record</button>
  </div>`;
}
function card(title,text,cls=""){return `<div class="card ${cls}"><div class="muted small">${title}</div><div class="content">${escapeHTML(text||"")}</div></div>`}
function setDayStatus(n,v){setStatus(n,v);render();}
function saveNote(n){const el=$("#dayNote")||$("#quickNote");state.notes[n]=el.value;save();alert("Saved locally.");}
function rescheduleDay(n){const reason=prompt("Why are you rescheduling this day?","");if(reason!==null){state.status[n]="rescheduled";state.reschedule=state.reschedule||{};state.reschedule[n]={reason,at:new Date().toISOString()};save();render();}}

function renderRoadmap(){
  $("#content").innerHTML=`<div class="toolbar"><input id="roadmapSearch" placeholder="Filter days…"><span class="pill">${percent()}% complete</span></div><div class="roadmap">${CURRICULUM.weeks.map(w=>{
    const ds=CURRICULUM.days.filter(d=>d.week===w.week);
    return `<div class="card week-card"><div class="whead"><div><div class="muted small">WEEK ${w.week}</div><h3>${escapeHTML(w.focus)}</h3><div class="muted small">${escapeHTML(w.outcome)}</div></div><span>${ds.filter(d=>status(d.id)==="done").length}/7</span></div><div class="day-grid">${ds.map(d=>`<button class="day-chip ${status(d.id)} ${d.id===effectiveToday()?"today":""}" onclick="openDay(${d.id})">D${d.id}<br>${escapeHTML(d.title.slice(0,20))}</button>`).join("")}</div></div>`}).join("")}</div>`;
}
function renderCalendar(){
  const base=state.settings.startDate?new Date(state.settings.startDate+"T00:00:00"):new Date();
  const year=base.getFullYear(), month=base.getMonth(), first=new Date(year,month,1).getDay(), last=new Date(year,month+1,0).getDate();
  let cells=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<div class="cal-head">${x}</div>`).join("");
  for(let i=0;i<first;i++)cells+=`<div></div>`;
  for(let date=1;date<=last;date++){
    const n=state.settings.startDate?Math.floor((new Date(year,month,date)-new Date(state.settings.startDate+"T00:00:00"))/86400000)+1:null;
    cells+=`<div class="cal-cell"><strong>${date}</strong>${n>=1&&n<=168?`<button class="day-chip ${status(n)}" onclick="openDay(${n})">D${n} · ${escapeHTML(day(n).title.slice(0,16))}</button>`:""}</div>`;
  }
  $("#content").innerHTML=`<div class="card"><div class="section-title"><h2>${base.toLocaleString("default",{month:"long",year:"numeric"})}</h2><span class="muted small">${state.settings.startDate?"Course start: "+state.settings.startDate:"Set a course start date in Settings"}</span></div><div class="calendar">${cells}</div></div>`;
}
function renderTasks(){
  const custom=state.customTasks||[];
  $("#content").innerHTML=`<div class="toolbar"><button class="btn primary" onclick="addTask()">+ Custom task</button></div><div class="card"><h3>Course task statuses</h3>${CURRICULUM.days.slice(0,30).map(d=>row(d)).join("")}</div><div class="section-title"><h2>CUSTOM TASKS</h2></div><div class="card">${custom.length?custom.map((t,i)=>`<div class="task"><div><strong>${escapeHTML(t.title)}</strong><div class="muted small">${escapeHTML(t.date||"No date")} • ${escapeHTML(t.priority||"normal")}</div></div><button class="btn" onclick="deleteTask(${i})">Delete</button></div>`).join(""):`<div class="empty">No custom tasks yet.</div>`}</div>`;
}
function addTask(){const title=prompt("Task name");if(!title)return;const date=prompt("Date (YYYY-MM-DD)","");const priority=prompt("Priority: low / normal / high","normal");state.customTasks.push({title,date,priority,created:new Date().toISOString()});save();renderTasks();}
function deleteTask(i){state.customTasks.splice(i,1);save();renderTasks();}
function renderNotes(){
  $("#content").innerHTML=`<div class="card"><h3>All day notes</h3>${Object.keys(state.notes).length?Object.entries(state.notes).sort((a,b)=>a[0]-b[0]).map(([n,v])=>`<div class="task" onclick="openDay(${n})"><div><strong>Day ${n} — ${escapeHTML(day(n)?.title||"")}</strong><div class="muted small">${escapeHTML(v.slice(0,180))}</div></div></div>`).join(""):`<div class="empty">No notes saved yet.</div>`}</div>`;
}
function renderReviews(){
  const done=completed(), inprog=CURRICULUM.days.filter(d=>status(d.id)==="in-progress").length, res=CURRICULUM.days.filter(d=>status(d.id)==="rescheduled").length;
  $("#content").innerHTML=`<div class="grid stats"><div class="card stat"><div class="muted small">COMPLETED</div><div class="num">${done}</div></div><div class="card stat"><div class="muted small">IN PROGRESS</div><div class="num">${inprog}</div></div><div class="card stat"><div class="muted small">RESCHEDULED</div><div class="num">${res}</div></div><div class="card stat"><div class="muted small">PROGRESS</div><div class="num">${percent()}%</div></div></div><div class="section-title"><h2>WEEKLY REVIEW</h2></div>${CURRICULUM.weeks.map(w=>{const ds=CURRICULUM.days.filter(d=>d.week===w.week);const c=ds.filter(d=>status(d.id)==="done").length;return `<div class="card" style="margin:8px 0"><div class="whead"><strong>Week ${w.week} — ${escapeHTML(w.focus)}</strong><span>${c}/7</span></div><div class="progress"><i style="width:${c/7*100}%"></i></div></div>`}).join("")}`;
}
function renderSettings(){
  $("#content").innerHTML=`<div class="card"><h3>Course settings</h3><label class="muted small">COURSE START DATE</label><br><input type="date" id="startDate" value="${escapeHTML(state.settings.startDate||"")}"><button class="btn primary" onclick="setStartDate()">Save start date</button><p class="muted small">The roadmap uses this date to calculate your current day.</p></div>
  <div class="card" style="margin-top:12px"><h3>Backup</h3><button class="btn primary" onclick="exportData()">Export full backup</button> <label class="btn">Import backup<input id="importFile" type="file" accept=".json" hidden></label><button class="btn" onclick="resetData()">Reset progress</button></div>`;
  $("#importFile")?.addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{Object.assign(state,JSON.parse(r.result));save();render();alert("Backup imported.")}catch{alert("Invalid backup file.")}};r.readAsText(f)});
}
function setStartDate(){state.settings.startDate=$("#startDate").value;save();render();}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cyber-os-backup.json";a.click();URL.revokeObjectURL(a.href)}
function resetData(){if(confirm("Reset all local progress, notes and custom tasks?")){localStorage.removeItem(KEY);location.reload();}}

document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>{currentView=b.dataset.view;render()}));
$("#menuBtn").addEventListener("click",()=>$(".sidebar").classList.toggle("open"));
$("#exportBtn").addEventListener("click",exportData);
$("#searchBox").addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();if(!q){return}const hits=CURRICULUM.days.filter(d=>(d.title+" "+d.mission+" "+d.resource+" "+d.cyberConnection).toLowerCase().includes(q)).slice(0,20);$("#content").innerHTML=`<div class="section-title"><h2>SEARCH RESULTS</h2></div><div class="day-list">${hits.map(row).join("")||'<div class="empty">No matching days.</div>'}</div>`});
$("#modalClose").addEventListener("click",()=>$("#modal").classList.add("hidden"));

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
render();
