// YNJ Campus : comptes, rôles, filières et ressources sur Supabase.
// Tuteurs, séances et badges de séances : données de démonstration (stockées dans le navigateur).
const $=s=>document.querySelector(s),A=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sb=(window.YNJ&&YNJ.SUPABASE_URL&&window.supabase)?supabase.createClient(YNJ.SUPABASE_URL,YNJ.SUPABASE_ANON_KEY):null;
let P=null,SP=[],RS={},rid=0,lastF='',forceTop=false,D={day:'Mardi',hr:'10:00'},tt;
let S={sp:null,kind:'cours',sem:'',q:'',tq:'',tf:'Toutes',tab:'avenir'};
const KIND={cours:'Cours',exercice:'Exercices',examen:'Examens'},LV={licence:'Licence',master:'Master',doctorat:'Doctorat'};
const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],HRS=['09:00','10:00','11:00','14:00','15:00','16:00'];
const STL={attente:'En attente',confirmee:'Confirmée',terminee:'Terminée',refusee:'Refusée',annulee:'Annulée'};
const T=[
{id:1,n:'Youssef El Amrani',r:'Doctorant en mathématiques',s:4.9,c:32,f:'Mathématiques',on:1,tags:['Analyse','Algèbre','Statistiques','Probabilités'],bio:'Passionné par la transmission du savoir, je t’aide à comprendre les concepts difficiles et à préparer tes examens.'},
{id:2,n:'Sara Ouhmadi',r:'Master en intelligence artificielle',s:4.8,c:18,f:'Informatique',on:1,tags:['Python','Machine learning','IA'],bio:'J’explique la programmation Python et les bases du machine learning avec des exemples concrets.'},
{id:3,n:'Omar Rachidi',r:'Doctorant en physique',s:4.7,c:25,f:'Physique',on:0,tags:['Mécanique','Thermodynamique'],bio:'Je t’aide à relier la théorie aux exercices de mécanique et de thermodynamique.'}];
const SEED=[
{id:1,tutor:'Sara Ouhmadi',stu:'moi',sub:'Python, boucles et fonctions',when:'Vendredi 14:00',mode:'En ligne',status:'confirmee'},
{id:2,tutor:'Omar Rachidi',stu:'moi',sub:'Mécanique, cinématique',when:'Lundi 09:00',mode:'Bibliothèque FSSM',status:'terminee'},
{id:3,tutor:'moi',stu:'Amina Benali',sub:'Analyse, séries numériques',when:'Mardi 10:00',mode:'En ligne',q:'Je n’arrive pas à déterminer la convergence d’une série numérique.',status:'attente'},
{id:4,tutor:'moi',stu:'Karim El Idrissi',sub:'Statistiques, test du khi-deux',when:'Mercredi 11:00',mode:'Bibliothèque FSSM',status:'attente'}];
let L={st:{n:0,h:0},reqs:SEED};
const lk=()=>'ynj2-'+(P?P.id:'x');
const saveL=()=>{try{localStorage.setItem(lk(),JSON.stringify(L))}catch(e){}};
const IC={book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M20 17v4H6.5a2.5 2.5 0 0 1 0-4"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.6.2 4.1 1.8 4.5 4.5"/>',
cal:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;
const STAR='<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#f5b820"><rect x="22" y="22" width="56" height="56"/><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/></g><circle cx="50" cy="50" r="13" fill="#2438c8"/></svg>';
const LOGO=STAR;
const NAVS=[['resources','book','Ressources'],['tutors','users','Tuteurs'],['sessions','cal','Séances'],['badges','star','Profil']];
const AUTHR=NAVS.map(n=>n[0]);

function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),3800)}
const need=()=>sb?'':'<p class="note">Base de données non configurée : renseigne config.js (voir README).</p>';
const pubTop=()=>`<header class="top"><a class="logo" href="#home">${LOGO}YNJ Campus</a><nav><a href="#login">Se connecter</a><a class="btn s" href="#signup">Créer un compte</a></nav></header>`;
const gate=()=>`${pubTop()}<div class="empty"><div class="arch">${STAR}</div><h2>Connecte-toi pour continuer</h2>${need()}<p class="m" style="margin:8px 0 18px">Un email universitaire @uca.ma est nécessaire.</p><a class="btn" href="#login">Se connecter</a></div>`;
const authPage=(h,b)=>`${pubTop()}<div class="ap"><div class="apl" aria-hidden="true">${STAR}<p>Yallah Na9raw Jmi3</p></div><div class="apf"><h2>${h}</h2>${need()}${b}</div></div>`;
const rail=f=>`<a class="logo" href="#resources">${LOGO}YNJ Campus</a><div style="height:18px"></div>${NAVS.map(n=>`<a href="#${n[0]}" class="${f===n[0]?'on':''}" ${f===n[0]?'aria-current="page"':''}>${ic(n[1])}${n[2]}</a>`).join('')}<div class="who"><b>${esc(P.full_name)}</b><br>${LV[P.level]}${P.tutor_status==='pending'?', statut tuteur en cours de vérification':''}</div><button class="lo" onclick="logout()">Se déconnecter</button>`;
const tabs=f=>NAVS.map(n=>`<a href="#${n[0]}" class="${f===n[0]?'on':''}" ${f===n[0]?'aria-current="page"':''}>${ic(n[1])}${n[2]}</a>`).join('');

async function loadSp(){if(sb&&!SP.length){const{data}=await sb.from('specialties').select('*').order('establishment').order('name');SP=data||[]}}
async function loadP(){P=null;if(!sb)return;const{data:{session}}=await sb.auth.getSession();if(!session)return;
 const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();P=data;
 try{const x=JSON.parse(localStorage.getItem(lk()));if(x&&x.reqs)L=x}catch(e){}}

const R={};
R.home=()=>`${pubTop()}<section class="hero"><div><h1>Yallah Na9raw Jmi3</h1><p class="ar" lang="ar" dir="rtl">يلا نقراو جميع</p>
<p class="lead">Les étudiants de master et de doctorat de l’Université Cadi Ayyad aident ceux de licence à débloquer ce qu’ils n’ont pas compris, et déposent cours, exercices et examens classés par filière.</p>
<div class="cta"><a class="btn y" href="#signup">Créer mon compte</a><a class="btn o" href="#login">J’ai déjà un compte</a></div></div><div class="arch">${STAR}</div></section>
<section class="trio"><div class="card"><h3>Un tuteur de ta filière</h3><p class="m">Pose ta question à quelqu’un qui a déjà réussi cette matière, en ligne ou à la bibliothèque.</p></div>
<div class="card"><h3>Une bibliothèque par filière</h3><p class="m">Cours, exercices et examens des années précédentes, triés par semestre, pour les licences fondamentales et les licences en éducation.</p></div>
<div class="card"><h3>Un engagement reconnu</h3><p class="m">Chaque séance et chaque ressource partagée fait gagner des badges aux tuteurs bénévoles.</p></div></section>
<h2 class="sec">Comment ça marche</h2><ol class="steps"><li><div><h3>Tu t’inscris</h3><p class="m">Avec ton email universitaire et ta filière.</p></div></li>
<li><div><h3>Tu trouves de l’aide</h3><p class="m">Consulte les ressources ou demande un rendez-vous à un tuteur.</p></div></li>
<li><div><h3>Tu avances, puis tu transmets</h3><p class="m">Une fois en master, tu deviens tuteur à ton tour.</p></div></li></ol>
<p class="m foot">Projet EduHack UCA, par Moussabe Tajerramt et Lamyaa Berry.</p>`;

R.login=()=>authPage('Se connecter',`<label for="le">Email universitaire</label><input id="le" type="email" autocomplete="email" placeholder="prenom.nom@uca.ma"><label for="lp">Mot de passe</label><input id="lp" type="password" autocomplete="current-password"><button class="btn w" onclick="login()">Se connecter</button><p style="margin-top:14px"><a href="#signup">Créer un compte</a></p>`);
R.signup=async()=>{await loadSp();const o=SP.map(s=>`<option value="${s.id}">${esc(s.name)}, ${esc(s.establishment)}</option>`).join('');
 return authPage('Créer mon compte',`<label for="em">Email universitaire</label><input id="em" type="email" placeholder="prenom.nom@uca.ma" autocomplete="email">
<label for="nm">Nom complet</label><input id="nm" autocomplete="name"><label for="nv">Niveau d’études</label><select id="nv"><option value="licence">Licence</option><option value="master">Master</option><option value="doctorat">Doctorat</option></select>
<label for="fi">Filière</label><select id="fi">${o}</select><label for="pw">Mot de passe (8 caractères minimum)</label><input id="pw" type="password" autocomplete="new-password">
<button class="btn w" onclick="signup()">Créer mon compte</button><p class="note">Un email @uca.ma est requis. En master ou doctorat, ton statut de tuteur est vérifié avant que tu puisses ajouter des ressources.</p><p><a href="#login">J’ai déjà un compte</a></p>`)};
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
${can?`<button class="btn y" onclick="openAdd()">Ajouter une ressource</button>`:'<p class="note">Seuls les étudiants en master ou doctorat vérifiés peuvent ajouter des ressources.</p>'}`}
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

// --- Tuteurs et séances (démonstration)
const tList=()=>{const q=S.tq.toLowerCase(),l=T.filter(t=>(S.tf==='Toutes'||t.f===S.tf)&&(t.n+t.f+t.tags.join(' ')).toLowerCase().includes(q));
 return l.length?l.map(t=>`<button class="card tc" onclick="openT(${t.id})"><div class="row"><div class="av" aria-hidden="true">${esc(t.n.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div><h3>${esc(t.n)}</h3><p class="m">${t.r}</p></div></div><p style="margin-top:10px"><b>★ ${t.s}</b> <span class="m">(${t.c} avis)</span></p><div>${t.tags.map(x=>`<span class="tag">${x}</span>`).join('')}</div><p class="m" style="margin-top:8px">${t.on?'En ligne':'Hors ligne'}, bibliothèque FSSM</p></button>`).join(''):'<p class="note">Aucun tuteur trouvé.</p>'};
const tFilter=()=>{S.tq=$('#tq').value;$('#tl').innerHTML=tList()};
R.tutors=()=>{if(!P)return gate();
 return `<h2>Tuteurs</h2><p class="note">Section de démonstration : les tuteurs, rendez-vous et séances sont simulés dans ce navigateur.</p>
<input id="tq" type="search" placeholder="Chercher une matière, un chapitre, un nom" value="${esc(S.tq)}" oninput="tFilter()" aria-label="Chercher un tuteur">
<div class="chips">${['Toutes',...new Set(T.map(t=>t.f))].map(f=>`<button class="chip ${S.tf===f?'on':''}" aria-pressed="${S.tf===f}" onclick="S.tf='${f}';render()">${f}</button>`).join('')}</div><div class="grid" id="tl">${tList()}</div>`};
function pick(el){const g=el.dataset.g;D[g]=el.dataset.v;el.parentNode.querySelectorAll('.chip').forEach(b=>{const on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}
function openT(id){const t=T.find(x=>x.id===id);
 dlg(`<div class="row"><div class="av">${esc(t.n.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div><h2 style="font-size:1.4rem">${esc(t.n)}</h2><p class="m">${t.r}, ★ ${t.s}</p></div></div>
<p style="margin:14px 0">${t.bio}</p><h3>Jour</h3><div class="chips">${DAYS.map(d=>`<button class="chip ${D.day===d?'on':''}" aria-pressed="${D.day===d}" data-g="day" data-v="${d}" onclick="pick(this)">${d.slice(0,3)}</button>`).join('')}</div>
<h3>Heure (30 minutes)</h3><div class="chips">${HRS.map(h=>`<button class="chip ${D.hr===h?'on':''}" aria-pressed="${D.hr===h}" data-g="hr" data-v="${h}" onclick="pick(this)">${h}</button>`).join('')}</div>
<label class="rd"><input type="radio" name="m" value="En ligne" checked>En ligne (visioconférence)</label><label class="rd"><input type="radio" name="m" value="Bibliothèque FSSM">En présentiel, bibliothèque FSSM</label>
<label for="ch">Matière ou chapitre</label><input id="ch" placeholder="Analyse, séries numériques"><label for="qq">Ma question principale</label><textarea id="qq" rows="3" maxlength="300" placeholder="Explique ce que tu n’as pas compris"></textarea>
<button class="btn w" onclick="send(${t.id})">Envoyer ma demande</button>`)}
function send(id){const q=$('#qq').value.trim();if(q.length<10)return toast('Décris ta question en 10 caractères minimum.');
 const t=T.find(x=>x.id===id);L.reqs.unshift({id:Date.now(),tutor:t.n,stu:'moi',sub:$('#ch').value.trim()||t.f,when:D.day+' '+D.hr,mode:document.querySelector('[name=m]:checked').value,q,status:'attente'});
 saveL();S.tab='avenir';$('#dlg').close();toast('Demande envoyée à '+t.n+'.');go('sessions')}
const sCard=(r,tu)=>`<article class="card" style="margin-top:12px"><div class="row"><div class="av" aria-hidden="true">${esc((tu?r.stu:r.tutor).split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div class="g1"><h3>${esc(tu?r.stu:r.tutor)}</h3><p class="m">${esc(r.sub)}</p><p class="m meta"><span>${r.when}</span><span>${r.mode}</span></p></div><span class="pill st-${r.status}">${STL[r.status]}</span></div>
${r.q?`<p class="m" style="margin-top:10px">« ${esc(r.q)} »</p>`:''}<div class="row" style="margin-top:12px;flex-wrap:wrap">
${tu&&r.status==='attente'?`<button class="btn s" onclick="setR(${r.id},'confirmee')">Confirmer</button><button class="btn s ko" onclick="setR(${r.id},'refusee')">Refuser</button>`:''}
${r.status==='confirmee'?`${r.mode==='En ligne'?`<a class="btn s" href="https://meet.jit.si/ynj-campus-${r.id}" target="_blank" rel="noopener">Rejoindre la visio</a>`:''}<button class="btn s o" onclick="setR(${r.id},'terminee')">Marquer comme terminée</button>`:''}
${!tu&&['attente','confirmee'].includes(r.status)?`<button class="btn s ko" onclick="setR(${r.id},'annulee')">Annuler</button>`:''}</div></article>`;
function setR(id,st){const r=L.reqs.find(x=>x.id===id);r.status=st;if(st==='terminee'){L.st.n++;L.st.h+=.5}saveL();toast(st==='terminee'?'Séance terminée, merci !':STL[st]+'.');render()}
R.sessions=()=>{if(!P)return gate();const tu=P.level!=='licence',up=['attente','confirmee'];
 const l=L.reqs.filter(r=>(tu?r.tutor==='moi':r.stu==='moi')&&(S.tab==='avenir')===up.includes(r.status));
 return `<h2>${tu?'Demandes et séances':'Mes séances'}</h2><div class="chips">${[['avenir','À venir'],['passees','Passées et annulées']].map(([k,v])=>`<button class="chip ${S.tab===k?'on':''}" aria-pressed="${S.tab===k}" onclick="S.tab='${k}';render()">${v}</button>`).join('')}</div>
${l.length?l.map(r=>sCard(r,tu)).join(''):'<div class="empty"><p class="m">Aucune séance dans cette liste.</p></div>'}`};

// --- Profil et badges
R.badges=async()=>{if(!P)return gate();const tu=P.level!=='licence',{n,h}=L.st;let rc=0;
 if(sb&&tu){const{count}=await sb.from('resources').select('id',{count:'exact',head:true}).eq('author_id',P.id);rc=count||0}
 const B=[['Première séance','1 séance',n>=1],['Régulier','5 séances',n>=5],['Assidu','10 séances',n>=10],['Solidaire','20 heures',h>=20],['Inspirant','50 heures',h>=50],['Ambassadeur','100 heures',h>=100]];
 if(tu)B.push(['Premier dépôt','1 ressource publiée',rc>=1],['Bibliothécaire','10 ressources publiées',rc>=10]);
 return `<div class="row" style="margin-bottom:6px"><div class="av" aria-hidden="true">${esc(P.full_name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div class="g1"><h2>${esc(P.full_name)}</h2><p class="m">${LV[P.level]}${P.tutor_status==='pending'?', statut tuteur en cours de vérification':''}${P.tutor_status==='approved'?', tuteur vérifié':''}</p></div><button class="btn s o" onclick="logout()">Se déconnecter</button></div>
<div class="stats"><div><b>${n}</b>séances</div><div><b>${h}</b>heures</div>${tu?`<div><b>${rc}</b>ressources publiées</div>`:`<div><b>${Math.max(1,Math.floor(n/4))}</b>niveau</div>`}</div>
<h3 style="margin-top:22px">Badges</h3><div class="bdgs">${B.map(b=>`<div class="bd ${b[2]?'':'lock'}"><div class="a2">${ic('star')}</div><b>${b[0]}</b><p class="m">${b[1]}</p></div>`).join('')}</div>`};

// --- Affichage
async function render(){const id=++rid,h=(location.hash||'#home').slice(1),f=R[h]?h:'home';
 if(P&&['home','login','signup'].includes(f)){location.replace('#resources');return}
 const html=await R[f]();if(id!==rid)return;
 const auth=!!P&&AUTHR.includes(f);document.body.classList.toggle('auth',auth);
 $('#rail').innerHTML=auth?rail(f):'';$('#tabs').innerHTML=auth?tabs(f):'';
 A.innerHTML=html;if(f!==lastF||forceTop)window.scrollTo(0,0);lastF=f;forceTop=false}
addEventListener('hashchange',render);
loadP().then(render);
