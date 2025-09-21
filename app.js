const $ = (s)=>document.querySelector(s);
let FACTORS = {};
const fmt = (n)=>Number(n).toFixed(2);

async function loadFactors(){
  const res = await fetch('factors.json');
  FACTORS = await res.json();
  const sel = $('#habit');
  FACTORS.factors.forEach(f=>{
    const opt = document.createElement('option');
    opt.value = f.id; opt.textContent = f.name + ` (kg per ${f.unit})`;
    sel.appendChild(opt);
  });
  updateUnit();
}

function getLog(){
  return JSON.parse(localStorage.getItem('co2log')||'[]');
}
function setLog(v){
  localStorage.setItem('co2log', JSON.stringify(v));
}

function updateUnit(){
  const id = $('#habit').value;
  const f = FACTORS.factors.find(x=>x.id===id);
  $('#unit').textContent = f? f.unit : 'unit';
}

function addRow(e){
  const date = $('#date').value || new Date().toISOString().slice(0,10);
  const member = $('#member').value.trim();
  const habit = $('#habit').value;
  const qty = parseFloat($('#qty').value||'0');
  if(!habit || !qty || qty<=0){ alert('Select a habit and enter quantity > 0'); return; }
  const f = FACTORS.factors.find(x=>x.id===habit);
  if(!f){ alert('Invalid habit selected'); return; }
  const saved = qty * f.factor;
  const row = {id: crypto.randomUUID(), date, member, habit, qty, unit:f.unit, saved: +saved.toFixed(4)};
  const log = getLog();
  log.push(row); setLog(log);
  $('#qty').value = '';
  // Add small delay to prevent rapid consecutive updates
  requestAnimationFrame(() => render());
}

function removeRow(id){
  const log = getLog().filter(r=>r.id!==id); 
  setLog(log); 
  requestAnimationFrame(() => render());
}

function render(){
  const tbody = $('#log tbody');
  const log = getLog().sort((a,b)=>a.date.localeCompare(b.date));
  let total = 0;
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  for(const r of log){
    total += r.saved;
    const tr = document.createElement('tr');
    
    // Create cells individually instead of innerHTML for better performance
    tr.appendChild(createCell(r.date));
    tr.appendChild(createCell(r.member||''));
    tr.appendChild(createCell(nameOf(r.habit)));
    tr.appendChild(createCell(r.qty));
    tr.appendChild(createCell(r.unit));
    tr.appendChild(createCell(fmt(r.saved)));
    
    const delCell = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'del';
    delBtn.dataset.id = r.id;
    delBtn.onclick = ()=>removeRow(r.id);
    delCell.appendChild(delBtn);
    tr.appendChild(delCell);
    
    fragment.appendChild(tr);
  }
  
  // Single DOM update
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
  $('#total').textContent = fmt(total);
  
  updateKPIs(log);
  drawCharts(log);
}

function createCell(content){
  const td = document.createElement('td');
  td.textContent = content;
  return td;
}

function nameOf(id){
  const f = FACTORS.factors.find(x=>x.id===id); return f? f.name : id;
}

function updateKPIs(log){
  const total = log.reduce((s,r)=>s+r.saved,0);
  $('#kpiTotal').textContent = fmt(total)+ ' kg';
  const days = (new Set(log.map(r=>r.date))).size || 1;
  $('#kpiAvg').textContent = fmt(total/days)+' kg';
  const byHabit = {};
  log.forEach(r=>{byHabit[r.habit]=(byHabit[r.habit]||0)+r.saved;});
  const top = Object.entries(byHabit).sort((a,b)=>b[1]-a[1])[0];
  $('#kpiTop').textContent = top? `${nameOf(top[0])} (${fmt(top[1])} kg)` : '–';
}

let chartHabit, chartTime;
function drawCharts(log){
  const ctx1 = document.getElementById('byHabit');
  const ctx2 = document.getElementById('overTime');
  
  // Skip chart updates if no data
  if(log.length === 0) {
    if(chartHabit) chartHabit.destroy();
    if(chartTime) chartTime.destroy();
    return;
  }
  
  const byHabit = {};
  const byDate = {};
  log.forEach(r=>{ 
    const habitName = nameOf(r.habit);
    byHabit[habitName] = (byHabit[habitName]||0)+r.saved; 
    byDate[r.date]=(byDate[r.date]||0)+r.saved;
  });
  
  const labelsH = Object.keys(byHabit); 
  const dataH = Object.values(byHabit);
  const labelsT = Object.keys(byDate); 
  const dataT = labelsT.map(d=>byDate[d]);
  
  // Destroy existing charts
  if(chartHabit) chartHabit.destroy(); 
  if(chartTime) chartTime.destroy();
  
  // Optimized chart options
  chartHabit = new Chart(ctx1,{
    type:'doughnut', 
    data:{
      labels:labelsH, 
      datasets:[{
        data:dataH, 
        backgroundColor:['#22c55e','#f59e0b','#3b82f6','#eab308','#10b981','#ef4444','#a78bfa','#06b6d4']
      }]
    },
    options:{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, font: { size: 11 } }
        }
      }
    }
  });
  
  chartTime = new Chart(ctx2,{
    type:'bar', 
    data:{
      labels:labelsT, 
      datasets:[{
        label:'kg CO₂e saved', 
        data:dataT, 
        backgroundColor:'#3b82f6'
      }]
    }, 
    options:{
      responsive: true,
      maintainAspectRatio: false,
      scales:{
        y:{beginAtZero:true}
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function exportCSV(){
  const log = getLog();
  const rows = [['date','member','habit_id','habit_name','qty','unit','saved_kg']];
  log.forEach(r=>rows.push([r.date,r.member||'',r.habit,nameOf(r.habit),r.qty,r.unit,r.saved]));
  const csv = rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'co2_log.csv'; a.click();
}

function importCSV(ev){
  const file = ev.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try {
      const lines = reader.result.split(/\r?\n/).filter(x=>x.trim());
      if(lines.length < 2) { alert('CSV file appears to be empty or invalid'); return; }
      const out = getLog();
      const hdr = lines[0].split(',').map(h=>h.replaceAll('"','').trim());
      for(let i=1;i<lines.length;i++){
        const cols = lines[i].match(/(?:"(?:[^"]|")*"|[^,])+/g);
        if(!cols) continue;
        cols.forEach((col, idx) => cols[idx] = col.replace(/^"|"$/g,'').replace(/""/g,'"'));
        const rec = Object.fromEntries(hdr.map((h,idx)=>[h, cols[idx]]));
        if(rec.date && rec.habit_id && rec.qty) {
          out.push({ id: crypto.randomUUID(), date: rec.date, member: rec.member || '', habit: rec.habit_id, qty: parseFloat(rec.qty) || 0, unit: rec.unit || '', saved: parseFloat(rec.saved_kg) || 0 });
        }
      }
      setLog(out); render();
      alert(`Successfully imported ${lines.length-1} entries from CSV`);
    } catch(e) {
      alert('Error importing CSV: ' + e.message);
    }
  };
  reader.readAsText(file);
}

function resetAll(){ if(confirm('Delete all local data?')){ localStorage.removeItem('co2log'); render(); }}

$('#habit')?.addEventListener('change', updateUnit);
$('#add')?.addEventListener('click', addRow);
$('#export')?.addEventListener('click', exportCSV);
$('#import')?.addEventListener('change', importCSV);
$('#reset')?.addEventListener('click', resetAll);

// Set today's date as default
$('#date').value = new Date().toISOString().slice(0,10);

loadFactors().then(render);
