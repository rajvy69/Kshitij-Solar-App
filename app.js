let leads=JSON.parse(localStorage.getItem('k_leads')||'[]');
let masters=JSON.parse(localStorage.getItem('k_masters')||'{"panels":["Waaree","Adani","Vikram Solar","Tata Power Solar","Goldi Solar","Saatvik","Other"],"inverters":["Growatt","Sungrow","GoodWe","Fronius","Havells","Polycab","Other"],"structures":["GI Structure","Aluminium","Elevated","Ground Mount","Shed / Tin Roof"],"docs":["Aadhaar Card","Electricity Bill","Bank Passbook / Cancelled Cheque","Roof / Site Photo"]}');
let user=JSON.parse(localStorage.getItem('k_user')||'null');
let mode=localStorage.getItem('k_mode')||'Field';
let curRole='Admin';

function pickRole(r){
  curRole=r;
  document.getElementById('btnAdmin').className = r=='Admin' ? '' : 'ghost';
  document.getElementById('btnOffice').className = r=='Office' ? '' : 'ghost';
  document.getElementById('btnTeam').className = r=='Team' ? '' : 'ghost';
  document.getElementById('adminOnly').style.display = r=='Admin' ? 'block' : 'none';
  document.getElementById('officeOnly').style.display = r=='Office' ? 'block' : 'none';
  document.getElementById('teamOnly').style.display = r=='Team' ? 'block' : 'none';
}
function doLogin(){
  if(curRole=='Admin'){
    if(document.getElementById('uPass').value!=='kshitij123') return alert('Wrong Admin Password');
    user={name:'Raj',role:'Admin',team:'Lucknow Team'};
  } else if(curRole=='Office'){
    if(document.getElementById('uOfficePass').value!=='office123') return alert('Wrong Office Password');
    user={name:'Office Staff',role:'Office',team:'Lucknow Team'};
  } else {
    let team=document.getElementById('uTeam').value.trim();
    if(!team) return alert('Enter Team Name');
    user={name:team,role:document.getElementById('uRole').value,team:team};
  }
  localStorage.setItem('k_user',JSON.stringify(user));
  location.reload();
}
function logout(){localStorage.removeItem('k_user');location.reload();}
function openSwitch(){document.getElementById('switchPopup').style.display='flex';}
function closeSwitch(){document.getElementById('switchPopup').style.display='none';}
function setMode(m){mode=m;localStorage.setItem('k_mode',m);document.getElementById('modeLabel').innerText=m;closeSwitch();render();}

if(user){document.getElementById('loginPage').style.display='none';}
document.getElementById('modeLabel').innerText=mode;

function visible(l){
  if(!user) return false;
  if(mode=='Office' && user.role=='Admin') return true;
  if(mode=='Team') return l.team==user.team;
  if(mode=='Field') return l.owner==user.name;
  if(user.role=='Admin') return true;
  if(user.role=='Office') return true;
  if(user.role=='Team Head') return l.team==user.team;
  return l.owner==user.name;
}
function save(){localStorage.setItem('k_leads',JSON.stringify(leads));localStorage.setItem('k_masters',JSON.stringify(masters));render();}
function fillMasters(){
  let p=document.getElementById('fPanel');p.innerHTML=masters.panels.map(x=>`<option>${x}</option>`).join('');
  let iv=document.getElementById('fInv');iv.innerHTML=masters.inverters.map(x=>`<option>${x}</option>`).join('');
  let s=document.getElementById('fStruct');s.innerHTML=masters.structures.map(x=>`<option>${x}</option>`).join('');
  let dc=document.getElementById('docChecks');dc.innerHTML=masters.docs.map((d,i)=>`<label class="chk"><input type="checkbox" class="docChk" data-idx="${i}"> ${d}</label>`).join('');
  let ml=document.getElementById('masterList');let t=document.getElementById('masterType').value;ml.innerHTML='<b>Current:</b> '+masters[t].join(' • ');
}
function addMaster(){let t=document.getElementById('masterType').value,v=document.getElementById('masterVal').value.trim();if(!v)return alert('Type value');if(!masters[t].includes(v))masters[t].push(v);document.getElementById('masterVal').value='';save();fillMasters();alert('Added to Master!');}
function delMaster(){let t=document.getElementById('masterType').value,v=document.getElementById('masterVal').value.trim();masters[t]=masters[t].filter(x=>x!==v);document.getElementById('masterVal').value='';save();fillMasters();}
document.getElementById('masterType').onchange=fillMasters;

function addLead(){
  let m=document.getElementById('fMobile').value.trim(),n=document.getElementById('fName').value.trim();
  if(!n||!m)return alert('Name & Mobile required');
  let price=+document.getElementById('fPrice').value||0,adv=+document.getElementById('fAdvance').value||0;
  let docs={};document.querySelectorAll('.docChk').forEach(c=>{docs[c.dataset.idx]=c.checked});
  let obj={name:n,mobile:m,village:document.getElementById('fVillage').value,interest:document.getElementById('fInterest').value,status:document.getElementById('fStatus').value,panel:document.getElementById('fPanel').value,watt:document.getElementById('fWatt').value,size:document.getElementById('fSize').value,inverter:document.getElementById('fInv').value,invType:document.getElementById('fInvType').value,struct:document.getElementById('fStruct').value,price:price,subsidy:+document.getElementById('fSubsidy').value||0,advance:adv,balance:price-adv,pay:document.getElementById('fPay').value,follow:document.getElementById('fFollow').value,install:document.getElementById('fInstall').value,remark:document.getElementById('fRemark').value,docs:docs,owner:user.name,team:user.team};
  let ex=leads.findIndex(x=>x.mobile==m);if(ex>=0)leads[ex]={...leads[ex],...obj};else leads.unshift(obj);save();alert('Lead Saved!');
}
function del(i){if(user.role=='Sales')return alert('Only Admin / Team Head can delete');if(confirm('Delete this lead?')){leads.splice(i,1);save();}}
function toggleDoc(i,key){leads[i].docs=leads[i].docs||{};leads[i].docs[key]=!leads[i].docs[key];save();}
function makeQuote(i){
  let l=leads[i];let {jsPDF}=window.jspdf;let d=new jsPDF();
  d.setFontSize(20);d.setTextColor(213,0,0);d.text("KSHITIJ SOLAR",20,20);
  d.setFontSize(11);d.setTextColor(0,0,0);d.text("Infrastructure & Housing | Since 2016 | Lucknow",20,28);d.text("Solar Energy For Better Tomorrow",20,34);d.line(20,38,190,38);
  d.setFontSize(14);d.text("QUOTATION",20,48);d.setFontSize(12);
  d.text("Customer: "+(l.name||''),20,60);d.text("Mobile: "+(l.mobile||''),20,68);d.text("Village / City: "+(l.village||''),20,76);
  d.text("System Size: "+(l.size||''),20,88);d.text("Panel: "+(l.panel||'')+" "+(l.watt||''),20,96);d.text("Inverter: "+(l.inverter||'')+" "+(l.invType||''),20,104);d.text("Structure: "+(l.struct||''),20,112);
  d.setFontSize(13);d.text("Total Price: Rs. "+(l.price||0),20,126);d.text("Subsidy: Rs. "+(l.subsidy||0),20,134);d.text("Advance Paid: Rs. "+(l.advance||0),20,142);d.text("Balance: Rs. "+(l.balance||0),20,150);
  d.setFontSize(10);d.setTextColor(100,100,100);d.text("This quotation is valid for 7 days. Subsidy as per MNRE guidelines.",20,168);d.text("Thank you for choosing KSHITIJ SOLAR, Lucknow.",20,176);
  d.save("Quotation-"+l.name+".pdf");
}
function render(){
  let q=(document.getElementById('search').value||'').toLowerCase();
  let vis=leads.filter(visible);
  let isOffice=(mode=='Office'&&user&&user.role=='Admin');
  document.getElementById('masterCard').style.display=isOffice?'block':'none';
  document.getElementById('excelCard').style.display=isOffice?'block':'none';
  document.getElementById('c1').innerText=vis.length;
  document.getElementById('c2').innerText=vis.filter(x=>x.status=='New').length;
  document.getElementById('c3').innerText=vis.filter(x=>x.status=='Site Visit').length;
  document.getElementById('c4').innerText=vis.filter(x=>x.status=='Installed').length;
  let today=new Date().toISOString().slice(0,10);
  let todays=vis.filter(x=>x.follow==today);
  document.getElementById('followTop').innerHTML=todays.length?`<b>📞 Today's Follow-up: ${todays.length} leads</b><br><span style="font-size:13px;color:#555">${todays.map(x=>x.name+' ('+x.mobile+')').join(' • ')}</span>`:`<b>📞 Today's Follow-up: 0 leads</b><br><span style="font-size:13px;color:#555">No follow-up today.</span>`;
  let html='';
  vis.forEach(l=>{
    if(q&&!(l.name+l.mobile+l.village).toLowerCase().includes(q))return;
    let realIdx=leads.indexOf(l);let docs=l.docs||{};
    let docHtml=masters.docs.map((dn,di)=>`<label style="font-size:13px"><input type="checkbox" ${docs[di]?'checked':''} onchange="toggleDoc(${realIdx},'${di}')"> ${dn}</label> `).join('');
    html+=`<div class="lead"><b>${l.name}</b> <span class="pill">${l.status}</span><span class="pill">${l.size||''} ${l.panel||''}</span><br><span style="color:#666">📞 ${l.mobile} • 📍 ${l.village||''}</span><br><span style="font-size:13px">☀️ ${l.panel||'-'} ${l.watt||''} • Inv: ${l.inverter||'-'} ${l.invType||''} • ${l.struct||''}</span><br><span style="font-size:13px">💰 Price ₹${l.price||0} • Adv ₹${l.advance||0} • Bal ₹${l.balance||0} • Subsidy ₹${l.subsidy||0}</span><br><span style="font-size:13px">👤 ${l.owner||''} • Team: ${l.team||''} • Follow: ${l.follow||'-'}</span><br><span style="font-size:13px">📝 ${l.remark||''}</span><div style="margin-top:10px;background:#FFFEF5;border:1px solid #FFE082;border-radius:12px;padding:10px"><b style="font-size:13px">📄 Documents</b><br>${docHtml}</div><div class="row" style="margin-top:10px"><a href="tel:${l.mobile}" style="flex:1;text-align:center;background:#00A651;color:#fff;padding:10px;border-radius:12px;text-decoration:none">📞 Call</a><a href="https://wa.me/91${l.mobile}" target="_blank" style="flex:1;text-align:center;background:#25D366;color:#fff;padding:10px;border-radius:12px;text-decoration:none">💬 WhatsApp</a><button style="flex:1;background:#fff;color:#E53935;border:1.5px solid #E53935" onclick="del(${realIdx})">Delete</button></div><button class="ghost" onclick="makeQuote(${realIdx})">📄 Download Quotation PDF</button></div>`
  });
  document.getElementById('list').innerHTML=html||'<p style="text-align:center;color:#888">No leads found</p>';
}
function importExcel(){
  let f=document.getElementById('excelFile').files[0];if(!f)return alert('Select Excel file first');
  let r=new FileReader();r.onload=e=>{
    let wb=XLSX.read(e.target.result,{type:'array'});let rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);let cnt=0;
    rows.forEach(row=>{let mob=String(row.Mobile||row.mobile||'').trim();if(!mob)return;let price=+row.Price||0,adv=+row.Advance||0;let obj={name:row.Name||'',mobile:mob,village:row.Village||'',status:row.Status||'New',panel:row.PanelBrand||'',size:row.SystemSize||'',inverter:row.InverterBrand||'',price:price,subsidy:+row.Subsidy||0,advance:adv,balance:price-adv,follow:row.FollowupDate||'',remark:row.Remark||'',owner:row.Owner||user.name,team:row.Team||user.team};let ex=leads.findIndex(x=>x.mobile==mob);if(ex>=0)leads[ex]={...leads[ex],...obj};else leads.unshift(obj);cnt++;});
    save();document.getElementById('impMsg').innerText='✅ Imported '+cnt+' leads!';
  };r.readAsArrayBuffer(f);
}
function exportExcel(){let vis=leads.filter(visible);let ws=XLSX.utils.json_to_sheet(vis);let wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Leads');XLSX.writeFile(wb,'Kshitij-Solar-Leads.xlsx');}
fillMasters();render();
