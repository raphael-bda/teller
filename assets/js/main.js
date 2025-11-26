// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBM5ZzM3zBVpIPj1Ln35F65jw7i_GZdb_I",
  authDomain: "odin-system-47a30.firebaseapp.com",
  projectId: "odin-system-47a30",
  storageBucket: "odin-system-47a30.firebasestorage.app",
  messagingSenderId: "1085403407316",
  appId: "1:1085403407316:web:45d7ce483ecb81a7faec41",
  measurementId: "G-RYPN4Q1DE9"
};

// --- INICIALIZAÇÃO ---
let auth, provider;
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
    } catch (e) { console.error("Erro Firebase:", e); }
}

document.addEventListener("DOMContentLoaded", function() {
    setFavicon();
    loadHeader(); 
    loadFooter();
    initMobileMenu();
    initCommandPalette();
    initNotifications();
    initScratchpad();
    initLockScreen();
    initVoiceControl();
    
    if (auth) initAuthListener();
    else renderLoginButton();

    // Interceptador de Toast (Sons + Log com Nome)
    setTimeout(() => {
        if (window.showToast) {
            const originalToast = window.showToast;
            window.showToast = function(msg, type) {
                originalToast(msg, type);
                addLog(msg, type); // Aqui ele salva quem fez
                if(localStorage.getItem('ODIN_MUTE') !== 'true') playSound(type === 'success' ? 'success' : 'click');
            };
        }
    }, 500);
});

const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages'; 

// --- HUB DE LINKS (VOZ) ---
const HUB_LINKS = {
    'sos': 'https://docs.google.com/forms/d/e/1FAIpQLSeFcVAOhDxNDj70FAaJC2-e2pfpnaUdtvtrhot5mW3qKvGUdA/viewform?usp=header',
    'skills': 'https://accounts.g4educacao.com/sso/initialize-auth?redirectUrl=https%3A%2F%2Fg4educacao.com',
    'crm': 'https://app.taime.pro/',
    'irc': 'https://evolucaoeducacional.com.br/',
    'planilha': 'https://docs.google.com/spreadsheets/d/1r3ev1OU0iTljCf3NIveW7E9WZvBwlkZCXYVnwO-2wZQ/edit?gid=890574461#gid=890574461',
    'contratos': 'https://contratos-comercial-valores.netlify.app/',
    'tabela': 'https://tabelacomercialiefe.netlify.app/'
};

// --- AUTH LISTENER ---
function initAuthListener() {
    auth.onAuthStateChanged((user) => {
        const userArea = document.getElementById('user-area');
        const mobileUserArea = document.getElementById('mobile-user-area');
        if (user) {
            const displayName = user.displayName || "Operador";
            const photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
            
            // Salva dados para uso nos Logs
            localStorage.setItem('ODIN_USER_NAME', displayName);
            localStorage.setItem('ODIN_USER_PHOTO', photoURL);

            const html = `
                <div class="text-right hidden md:block cursor-pointer" onclick="openConfigModal()">
                    <p class="text-white text-xs font-bold hover:text-neon-cyan transition">${displayName}</p>
                    <p class="text-gray-500 text-[10px] font-mono tracking-wider text-neon-green">ONLINE</p>
                </div>
                <div class="relative group cursor-pointer" onclick="openConfigModal()">
                    <img src="${photoURL}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner hover:border-neon-cyan transition-all object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
                </div>`;
            
            if(userArea) userArea.innerHTML = html;
            if(mobileUserArea) mobileUserArea.innerHTML = html.replace('hidden md:block', 'block');
        } else {
            renderLoginButton();
            localStorage.setItem('ODIN_USER_NAME', 'Visitante'); // Fallback
        }
    });
}

function renderLoginButton() {
    const btn = `<button onclick="window.loginODIN()" class="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.2)]"><i class="fab fa-google"></i> Acessar</button>`;
    const ua = document.getElementById('user-area');
    const mua = document.getElementById('mobile-user-area');
    if(ua) ua.innerHTML = btn;
    if(mua) mua.innerHTML = btn;
}

window.loginODIN = () => { if(auth) auth.signInWithPopup(provider).catch(e => alert(e.message)); };
window.logoutODIN = () => { if(confirm("Sair?")) auth.signOut().then(() => location.reload()); };

// --- NOTIFICATIONS (ATUALIZADO COM NOME DE USUÁRIO) ---
const LS_LOGS = 'ODIN_SYSTEM_LOGS';
function initNotifications() {} 

function addLog(msg, type) {
    const logs = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
    // Pega o nome do usuário logado no momento da ação
    const user = localStorage.getItem('ODIN_USER_NAME') || "Sistema";
    
    logs.unshift({
        id: Date.now(),
        user: user, // Salva quem fez
        msg: msg,
        type: type,
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        read: false
    });
    
    if(logs.length > 20) logs.pop();
    localStorage.setItem(LS_LOGS, JSON.stringify(logs));
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const logs = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
    const unread = logs.filter(l => !l.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) { 
        if (unread > 0) { badge.classList.remove('hidden'); badge.innerText = unread > 9 ? '9+' : unread; } 
        else { badge.classList.add('hidden'); } 
    }
}

window.toggleNotifications = () => {
    const d = document.getElementById('notif-dropdown');
    const l = document.getElementById('notif-list');
    d.classList.toggle('hidden');
    if (!d.classList.contains('hidden')) {
        const logs = JSON.parse(localStorage.getItem(LS_LOGS) || '[]');
        l.innerHTML = logs.length ? '' : '<div class="p-4 text-center text-xs text-gray-500">Vazio.</div>';
        
        logs.forEach(g => {
            const icon = g.type === 'success' ? 'fa-check-circle text-neon-green' : (g.type === 'error' ? 'fa-exclamation-circle text-neon-red' : 'fa-info-circle text-neon-cyan');
            // Layout atualizado para mostrar o NOME
            l.innerHTML += `
            <div class="p-3 border-b border-dark-700 hover:bg-dark-800 flex gap-3 items-start">
                <i class="fas ${icon} mt-1 text-xs"></i>
                <div>
                    <div class="flex justify-between items-center w-full gap-2">
                        <p class="text-[10px] font-bold text-neon-cyan truncate max-w-[120px]">${g.user || 'Sistema'}</p>
                        <p class="text-[8px] text-gray-600 font-mono">${g.time}</p>
                    </div>
                    <p class="text-xs text-gray-300 leading-tight mt-0.5">${g.msg}</p>
                </div>
            </div>`; 
        });
        
        localStorage.setItem(LS_LOGS, JSON.stringify(logs.map(x=>({...x,read:true}))));
        updateNotificationBadge();
    }
};

// --- ODIN VOICE ---
function initVoiceControl() {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false; recognition.lang = 'pt-BR'; recognition.interimResults = false;
    recognition.onresult = (e) => { executeVoiceCommand(e.results[0][0].transcript.toLowerCase()); document.getElementById('mic-icon')?.classList.replace('text-red-500','text-gray-400'); };
    window.toggleVoice = () => { 
        const icon = document.getElementById('mic-icon');
        if(icon.classList.contains('text-red-500')) recognition.stop(); 
        else { playSound('click'); recognition.start(); icon.classList.replace('text-gray-400','text-red-500'); }
    };
}
function executeVoiceCommand(cmd) {
    const feedback = document.createElement('div');
    feedback.className="fixed top-24 left-1/2 -translate-x-1/2 bg-black/80 border border-neon-cyan text-white px-6 py-2 rounded-full z-[100] animate-[fadeIn_0.3s] flex items-center gap-2";
    feedback.innerHTML=`<i class="fas fa-microphone"></i> "${cmd}"`;
    document.body.appendChild(feedback); setTimeout(()=>feedback.remove(),2000);

    if(cmd.startsWith('abrir')) { const t=cmd.replace('abrir','').trim(); for(let k in HUB_LINKS) if(t.includes(k)) { window.open(HUB_LINKS[k],'_blank'); window.speak(`Abrindo ${k}`); return; } }
    if(cmd.includes('novo lead')) { const n=cmd.replace('novo lead','').trim(); if(n){ localStorage.setItem('ODIN_VOICE_PARAMS',JSON.stringify({type:'add_lead',name:n})); window.speak('Cadastrando'); window.location.href=pagesPath+'/comercial.html'; return; } }
    
    // Navegação
    const routes = {'início':'index','secretaria':'secretaria','financeiro':'financeiro','comercial':'comercial','pedagógico':'pedagogico','ferramentas':'ferramentas'};
    for(let r in routes) if(cmd.includes(r)) window.location.href = (r==='início'?basePath:pagesPath)+`/${routes[r]}.html`;
    if(cmd.includes('bloquear')) lockScreen();
}

window.speak = (text) => { if(localStorage.getItem('ODIN_MUTE')==='true') return; const u=new SpeechSynthesisUtterance(text); u.lang='pt-BR'; window.speechSynthesis.speak(u); };

// --- FEATURES (Audio, Lock, Scratchpad) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(localStorage.getItem('ODIN_MUTE')==='true'||audioCtx.state==='suspended') { audioCtx.resume(); return; }
    const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.connect(g); g.connect(audioCtx.destination);
    const t=audioCtx.currentTime;
    if(type==='click'){o.frequency.setValueAtTime(800,t);g.gain.setValueAtTime(0.01,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);o.start(t);o.stop(t+0.05);}
    if(type==='success'){o.type='triangle';o.frequency.setValueAtTime(600,t);o.frequency.linearRampToValueAtTime(1200,t+0.1);g.gain.setValueAtTime(0.02,t);g.gain.linearRampToValueAtTime(0,t+0.3);o.start(t);o.stop(t+0.3);}
}
function toggleMute() { const m=localStorage.getItem('ODIN_MUTE')==='true'; localStorage.setItem('ODIN_MUTE',!m); const b=document.getElementById('btn-mute'); if(b) { b.querySelector('span').innerText=!m?'Som: OFF':'Som: ON'; b.querySelector('i').className=!m?'fas fa-volume-mute text-red-500':'fas fa-volume-up text-neon-green'; } }

function initLockScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="odin-lockscreen" class="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center transition-transform duration-500 translate-y-[-100%]"><div class="text-center"><img src="${basePath}/assets/img/odin-logo.png" class="w-24 h-24 rounded-full border-4 border-neon-cyan animate-pulse mb-6"><h2 class="text-3xl font-black text-white tracking-widest mb-2">LOCKED</h2><button onclick="unlockScreen()" class="bg-dark-800 border border-neon-cyan text-neon-cyan px-8 py-3 rounded-full font-bold tracking-widest hover:bg-neon-cyan hover:text-black transition"><i class="fas fa-fingerprint"></i> DESBLOQUEAR</button></div></div>`); document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='l'){e.preventDefault();lockScreen();}}); }
window.lockScreen=()=>{document.getElementById('odin-lockscreen').classList.remove('translate-y-[-100%]');playSound('click');}; window.unlockScreen=()=>{document.getElementById('odin-lockscreen').classList.add('translate-y-[-100%]');playSound('success');};

function initScratchpad() {
    const s=localStorage.getItem('ODIN_SCRATCHPAD_CONTENT')||'', o=localStorage.getItem('ODIN_SCRATCHPAD_OPEN')==='true';
    document.body.insertAdjacentHTML('beforeend', `<div id="scratchpad" class="fixed bottom-20 right-6 w-80 bg-dark-900 border border-dark-600 rounded-xl shadow-2xl z-[90] transition-transform duration-300 transform ${o?'translate-y-0':'translate-y-[150%]'}"><div class="flex justify-between items-center p-3 bg-dark-800 border-b border-dark-700 rounded-t-xl cursor-pointer" onclick="toggleScratchpad()"><span class="text-xs font-bold text-neon-orange"><i class="fas fa-sticky-note mr-2"></i> Notas</span><div class="flex gap-3"><i class="fas fa-trash text-gray-500 hover:text-red-500 text-xs" onclick="clearScratchpad(event)"></i><i class="fas fa-chevron-down text-gray-500 text-xs"></i></div></div><textarea id="scratchpad-area" class="w-full h-48 bg-dark-900 text-gray-300 p-3 text-xs font-mono outline-none resize-none">${s}</textarea></div><button id="scratchpad-trigger" onclick="toggleScratchpad()" class="fixed bottom-6 right-6 w-12 h-12 bg-neon-orange text-dark-900 rounded-full shadow-lg flex items-center justify-center z-30 hover:scale-110 transition ${o?'hidden':'flex'}"><i class="fas fa-pen"></i></button>`);
    document.getElementById('scratchpad-area').addEventListener('input', (e)=>localStorage.setItem('ODIN_SCRATCHPAD_CONTENT',e.target.value));
}
window.toggleScratchpad=()=>{const p=document.getElementById('scratchpad'),b=document.getElementById('scratchpad-trigger'),h=p.classList.contains('translate-y-[150%]'); if(h){p.classList.remove('translate-y-[150%]');b.classList.add('hidden');localStorage.setItem('ODIN_SCRATCHPAD_OPEN','true');}else{p.classList.add('translate-y-[150%]');b.classList.remove('hidden');localStorage.setItem('ODIN_SCRATCHPAD_OPEN','false');}};
window.clearScratchpad=(e)=>{e.stopPropagation();if(confirm("Limpar?")){document.getElementById('scratchpad-area').value='';localStorage.setItem('ODIN_SCRATCHPAD_CONTENT','');}};

// --- UI GERAL ---
function loadHeader() {
    const path = window.location.pathname; const page = path.split("/").pop() || 'index.html';
    const isActive = (n) => page.includes(n) ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    const isToolActive = page.includes('ferr_') ? 'text-neon-orange border-white/10' : 'text-gray-400 border-transparent';

    const headerHTML = `
    <div id="config-modal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4 animate-[fadeIn_0.2s]"><div class="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-neon-cyan/10"><button onclick="closeConfigModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button><div class="text-center mb-6"><img id="modal-user-photo" src="" class="w-20 h-20 rounded-full mx-auto border-2 border-neon-cyan mb-3 object-cover"><h2 id="modal-user-name" class="text-xl font-bold text-white">User</h2><span class="text-xs font-mono bg-dark-900 px-3 py-1 rounded border border-dark-600 text-neon-cyan mt-2 inline-block">OPERADOR</span></div><div class="space-y-4"><div class="bg-dark-900 p-4 rounded border border-dark-600"><h3 class="text-xs uppercase font-bold text-gray-500 mb-3">Sistema</h3><div class="grid grid-cols-2 gap-3"><button id="btn-mute" onclick="toggleMute()" class="p-3 bg-dark-800 hover:border-gray-500 border border-dark-700 rounded flex flex-col items-center justify-center transition group"><i class="fas fa-volume-up text-lg mb-1 text-neon-green"></i><span class="text-[10px] font-bold text-neon-green">Som: ON</span></button><button onclick="lockScreen()" class="p-3 bg-dark-800 hover:border-neon-cyan border border-dark-700 rounded flex flex-col items-center justify-center transition group"><i class="fas fa-lock text-lg text-neon-cyan mb-1"></i><span class="text-[10px] font-bold text-gray-300 group-hover:text-white">Bloquear</span></button></div><div class="mt-3 pt-3 border-t border-dark-700 flex justify-between"><button onclick="backupData()" class="text-xs text-gray-400 hover:text-white flex items-center gap-2"><i class="fas fa-download"></i> Backup</button><label class="text-xs text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer"><i class="fas fa-upload"></i> Restaurar<input type="file" class="hidden" accept=".json" onchange="restoreData(this)"></label></div></div><button onclick="window.logoutODIN()" class="w-full bg-dark-700 hover:bg-red-600 text-white py-3 rounded font-bold">Sair</button></div></div></div>
    <header class="fixed w-full top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700 h-20 flex items-center transition-all z-50"><nav class="container mx-auto px-4 flex justify-between items-center h-full"><a href="${basePath}/index.html" class="flex items-center group gap-3"><div class="relative w-10 h-10 flex-none rounded-full overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all ring-2 ring-transparent group-hover:ring-neon-cyan"><img src="${basePath}/assets/img/odin-logo.png" class="w-full h-full object-cover"></div><div class="flex flex-col"><span class="text-white font-black tracking-widest text-xl leading-none group-hover:text-neon-cyan transition">ODIN</span></div></a><div class="hidden xl:flex items-center bg-dark-800/50 border border-dark-600 rounded-full p-1 shadow-2xl"><a href="${pagesPath}/secretaria.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('secretaria')}">Secretaria</a><div class="w-px h-3 bg-dark-600 mx-1"></div><a href="${pagesPath}/financeiro.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('financeiro')}">Financeiro</a><div class="w-px h-3 bg-dark-600 mx-1"></div><a href="${pagesPath}/pedagogico.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('pedagogico')}">Pedagógico</a><div class="w-px h-3 bg-dark-600 mx-1"></div><a href="${pagesPath}/comercial.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('comercial')}">Comercial</a><div class="w-px h-3 bg-dark-600 mx-1"></div><div class="relative group"><button class="px-5 py-2 rounded-full text-xs font-bold transition border ${isToolActive} hover:text-neon-orange flex items-center"><i class="fas fa-tools mr-2"></i> Ferramentas</button><div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-dark-800/95 backdrop-blur-xl border border-dark-600 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"><div class="py-1"><a href="${pagesPath}/ferr_conversao.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 border-b border-dark-700/50">Conversão</a><a href="${pagesPath}/ferr_procedimentos.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 border-b border-dark-700/50">Procedimentos</a><a href="${pagesPath}/ferr_scripts.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 border-b border-dark-700/50">Scripts</a><a href="${pagesPath}/ferr_suporte.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 border-b border-dark-700/50">Suporte</a><a href="${pagesPath}/ferr_agenda.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900">Agenda</a></div></div></div></div><div class="hidden lg:flex items-center gap-4"><button onclick="toggleVoice()" class="w-8 h-8 flex items-center justify-center rounded bg-dark-800 text-gray-400 hover:text-white border border-dark-600 transition"><i id="mic-icon" class="fas fa-microphone text-xs"></i></button><button onclick="toggleCommandPalette()" class="w-8 h-8 flex items-center justify-center rounded bg-dark-800 text-gray-400 hover:text-white border border-dark-600 transition" title="Comandos (Ctrl+K)"><i class="fas fa-terminal text-xs"></i></button><div class="relative"><button onclick="toggleNotifications()" class="relative text-gray-400 hover:text-white transition"><i class="fas fa-bell text-xl"></i><span id="notif-badge" class="absolute -top-1 -right-1 w-4 h-4 bg-neon-red rounded-full text-[8px] text-white flex items-center justify-center font-bold hidden">0</span></button><div id="notif-dropdown" class="absolute top-10 right-0 w-72 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl hidden z-50 overflow-hidden"><div class="p-3 border-b border-dark-700 text-xs font-bold text-white bg-dark-900">Notificações</div><div id="notif-list" class="max-h-64 overflow-y-auto"></div></div></div><div class="h-8 w-px bg-dark-700"></div><div id="user-area" class="flex items-center gap-3 min-w-[120px] justify-end"><div class="w-20 h-3 bg-dark-700 rounded animate-pulse"></div></div></div><button id="mobile-menu-btn" class="xl:hidden text-white text-2xl p-2 z-50"><i class="fas fa-bars"></i></button></nav><div id="mobile-menu" class="fixed inset-0 bg-dark-900 z-40 transform translate-x-full transition-transform duration-300 flex flex-col overflow-y-auto pt-24 px-6"><button id="close-mobile-btn" class="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl"><i class="fas fa-times"></i></button><div id="mobile-user-area" class="w-full mb-6"></div><nav class="flex flex-col gap-2 text-sm font-bold text-gray-300"><a href="${basePath}/index.html" class="mobile-link flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">Visão Geral</a><a href="${pagesPath}/secretaria.html" class="mobile-link flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">Secretaria</a><a href="${pagesPath}/financeiro.html" class="mobile-link flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">Financeiro</a><a href="${pagesPath}/pedagogico.html" class="mobile-link flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">Pedagógico</a><a href="${pagesPath}/comercial.html" class="mobile-link flex items-center gap-4 p-4 bg-dark-800 rounded-xl border border-dark-700">Comercial</a><div class="pt-4 border-t border-dark-700 text-xs text-gray-500 uppercase font-bold mb-2">Ferramentas</div><a href="${pagesPath}/ferr_conversao.html" class="block p-3 text-gray-300 hover:text-neon-orange">Conversão</a><a href="${pagesPath}/ferr_procedimentos.html" class="block p-3 text-gray-300 hover:text-neon-orange">Procedimentos</a><a href="${pagesPath}/ferr_scripts.html" class="block p-3 text-gray-300 hover:text-neon-orange">Scripts</a><a href="${pagesPath}/ferr_suporte.html" class="block p-3 text-gray-300 hover:text-neon-orange">Suporte</a><a href="${pagesPath}/ferr_agenda.html" class="block p-3 text-gray-300 hover:text-neon-orange">Agenda</a></nav></div></header>`;
    
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    setTimeout(updateNotificationBadge, 500);
}

function loadFooter() { document.getElementById('footer-placeholder').innerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="container mx-auto px-6 text-center text-xs text-gray-600 font-mono">ODIN SYSTEM v19.0 | AUDIT & SENSORY</div></footer>`; }
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn'), closeBtn = document.getElementById('close-mobile-btn'), menu = document.getElementById('mobile-menu');
    if(btn && menu) { btn.addEventListener('click', () => { menu.classList.toggle('translate-x-full'); btn.querySelector('i').className = menu.classList.contains('translate-x-full') ? 'fas fa-bars' : 'fas fa-times'; }); }
    if(closeBtn) closeBtn.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('translate-x-full'));
}

// --- BACKUP & RESTORE ---
window.openConfigModal = () => { document.getElementById('modal-user-name').innerText = localStorage.getItem('ODIN_USER_NAME') || "Operador"; document.getElementById('modal-user-photo').src = localStorage.getItem('ODIN_USER_PHOTO') || `${basePath}/assets/img/odin-logo.png`; document.getElementById('config-modal').classList.remove('hidden'); }
window.closeConfigModal = () => document.getElementById('config-modal').classList.add('hidden');
window.backupData = () => {
    const data = { crm: localStorage.getItem('ODIN_CRM_LEADS'), secretaria: localStorage.getItem('ODIN_SECRETARIA_KANBAN'), financeiro: localStorage.getItem('ODIN_DEBTS'), pedagogico: localStorage.getItem('ODIN_PEDAGOGICO_AGENDA'), scripts: localStorage.getItem('ODIN_USER_SCRIPTS'), logs: localStorage.getItem(LS_LOGS), scratch: localStorage.getItem('ODIN_SCRATCHPAD_CONTENT') };
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ODIN_BACKUP_${new Date().toISOString().split('T')[0]}.json`; a.click();
};
window.restoreData = (input) => {
    const file = input.files[0]; if(!file) return;
    if (!confirm("ATENÇÃO: Isso substituirá todos os dados atuais. Continuar?")) { input.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if(data.crm) localStorage.setItem('ODIN_CRM_LEADS', data.crm);
            if(data.secretaria) localStorage.setItem('ODIN_SECRETARIA_KANBAN', data.secretaria);
            if(data.financeiro) localStorage.setItem('ODIN_DEBTS', data.financeiro);
            if(data.pedagogico) localStorage.setItem('ODIN_PEDAGOGICO_AGENDA', data.pedagogico);
            if(data.scripts) localStorage.setItem('ODIN_USER_SCRIPTS', data.scripts);
            if(data.logs) localStorage.setItem(LS_LOGS, data.logs);
            if(data.scratch) localStorage.setItem('ODIN_SCRATCHPAD_CONTENT', data.scratch);
            alert("Restaurado! Recarregando..."); location.reload();
        } catch (err) { console.error(err); alert("Backup inválido."); }
    };
    reader.readAsText(file);
};

// --- COMMAND PALETTE ---
function initCommandPalette() {
    const html = `<div id="odin-command" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] hidden flex items-start justify-center pt-32 animate-[fadeIn_0.1s]"><div class="bg-dark-900 border border-dark-600 rounded-xl w-full max-w-2xl shadow-2xl shadow-neon-cyan/20 overflow-hidden relative"><div class="p-4 border-b border-dark-700 flex items-center gap-3"><i class="fas fa-search text-neon-cyan text-xl"></i><input id="cmd-input" type="text" placeholder="Digite um comando..." class="w-full bg-transparent text-white text-lg outline-none placeholder-gray-600 font-mono" autocomplete="off"><span class="text-[10px] bg-dark-800 text-gray-500 px-2 py-1 rounded border border-dark-700">ESC</span></div><div id="cmd-results" class="max-h-[400px] overflow-y-auto p-2"></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleCommandPalette(); } if (e.key === 'Escape') document.getElementById('odin-command').classList.add('hidden'); });
    document.getElementById('cmd-input').addEventListener('input', (e) => renderCommands(e.target.value));
}
window.toggleCommandPalette = () => { document.getElementById('odin-command').classList.remove('hidden'); document.getElementById('cmd-input').focus(); document.getElementById('cmd-input').dispatchEvent(new Event('input')); };
function renderCommands(filter='') {
    const list = document.getElementById('cmd-results'); list.innerHTML='';
    const cmds = [
        {l:'Visão Geral', a:()=>window.location.href=basePath+'/index.html', i:'fa-home'},
        {l:'Secretaria', a:()=>window.location.href=pagesPath+'/secretaria.html', i:'fa-folder-open'},
        {l:'Financeiro', a:()=>window.location.href=pagesPath+'/financeiro.html', i:'fa-wallet'},
        {l:'Comercial', a:()=>window.location.href=pagesPath+'/comercial.html', i:'fa-rocket'},
        {l:'Pedagógico', a:()=>window.location.href=pagesPath+'/pedagogico.html', i:'fa-brain'},
        {l:'Ferramentas', a:()=>window.location.href=pagesPath+'/ferramentas.html', i:'fa-tools'},
        {l:'Bloquear Tela', a:()=>lockScreen(), i:'fa-lock'},
        {l:'Notas Rápidas', a:()=>toggleScratchpad(), i:'fa-sticky-note'},
        {l:'Backup', a:()=>backupData(), i:'fa-download'}
    ].filter(c=>c.l.toLowerCase().includes(filter.toLowerCase()));
    if(cmds.length===0) list.innerHTML='<div class="p-4 text-center text-gray-500 text-xs">Nada encontrado.</div>';
    cmds.forEach(c=>{ list.innerHTML+=`<div onclick="this.dataset.action && eval(this.dataset.action); document.getElementById('odin-command').classList.add('hidden');" data-action="(${c.a.toString()})()" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-neon-cyan/10 hover:border-l-4 hover:border-neon-cyan transition-all group"><i class="fas ${c.i} text-gray-400 w-6 text-center group-hover:text-neon-cyan"></i><span class="text-sm font-bold text-white group-hover:text-neon-cyan">${c.l}</span></div>`; });
}

// --- UI COMPONENTS ---
function setFavicon() {
    const link = document.createElement('link'); link.type = 'image/png'; link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png?v=${Date.now()}`;
    const old = document.querySelector("link[rel*='icon']"); if(old) old.remove();
    document.head.appendChild(link);
}