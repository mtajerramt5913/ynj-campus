// YNJ Campus : comptes, rôles, filières et ressources sur Supabase.
// Tuteurs, disponibilités et séances en ligne : Supabase + Google Meet (fonction create-meet).
const $=s=>document.querySelector(s),A=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sb=(window.YNJ&&YNJ.SUPABASE_URL&&window.supabase)?supabase.createClient(YNJ.SUPABASE_URL,YNJ.SUPABASE_ANON_KEY):null;
let P=null,SP=[],RS={},rid=0,lastF='',forceTop=false,D={k:'',iso:''},tt;
let S={sp:null,kind:'cours',sem:'',q:'',tq:'',tf:'Toutes',tab:'avenir'};
const KIND={cours:'Cours',exercice:'Exercices',examen:'Examens'},LV={licence:'Licence',master:'Master',doctorat:'Doctorat'};
const DAYS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],WD=[1,2,3,4,5,6,0];
const STL={pending:'En attente',confirmed:'Confirmée',done:'Terminée',refused:'Refusée',cancelled:'Annulée'};
const IC={book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M20 17v4H6.5a2.5 2.5 0 0 1 0-4"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.6.2 4.1 1.8 4.5 4.5"/>',
cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const STAR='<img src="assets/mark.png" alt="">',LOGO=STAR;
const NAVS=[['resources','book','Ressources'],['tutors','users','Tuteurs'],['sessions','cal','Séances'],['badges','star','Profil']];
const AUTHR=NAVS.map(n=>n[0]);

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),3800)}
const need=()=>sb?'':'<p class="note">Base de données non configurée : renseigne config.js (voir README).</p>';
const pubTop=()=>`<header class="top"><a class="logo" href="#home">${LOGO}YNJ Campus</a><nav><a href="#login">Se connecter</a><a class="btn s" href="#signup">Créer un compte</a></nav></header>`;
const gate=()=>`${pubTop()}<div class="empty"><div class="arch">${STAR}</div><h2>Connecte-toi pour continuer</h2>${need()}<p class="m" style="margin:8px 0 18px">Un email universitaire @uca.ma est nécessaire.</p><a class="btn" href="#login">Se connecter</a></div>`;
const authPage=(h,b)=>`${pubTop()}<div class="ap"><div class="apl" aria-hidden="true">${STAR}<p>Yallah Na9raw Jmi3</p></div><div class="apf"><h2>${h}</h2>${need()}${b}</div></div>`;
const rail=f=>`<a class="logo" href="#resources">${LOGO}YNJ Campus</a><div style="height:18px"></div>${NAVS.map(n=>`<a href="#${n[0]}" class="${f===n[0]?'on':''}" ${f===n[0]?'aria-current="page"':''}>${ic(n[1])}${n[2]}</a>`).join('')}<div class="who"><b>${esc(P.full_name)}</b><br>${LV[P.level]}${P.tutor_status==='pending'?'':''}</div><button class="lo" onclick="logout()">Se déconnecter</button>`;
const tabs=f=>NAVS.map(n=>`<a href="#${n[0]}" class="${f===n[0]?'on':''}" ${f===n[0]?'aria-current="page"':''}>${ic(n[1])}${n[2]}</a>`).join('');

async function loadSp(){if(sb&&!SP.length){const{data}=await sb.from('specialties').select('*').order('establishment').order('name');SP=data||[]}}
async function loadP(){P=null;if(!sb)return;const{data:{session}}=await sb.auth.getSession();if(!session)return;
 const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();P=data;
}

const R={};
R.home=()=>`${pubTop()}<section class="hero"><div><h1>Yallah Na9raw Jmi3</h1><p class="ar" lang="ar" dir="rtl">يلا نقراو جميع</p>
<p class="lead">Les étudiants de master et de doctorat de l’Université Cadi Ayyad aident ceux de licence à débloquer ce qu’ils n’ont pas compris, et déposent cours, exercices et examens classés par filière.</p>
<div class="cta"><a class="btn y" href="#signup">Créer mon compte</a><a class="btn o" href="#login">J’ai déjà un compte</a></div></div><div class="arch">${STAR}</div></section>
<section class="trio"><div class="card"><h3>Un tuteur de ta filière</h3><p class="m">Pose ta question à quelqu’un qui a déjà réussi cette matière, en visio sur Google Meet.</p></div>
<div class="card"><h3>Une bibliothèque par filière</h3><p class="m">Cours, exercices et examens des années précédentes, triés par semestre, pour les licences fondamentales et les licences en éducation.</p></div>
<div class="card"><h3>Un engagement reconnu</h3><p class="m">Chaque séance et chaque ressource partagée fait gagner des badges aux tuteurs bénévoles.</p></div></section>
<h2 class="sec">Comment ça marche</h2><ol class="steps"><li><div><h3>Tu t’inscris</h3><p class="m">Avec ton email universitaire et ta filière.</p></div></li>
<li><div><h3>Tu trouves de l’aide</h3><p class="m">Consulte les ressources ou demande un rendez-vous à un tuteur.</p></div></li>
<li><div><h3>Tu avances, puis tu transmets</h3><p class="m">Une fois en master, tu deviens tuteur à ton tour.</p></div></li></ol>
<div class="foot"><img src="assets/logo.png" alt="YNJ Campus, Yallah Na9raw Jmi3, plateforme de tutorat entre pairs, Université Cadi Ayyad"><p class="m">Projet EduHack UCA, par Moussabe Tajerramt et Lamyaa Berry.</p></div>`;

R.login=()=>authPage('Se connecter',`<label for="le">Email universitaire</label><input id="le" type="email" autocomplete="email" placeholder="prenom.nom@uca.ma"><label for="lp">Mot de passe</label><input id="lp" type="password" autocomplete="current-password"><button class="btn w" onclick="login()">Se connecter</button><p style="margin-top:14px"><a href="#signup">Créer un compte</a></p>`);
R.signup=async()=>{await loadSp();const o=SP.map(s=>`<option value="${s.id}">${esc(s.name)}, ${esc(s.establishment)}</option>`).join('');
 return authPage('Créer mon compte',`<label for="em">Email universitaire</label><input id="em" type="email" placeholder="prenom.nom@uca.ma" autocomplete="email">
<label for="nm">Nom complet</label><input id="nm" autocomplete="name"><label for="nv">Niveau d’études</label><select id="nv"><option value="licence">Licence</option><option value="master">Master</option><option value="doctorat">Doctorat</option></select>
<label for="fi">Filière</label><select id="fi">${o}</select><label for="pw">Mot de passe (8 caractères minimum)</label><input id="pw" type="password" autocomplete="new-password">
<button class="btn w" onclick="signup()">Créer mon compte</button><p class="note">Un email @uca.ma est requis. En master ou doctorat, tu deviens tuteur dès l’inscription : tu peux publier des ressources et indiquer tes disponibilités.</p><p><a href="#login">J’ai déjà un compte</a></p>`)};
async function signup(){const e=$('#em').value.trim(),n=$('#nm').value.trim(),pw=$('#pw').value;
 if(!sb)return toast('Base de données non configurée (voir README).');
 if(!/^[^@\s]+@([a-z0-9-]+\.)*uca\.(ac\.)?ma$/i.test(e))return toast('Utilise ton email universitaire (@uca.ma).');
 if(!n||pw.length<8)return toast('Renseigne ton nom et un mot de passe de 8 caractères minimum.');
 const{data,error}=await sb.auth.signUp({email:e,password:pw,options:{data:{full_name:n,level:$('#nv').value,specialty_id:$('#fi').value}}});
 if(error)return toast('Inscription impossible : '+error.message);
 if(!data.session)return toast('Compte créé. Confirme ton email, puis connecte-toi.');
 await loadP();go('resources')}
async function login(){if(!sb)return toast('Base de données non configurée (voir README).');
 const{error}=await sb.auth.signInWithPassword({email:$('#le').value.trim(),password:$('#lp').value});
 if(error)return toast('Connexion impossible : '+error.message);await loadP();go('resources')}
async function logout(){await sb.auth.signOut();P=null;S.sp=null;go('home')}
const go=h=>{location.hash=h};

// --- Ressources pédagogiques (base de données)
const spItem=s=>`<button class="sp ${S.sp===s.id?'on':''}" onclick="openSp('${s.id}')"><b>${esc(s.name)}</b><span class="m">${esc(s.establishment)}</span></button>`;
const spHtml=q=>{q=q.toLowerCase();const f=SP.filter(s=>(s.name+' '+s.establishment).toLowerCase().includes(q)),mine=f.find(s=>s.id===P.specialty_id),rest=f.filter(s=>s!==mine);
 const g=(t,l)=>l.length?`<h3 class="gh">${t}</h3>`+l.map(spItem).join(''):'';
 return (mine?g('Ma filière',[mine]):'')+g('Licences fondamentales',rest.filter(s=>s.cursus==='fondamentale'))+g('Licences en éducation',rest.filter(s=>s.cursus==='education'))||'<p class="m">Aucune filière trouvée.</p>'};
const spList=()=>{S.q=$('#sq2').value;$('#spl').innerHTML=spHtml(S.q)};
const openSp=id=>{S.sp=id;S.kind='cours';S.sem='';forceTop=true;render()};
R.resources=async()=>{
 if(!sb||!P)return gate();
 await loadSp();
 const det=S.sp&&SP.find(x=>x.id===S.sp)?await detail():`<div class="empty"><div class="arch">${STAR}</div><h3>Choisis une filière</h3><p class="m">Les cours, exercices et examens apparaissent ici.</p></div>`;
 return `<h2>Ressources</h2><p class="m">Cours, exercices et examens des années précédentes, par filière.</p>
<div class="split ${S.sp?'has':''}"><div class="plist"><input id="sq2" type="search" placeholder="Chercher une filière ou une faculté" value="${esc(S.q)}" oninput="spList()" aria-label="Chercher une filière"><div id="spl">${spHtml(S.q)}</div></div><section class="pdet">${det}</section></div>`};
async function detail(){const s=SP.find(x=>x.id===S.sp);
 let q=sb.from('resources').select('*,profiles(full_name)').eq('specialty_id',s.id).eq('kind',S.kind);if(S.sem)q=q.eq('semester',+S.sem);
 const{data,error}=await q.order('year',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false});
 RS={};(data||[]).forEach(r=>RS[r.id]=r);
 const can=P.tutor_status==='approved'&&P.level!=='licence';
 const list=error?`<p class="note">Chargement impossible : ${esc(error.message)}</p>`:(data||[]).length?data.map(r=>`<article class="res"><div class="sem">${r.semester?'S'+r.semester:'—'}</div><div><h3>${esc(r.title)}</h3>${r.description?`<p class="m">${esc(r.description)}</p>`:''}<p class="m meta">${r.year?`<span>${r.year}</span>`:''}<span>par ${esc(r.profiles?.full_name||'un tuteur')}</span></p></div><div class="ra"><button class="btn s" onclick="openRes('${r.id}')">Ouvrir</button>${r.author_id===P.id?`<button class="btn s ko" onclick="delRes('${r.id}')">Supprimer</button>`:''}</div></article>`).join(''):`<div class="empty"><p class="m">Rien ici pour l’instant. ${can?'Ajoute la première ressource !':'Les étudiants de master et de doctorat en publient progressivement.'}</p></div>`;
 return `<button class="btn o s only-m" onclick="S.sp=null;forceTop=true;render()">‹ Toutes les filières</button>
<h2 style="margin-top:10px">${esc(s.name)}</h2><p class="m">${esc(s.establishment)}, ${s.cursus==='education'?'licence en éducation':'licence fondamentale'}</p>
<div class="chips" role="group" aria-label="Type">${Object.entries(KIND).map(([k,v])=>`<button class="chip ${S.kind===k?'on':''}" aria-pressed="${S.kind===k}" onclick="S.kind='${k}';render()">${v}</button>`).join('')}</div>
<div class="chips" role="group" aria-label="Semestre">${['','1','2','3','4','5','6'].map(x=>`<button class="chip ${S.sem===x?'on':''}" aria-pressed="${S.sem===x}" onclick="S.sem='${x}';render()">${x?'S'+x:'Tous'}</button>`).join('')}</div>${list}
${can?`<button class="btn y" onclick="openAdd()">Ajouter une ressource</button>`:'<p class="note">Seuls les étudiants en master ou doctorat peuvent ajouter des ressources.</p>'}`}
function dlg(h){const d=$('#dlg');d.innerHTML=`<div class="dh"><button class="x" onclick="$('#dlg').close()" aria-label="Fermer">×</button></div>${h}`;d.showModal()}
$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg')e.target.close()});
const openAdd=()=>dlg(`<h2>Ajouter une ressource</h2>
<label for="rk">Type</label><select id="rk">${Object.entries(KIND).map(([k,v])=>`<option value="${k}" ${S.kind===k?'selected':''}>${v}</option>`).join('')}</select>
<label for="rs">Semestre</label><select id="rs">${[1,2,3,4,5,6].map(i=>`<option value="${i}">S${i}</option>`).join('')}</select>
<label for="rt">Titre</label><input id="rt" maxlength="120" placeholder="Examen d’analyse 1, session normale">
<label for="ry">Année (examens)</label><input id="ry" inputmode="numeric" placeholder="2025">
<label for="rd">Description (facultatif)</label><textarea id="rd" rows="2" maxlength="300"></textarea>
<label for="rf">Fichier (10 Mo maximum)</label><input id="rf" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*">
<label for="rl">Ou un lien (Drive, etc.)</label><input id="rl" placeholder="https://…">
<button class="btn w" onclick="addRes()">Publier</button>`);
async function addRes(){const t=$('#rt').value.trim(),l=$('#rl').value.trim(),f=$('#rf').files[0];
 if(t.length<3||(!f&&!/^https?:\/\//i.test(l)))return toast('Indique un titre et un fichier ou un lien http(s).');
 if(f&&f.size>10485760)return toast('Fichier trop lourd (10 Mo maximum).');
 let fp=null;
 if(f){fp=`${S.sp}/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g,'_')}`;const u=await sb.storage.from('resources').upload(fp,f);if(u.error)return toast('Envoi impossible : '+u.error.message)}
 const{error}=await sb.from('resources').insert({specialty_id:S.sp,kind:$('#rk').value,semester:+$('#rs').value,title:t,description:$('#rd').value.trim()||null,year:parseInt($('#ry').value)||null,url:fp?null:l,file_path:fp});
 if(error){if(fp)await sb.storage.from('resources').remove([fp]);return toast('Publication refusée : '+error.message)}
 S.kind=$('#rk').value;$('#dlg').close();toast('Ressource publiée.');render()}
async function openRes(id){const r=RS[id];if(r.url)return window.open(r.url,'_blank','noopener');
 const w=window.open('about:blank','_blank');const{data,error}=await sb.storage.from('resources').createSignedUrl(r.file_path,3600);
 if(error){if(w)w.close();return toast('Fichier introuvable : '+error.message)}
 if(w)w.location=data.signedUrl;else location.href=data.signedUrl}
async function delRes(id){if(!confirm('Supprimer cette ressource ?'))return;const r=RS[id];
 const{error}=await sb.from('resources').delete().eq('id',id);if(error)return toast(error.message);
 if(r.file_path)await sb.storage.from('resources').remove([r.file_path]);toast('Ressource supprimée.');render()}

// --- Tuteurs, disponibilités et séances (base de données, visio Google Meet)
const spName=id=>(SP.find(s=>s.id===id)||{}).name||'Filière non précisée';
const ini=n=>esc(n.split(' ').map(w=>w[0]).slice(0,2).join(''));
const hm=t=>t.slice(0,5);
const fmt=d=>new Date(d).toLocaleString('fr-FR',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
const sortAv=l=>[...l].sort((a,b)=>WD.indexOf(a.weekday)-WD.indexOf(b.weekday)||a.start_time.localeCompare(b.start_time));
const avSum=t=>(t.availabilities||[]).length?sortAv(t.availabilities).map(a=>`${DAYS[a.weekday]} ${hm(a.start_time)} à ${hm(a.end_time)}`).join(', '):'Pas encore de disponibilités';
let TU=[],TD=null,SLOTS={};
function sel(el){el.parentNode.querySelectorAll('.chip').forEach(b=>{const on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
const tList=()=>{const q=S.tq.toLowerCase(),l=TU.filter(t=>(S.tf==='Toutes'||t.specialty_id===P.specialty_id)&&(t.full_name+' '+(t.subjects||'')+' '+spName(t.specialty_id)).toLowerCase().includes(q));
 return l.length?l.map(t=>`<button class="card tc" onclick="openT('${t.id}')"><div class="row"><div class="av" aria-hidden="true">${ini(t.full_name)}</div><div><h3>${esc(t.full_name)}</h3><p class="m">${LV[t.level]}, ${esc(spName(t.specialty_id))}</p></div></div><div>${(t.subjects||'').split(',').filter(x=>x.trim()).map(x=>`<span class="tag">${esc(x.trim())}</span>`).join('')}</div><p class="m" style="margin-top:8px">${esc(avSum(t))}</p></button>`).join(''):'<div class="empty"><p class="m">Aucun tuteur ne correspond pour l’instant.</p></div>'};
const tFilter=()=>{S.tq=$('#tq').value;$('#tl').innerHTML=tList()};
R.tutors=async()=>{if(!sb||!P)return gate();await loadSp();
 const{data,error}=await sb.from('profiles').select('id,full_name,level,specialty_id,bio,subjects,availabilities(*)').eq('tutor_status','approved').in('level',['master','doctorat']).neq('id',P.id);
 TU=data||[];
 return `<h2>Tuteurs</h2><p class="m">Étudiants de master et de doctorat. Les séances ont lieu en ligne, sur Google Meet.</p>${error?`<p class="note">${esc(error.message)}</p>`:''}
<input id="tq" type="search" placeholder="Chercher une matière ou un nom" value="${esc(S.tq)}" oninput="tFilter()" aria-label="Chercher un tuteur" style="margin-top:12px">
<div class="chips">${['Toutes','Ma filière'].map(f=>`<button class="chip ${S.tf===f?'on':''}" aria-pressed="${S.tf===f}" onclick="S.tf='${f}';render()">${f}</button>`).join('')}</div><div class="grid" id="tl">${tList()}</div>`};
function slotMap(t){const m={},now=new Date();
 for(let i=0;i<14;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
  for(const a of t.availabilities||[]){if(a.weekday!==d.getDay())continue;
   const[h,mi]=a.start_time.split(':').map(Number),[eh,em]=a.end_time.split(':').map(Number);
   for(let x=h*60+mi;x+30<=eh*60+em;x+=30){const s=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,x);if(s>now){const k=d.toDateString();(m[k]=m[k]||{d,t:[]}).t.push(s)}}}}
 Object.values(m).forEach(v=>v.t.sort((a,b)=>a-b));return m}
function openT(id){TD=TU.find(x=>x.id===id);SLOTS=slotMap(TD);D={k:'',iso:''};const days=Object.entries(SLOTS).sort((a,b)=>a[1].d-b[1].d);
 dlg(`<div class="row"><div class="av" aria-hidden="true">${ini(TD.full_name)}</div><div><h2 style="font-size:1.4rem">${esc(TD.full_name)}</h2><p class="m">${LV[TD.level]}, ${esc(spName(TD.specialty_id))}</p></div></div>
${TD.bio?`<p style="margin:14px 0">${esc(TD.bio)}</p>`:''}
${days.length?`<h3 style="margin-top:14px">Jour</h3><div class="chips">${days.map(([k,v])=>`<button class="chip" aria-pressed="false" data-k="${esc(k)}" onclick="pickDay(this)">${v.d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</button>`).join('')}</div>
<h3>Heure (30 minutes, en ligne sur Google Meet)</h3><div class="chips" id="times"><span class="m">Choisis d’abord un jour.</span></div>
<label for="ch">Matière ou chapitre</label><input id="ch" maxlength="120" placeholder="Analyse, séries numériques"><label for="qq">Ma question principale</label><textarea id="qq" rows="3" maxlength="300" placeholder="Explique ce que tu n’as pas compris"></textarea>
<button class="btn w" onclick="send()">Envoyer ma demande</button>`:'<p class="note">Ce tuteur n’a pas encore indiqué ses disponibilités.</p>'}`)}
function pickDay(el){sel(el);D={k:el.dataset.k,iso:''};$('#times').innerHTML=SLOTS[D.k].t.map(s=>`<button class="chip" aria-pressed="false" data-iso="${s.toISOString()}" onclick="pickTime(this)">${s.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</button>`).join('')}
function pickTime(el){sel(el);D.iso=el.dataset.iso}
async function send(){const sub=$('#ch').value.trim(),q=$('#qq').value.trim();
 if(!D.iso)return toast('Choisis un jour et une heure.');
 if(sub.length<3||q.length<10)return toast('Indique la matière (3 caractères) et ta question (10 caractères minimum).');
 const{error}=await sb.from('appointments').insert({tutor_id:TD.id,subject:sub,question:q,scheduled_at:D.iso});
 if(error)return toast(error.code==='23505'?'Ce créneau vient d’être pris, choisis-en un autre.':'Demande refusée : '+error.message);
 S.tab='avenir';$('#dlg').close();toast('Demande envoyée à '+TD.full_name+'.');go('sessions')}
const sCard=r=>{const tu=r.tutor_id===P.id,o=(tu?r.student:r.tutor)||{full_name:'Étudiant'},ok=/^https:\/\/meet\.google\.com\//.test(r.meet_url||'');
 return `<article class="card" style="margin-top:12px"><div class="row"><div class="av" aria-hidden="true">${ini(o.full_name)}</div><div class="g1"><h3>${esc(o.full_name)}</h3><p class="m">${esc(r.subject)}</p><p class="m meta"><span>${fmt(r.scheduled_at)}</span><span>En ligne, Google Meet</span></p></div><span class="pill st-${r.status}">${STL[r.status]}</span></div>
<p class="m" style="margin-top:10px">« ${esc(r.question)} »</p><div class="row" style="margin-top:12px;flex-wrap:wrap">
${tu&&r.status==='pending'?`<button class="btn s" onclick="confirmR('${r.id}')">Confirmer</button><button class="btn s ko" onclick="setR('${r.id}','refused')">Refuser</button>`:''}
${r.status==='confirmed'&&ok?`<a class="btn s" href="${esc(r.meet_url)}" target="_blank" rel="noopener">Rejoindre Google Meet</a>`:''}
${tu&&r.status==='confirmed'?`<button class="btn s o" onclick="setR('${r.id}','done')">Marquer comme terminée</button>`:''}
${!tu&&['pending','confirmed'].includes(r.status)?`<button class="btn s ko" onclick="setR('${r.id}','cancelled')">Annuler</button>`:''}</div></article>`};
R.sessions=async()=>{if(!sb||!P)return gate();
 const{data,error}=await sb.from('appointments').select('*,student:profiles!appointments_student_id_fkey(full_name),tutor:profiles!appointments_tutor_id_fkey(full_name)').order('scheduled_at',{ascending:S.tab==='avenir'});
 const up=['pending','confirmed'],l=(data||[]).filter(r=>(S.tab==='avenir')===up.includes(r.status));
 const g=(t,a)=>a.length?`<h3 style="margin-top:22px">${t}</h3>`+a.map(sCard).join(''):'';
 return `<h2>Séances</h2><p class="m">Toutes les séances ont lieu en ligne, sur Google Meet. Le lien est envoyé par email aux deux participants.</p>
<div class="chips">${[['avenir','À venir'],['passees','Passées et annulées']].map(([k,v])=>`<button class="chip ${S.tab===k?'on':''}" aria-pressed="${S.tab===k}" onclick="S.tab='${k}';render()">${v}</button>`).join('')}</div>${error?`<p class="note">${esc(error.message)}</p>`:''}
${g('Demandes reçues',l.filter(r=>r.tutor_id===P.id))+g('Mes demandes',l.filter(r=>r.student_id===P.id))||'<div class="empty"><p class="m">Aucune séance dans cette liste.</p></div>'}`};
async function setR(id,st){const{error}=await sb.from('appointments').update({status:st}).eq('id',id);if(error)return toast(error.message);toast(STL[st]+'.');render()}
async function confirmR(id){toast('Création du Google Meet…');const{error}=await sb.functions.invoke('create-meet',{body:{appointment_id:id}});
 if(error){let m=error.message;try{m=(await error.context.json()).error||m}catch(e){}return toast('Confirmation impossible : '+m)}
 toast('Séance confirmée, invitations envoyées par email.');render()}

// --- Profil, disponibilités et badges
R.badges=async()=>{if(!P)return gate();const ok=P.tutor_status==='approved',tu=P.level!=='licence';let rc=0,n=0,av=[];
 if(sb){const[a,b,c]=await Promise.all([ok?sb.from('resources').select('id',{count:'exact',head:true}).eq('author_id',P.id):null,sb.from('appointments').select('id',{count:'exact',head:true}).eq('status','done'),ok?sb.from('availabilities').select('*').eq('tutor_id',P.id):null]);rc=(a&&a.count)||0;n=b.count||0;av=(c&&c.data)||[]}
 const h=n/2,hs=Number.isInteger(h)?h:h.toFixed(1);
 const B=[['Première séance','1 séance',n>=1],['Régulier','5 séances',n>=5],['Assidu','10 séances',n>=10],['Solidaire','20 heures',h>=20],['Inspirant','50 heures',h>=50],['Ambassadeur','100 heures',h>=100]];
 if(tu)B.push(['Premier dépôt','1 ressource publiée',rc>=1],['Bibliothécaire','10 ressources publiées',rc>=10]);
 return `<div class="row" style="margin-bottom:6px"><div class="av" aria-hidden="true">${ini(P.full_name)}</div><div class="g1"><h2>${esc(P.full_name)}</h2><p class="m">${LV[P.level]}${P.tutor_status==='pending'?'':''}${ok?', tuteur':''}${P.tutor_status==='rejected'?', statut tuteur retiré':''}</p></div><button class="btn s o" onclick="logout()">Se déconnecter</button></div>
<div class="stats"><div><b>${n}</b>séances</div><div><b>${hs}</b>heures</div>${tu?`<div><b>${rc}</b>ressources publiées</div>`:`<div><b>${Math.max(1,Math.floor(n/4))}</b>niveau</div>`}</div>
${ok?`<h3 style="margin-top:22px">Mon profil de tuteur</h3><label for="pb">Présentation</label><textarea id="pb" rows="3" maxlength="500" placeholder="Qui es-tu, comment peux-tu aider ?">${esc(P.bio||'')}</textarea>
<label for="ps">Matières (séparées par des virgules)</label><input id="ps" maxlength="200" value="${esc(P.subjects||'')}" placeholder="Analyse, Algèbre, Probabilités"><button class="btn s" style="margin-top:12px" onclick="saveProf()">Enregistrer</button>
<h3 style="margin-top:26px">Mes disponibilités, chaque semaine</h3><p class="m">Les étudiants réservent des séances de 30 minutes dans ces plages horaires.</p>
${sortAv(av).map(a=>`<div class="card row" style="margin-top:10px"><span class="g1">${DAYS[a.weekday]}, de ${hm(a.start_time)} à ${hm(a.end_time)}</span><button class="btn s ko" onclick="delAv('${a.id}')">Retirer</button></div>`).join('')}
<div class="avf"><div><label for="aw">Jour</label><select id="aw">${WD.map(d=>`<option value="${d}">${DAYS[d]}</option>`).join('')}</select></div><div><label for="as">De</label><input id="as" type="time" step="1800" value="10:00"></div><div><label for="ae">À</label><input id="ae" type="time" step="1800" value="12:00"></div><button class="btn s" onclick="addAv()">Ajouter</button></div>`
 :tu?`<p class="note">Ton statut de tuteur n’est pas actif sur ce compte. Contacte l’équipe YNJ Campus.</p>`:''}
<h3 style="margin-top:26px">Badges</h3><div class="bdgs">${B.map(b=>`<div class="bd ${b[2]?'':'lock'}"><div class="a2">${ic('star')}</div><b>${b[0]}</b><p class="m">${b[1]}</p></div>`).join('')}</div>`};
async function saveProf(){const bio=$('#pb').value.trim()||null,subjects=$('#ps').value.trim()||null;
 const{error}=await sb.from('profiles').update({bio,subjects}).eq('id',P.id);if(error)return toast(error.message);P.bio=bio;P.subjects=subjects;toast('Profil enregistré.')}
async function addAv(){const s=$('#as').value,e=$('#ae').value;if(!s||!e||e<=s)return toast('L’heure de fin doit être après l’heure de début.');
 const{error}=await sb.from('availabilities').insert({weekday:+$('#aw').value,start_time:s,end_time:e});if(error)return toast(error.message);toast('Disponibilité ajoutée.');render()}
async function delAv(id){const{error}=await sb.from('availabilities').delete().eq('id',id);if(error)return toast(error.message);render()}

// --- Affichage
async function render(){const id=++rid,h=(location.hash||'#home').slice(1),f=R[h]?h:'home';
 if(P&&['home','login','signup'].includes(f)){location.replace('#resources');return}
 const html=await R[f]();if(id!==rid)return;
 const auth=!!P&&AUTHR.includes(f);document.body.classList.toggle('auth',auth);
 $('#rail').innerHTML=auth?rail(f):'';$('#tabs').innerHTML=auth?tabs(f):'';
 A.innerHTML=html;if(f!==lastF||forceTop)window.scrollTo(0,0);lastF=f;forceTop=false}
addEventListener('hashchange',render);
loadP().then(render);
