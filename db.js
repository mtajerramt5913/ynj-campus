// Couche base de données (Supabase) : comptes, rôles, filières, ressources.
const sb=(window.YNJ&&YNJ.SUPABASE_URL&&window.supabase)?supabase.createClient(YNJ.SUPABASE_URL,YNJ.SUPABASE_ANON_KEY):null;
let SP=[],P=null,RS={};
const KIND={cours:'Cours',exercice:'Exercices',examen:'Examens'};
const need=()=>sb?'':'<p class="card s0">Base de données non configurée : renseigne config.js (voir README).</p>';
async function loadSp(){if(sb&&!SP.length){const{data}=await sb.from('specialties').select('*').order('establishment').order('name');SP=data||[]}}
async function loadP(){P=null;if(!sb)return;const{data:{session}}=await sb.auth.getSession();if(!session)return;
 const{data}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();P=data;
 if(P){S.name=P.full_name;S.role=P.level==='licence'?'student':'tutor'}}
NAV.student.splice(1,0,['resources','📚','Ressources']);NAV.tutor.splice(1,0,['resources','📚','Ressources']);NONAV.push('login');

// --- Connexion / inscription
const _su=R.signup;
R.signup=async()=>{await loadSp();
 const o=SP.map(s=>`<option value="${s.id}">${esc(s.name)} – ${esc(s.establishment)}</option>`).join('');
 return need()+_su()
  .replace('Créer mon compte étudiant','Créer mon compte')
  .replace(/<select id="nv">[\s\S]*?<\/select>/,`<select id="nv"><option value="licence">Licence</option><option value="master" ${S.role==='tutor'?'selected':''}>Master</option><option value="doctorat">Doctorat</option></select>`)
  .replace(/<select id="fi">[\s\S]*?<\/select>/,`<select id="fi">${o}</select>`)
  .replace('requis pour rejoindre la plateforme.</p>','requis pour rejoindre la plateforme.<br>Master ou doctorat : ton statut est vérifié avant que tu puisses ajouter des ressources.<br><a href="#login">Déjà un compte ? Se connecter</a></p>')};
async function signup(){const e=$('#em').value.trim(),n=$('#nm').value.trim(),pw=$('#pw').value;
 if(!sb)return alert('Base de données non configurée (voir README).');
 if(!/^[^@\s]+@([a-z0-9-]+\.)*uca\.(ac\.)?ma$/i.test(e))return alert('Utilise ton email universitaire (@uca.ma).');
 if(!n||pw.length<8)return alert('Renseigne ton nom et un mot de passe de 8 caractères minimum.');
 const{data,error}=await sb.auth.signUp({email:e,password:pw,options:{data:{full_name:n,level:$('#nv').value,specialty_id:$('#fi').value}}});
 if(error)return alert('Inscription impossible : '+error.message);
 if(!data.session)return alert('Compte créé. Confirme ton email, puis connecte-toi.');
 await loadP();go('resources')}
R.login=()=>`${hd('Se connecter','home')}${need()}<label for="le">Email universitaire</label><input id="le" type="email" autocomplete="email"><label for="lp">Mot de passe</label><input id="lp" type="password" autocomplete="current-password"><button class="btn" onclick="login()">Se connecter</button>`;
async function login(){if(!sb)return alert('Base de données non configurée (voir README).');
 const{error}=await sb.auth.signInWithPassword({email:$('#le').value.trim(),password:$('#lp').value});
 if(error)return alert('Connexion impossible : '+error.message);await loadP();go('resources')}
async function logout(){await sb.auth.signOut();P=null;S.sp=null;go('home')}

// --- Ressources pédagogiques
const spHtml=q=>{q=q.toLowerCase();const f=SP.filter(s=>(s.name+s.establishment).toLowerCase().includes(q));
 const g=(t,c)=>{const l=f.filter(s=>s.cursus===c);return l.length?`<h3 style="margin:14px 0 8px">${t}</h3>`+l.map(s=>`<button class="card role" onclick="openSp('${s.id}')"><b>${esc(s.name)}</b>${s.id===P.specialty_id?' <span class="pill">Ma filière</span>':''}<div class="m">${esc(s.establishment)}</div></button>`).join(''):''};
 return g('Licences fondamentales','fondamentale')+g('Licences en éducation','education')||'<p class="m card">Aucune filière trouvée.</p>'};
const spList=()=>{$('#spl').innerHTML=spHtml($('#sq2').value)};
const openSp=id=>{S.sp=id;S.kind='cours';S.sem='';render()};
R.resources=async()=>{
 if(!sb)return hd('Ressources')+need();
 if(!P)return `${hd('Ressources')}<p class="card">Connecte-toi avec ton email universitaire pour accéder aux cours, exercices et examens.</p><button class="btn" onclick="go('login')">Se connecter</button><button class="btn o" onclick="go('role')">Créer un compte</button>`;
 await loadSp();
 const who=`<p class="m" style="margin-bottom:10px">${esc(P.full_name)} · ${P.level}${P.tutor_status==='pending'?' · statut tuteur en cours de vérification':''} · <a href="#" onclick="logout();return false">Se déconnecter</a></p>`;
 if(!S.sp)return `${hd('Ressources')}${who}<input id="sq2" type="text" placeholder="Chercher une filière ou une faculté…" oninput="spList()" aria-label="Recherche de filière"><div id="spl">${spHtml('')}</div>`;
 const s=SP.find(x=>x.id===S.sp);if(!s){S.sp=null;return R.resources()}
 S.kind=S.kind||'cours';
 let q=sb.from('resources').select('*,profiles(full_name)').eq('specialty_id',s.id).eq('kind',S.kind);if(S.sem)q=q.eq('semester',+S.sem);
 const{data,error}=await q.order('year',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false});
 RS={};(data||[]).forEach(r=>RS[r.id]=r);
 const can=P.tutor_status==='approved'&&P.level!=='licence';
 return `<div class="top"><button class="bk" onclick="S.sp=null;render()" aria-label="Retour">‹</button><h2>${esc(s.name)}</h2></div>
<p class="m" style="margin:-8px 0 12px">${esc(s.establishment)} · ${s.cursus==='education'?'Licence en éducation':'Licence fondamentale'}</p>
<div class="chips">${Object.entries(KIND).map(([k,v])=>`<button class="chip ${S.kind===k?'on':''}" onclick="S.kind='${k}';render()">${v}</button>`).join('')}</div>
<div class="chips">${['','1','2','3','4','5','6'].map(x=>`<button class="chip ${S.sem===x?'on':''}" onclick="S.sem='${x}';render()">${x?'S'+x:'Tous'}</button>`).join('')}</div>
${error?`<p class="card s2">Chargement impossible : ${esc(error.message)}</p>`:(data||[]).length?data.map(r=>`<div class="card"><b>${esc(r.title)}</b><div class="m">${r.semester?'S'+r.semester+' · ':''}${r.year?r.year+' · ':''}par ${esc(r.profiles?.full_name||'un tuteur')}</div>${r.description?`<p class="m" style="margin-top:4px">${esc(r.description)}</p>`:''}<div class="row" style="margin-top:8px"><button class="btn s g1" onclick="openRes('${r.id}')">Ouvrir</button>${r.author_id===P.id?`<button class="btn s ko" onclick="delRes('${r.id}')">Supprimer</button>`:''}</div></div>`).join(''):`<p class="m card">Aucune ressource pour l’instant.${can?' Ajoute la première !':' Les étudiants en master et doctorat les publient progressivement.'}</p>`}
${can?`<button class="btn" onclick="go('addres')">Ajouter une ressource</button>`:'<p class="m" style="text-align:center;margin-top:12px">Seuls les étudiants en master ou doctorat vérifiés peuvent ajouter des ressources.</p>'}`};
R.addres=()=>{if(!P||P.tutor_status!=='approved'||P.level==='licence'||!S.sp)return `${hd('Ajouter une ressource','resources')}<p class="card">Seuls les étudiants en master ou doctorat vérifiés peuvent ajouter des ressources.</p>`;
 return `${hd('Ajouter une ressource','resources')}
<label for="rk">Type</label><select id="rk">${Object.entries(KIND).map(([k,v])=>`<option value="${k}" ${S.kind===k?'selected':''}>${v}</option>`).join('')}</select>
<label for="rs">Semestre</label><select id="rs">${[1,2,3,4,5,6].map(i=>`<option value="${i}">S${i}</option>`).join('')}</select>
<label for="rt">Titre</label><input id="rt" type="text" maxlength="120" placeholder="Examen d’analyse 1 – session normale">
<label for="ry">Année (examens)</label><input id="ry" type="text" inputmode="numeric" placeholder="2025">
<label for="rd">Description (optionnel)</label><textarea id="rd" rows="3" maxlength="300"></textarea>
<label for="rf">Fichier (10 Mo max)</label><input id="rf" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*">
<label for="rl">…ou lien (Drive, etc.)</label><input id="rl" type="text" placeholder="https://…">
<button class="btn" onclick="addRes()">Publier</button>`};
async function addRes(){const t=$('#rt').value.trim(),l=$('#rl').value.trim(),f=$('#rf').files[0];
 if(t.length<3||(!f&&!/^https?:\/\//i.test(l)))return alert('Indique un titre et un fichier ou un lien http(s).');
 if(f&&f.size>10485760)return alert('Fichier trop lourd (10 Mo max).');
 let fp=null;
 if(f){fp=`${S.sp}/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g,'_')}`;const u=await sb.storage.from('resources').upload(fp,f);if(u.error)return alert('Envoi impossible : '+u.error.message)}
 const{error}=await sb.from('resources').insert({specialty_id:S.sp,kind:$('#rk').value,semester:+$('#rs').value,title:t,description:$('#rd').value.trim()||null,year:parseInt($('#ry').value)||null,url:fp?null:l,file_path:fp});
 if(error){if(fp)await sb.storage.from('resources').remove([fp]);return alert('Publication refusée : '+error.message)}
 S.kind=$('#rk').value;go('resources')}
async function openRes(id){const r=RS[id];if(r.url)return window.open(r.url,'_blank','noopener');
 const w=window.open('about:blank','_blank');const{data,error}=await sb.storage.from('resources').createSignedUrl(r.file_path,3600);
 if(error){if(w)w.close();return alert('Fichier introuvable : '+error.message)}
 if(w)w.location=data.signedUrl;else location.href=data.signedUrl}
async function delRes(id){if(!confirm('Supprimer cette ressource ?'))return;const r=RS[id];
 const{error}=await sb.from('resources').delete().eq('id',id);if(error)return alert(error.message);
 if(r.file_path)await sb.storage.from('resources').remove([r.file_path]);render()}

// --- Démarrage
let rid=0;
async function render(){clearInterval(tm);const id=++rid,h=(location.hash||'#home').slice(1),f=R[h]?h:'home',html=await R[f]();
 if(id!==rid)return;A.innerHTML=html+nav(f);window.scrollTo(0,0)}
addEventListener('hashchange',render);
loadP().then(render);
