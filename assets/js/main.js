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
let auth, provider, db;
if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        if (firebase.firestore) db = firebase.firestore();
        provider = new firebase.auth.GoogleAuthProvider();
    } catch (e) { console.error("Erro Firebase:", e); }
}

const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages'; 

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
    else renderLoginButtons();

    setTimeout(() => {
        if (window.showToast) {
            const originalToast = window.showToast;
            window.showToast = function(msg, type) {
                originalToast(msg, type);
                addLog(msg, type);
                if(localStorage.getItem('ODIN_MUTE') !== 'true') playSound(type === 'success' ? 'success' : 'click');
            };
        }
    }, 500);
});

// --- VALIDAÇÕES ---
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
    if (cpf.length != 11 || /^(\d)\1+$/.test(cpf)) return false;
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    return true;
}

function validatePasswordStrength(p) { 
    return /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.{8,})/.test(p); 
}

// --- AUTH LISTENER (Gerencia Login Automático e Bloqueio) ---
function initAuthListener() {
    auth.onAuthStateChanged(async (user) => {
        const userArea = document.getElementById('user-area');
        const mobileUserArea = document.getElementById('mobile-user-area');
        
        // Se o DOM ainda não carregou, tenta de novo em breve
        if (!userArea) { setTimeout(initAuthListener, 100); return; }

        if (user) {
            // === USUÁRIO LOGADO (Cadastrado ou Login feito) ===
            // Libera o acesso imediatamente.
            
            // Fecha modais de bloqueio se estiverem abertos
            document.getElementById('login-modal')?.classList.add('hidden');
            document.getElementById('register-modal')?.classList.add('hidden');

            let displayName = user.displayName || "Operador";
            let photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
            let userRole = "Vendedor"; // Padrão visual inicial

            // Busca dados reais no banco (assíncrono, não bloqueia a UI)
            if (db) {
                db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        // Atualiza a UI se os dados carregarem
                        if(data.name) document.querySelectorAll('.user-name-display').forEach(el => el.innerText = data.name);
                        if(data.role) document.querySelectorAll('.user-role-display').forEach(el => el.innerText = data.role);
                    }
                }).catch(e => console.log("Perfil não carregado ainda", e));
            }

            // Salva cache local para acesso rápido
            localStorage.setItem('ODIN_USER_NAME', displayName);
            localStorage.setItem('ODIN_USER_PHOTO', photoURL);

            // Renderiza Header Logado (Desktop)
            const desktopHtml = `
                <div class="text-right hidden md:block cursor-pointer group" onclick="openConfigModal()">
                    <p class="text-white text-xs font-bold group-hover:text-neon-cyan transition leading-tight truncate max-w-[120px] user-name-display">${displayName}</p>
                    <p class="text-gray-500 text-[9px] font-mono tracking-wider text-neon-green uppercase user-role-display">${userRole}</p>
                </div>
                <div class="relative group cursor-pointer" onclick="openConfigModal()">
                    <img src="${photoURL}" class="w-8 h-8 rounded-lg border border-dark-600 shadow-inner group-hover:border-neon-cyan transition-all object-cover">
                    <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-neon-green border-2 border-dark-900 rounded-full animate-pulse"></div>
                </div>`;
            
            // Renderiza Menu Logado (Mobile)
            const mobileHtml = `
                <div class="flex items-center gap-3 p-4 bg-dark-800 rounded-xl border border-dark-700 shadow-lg" onclick="openConfigModal()">
                    <img src="${photoURL}" class="w-12 h-12 rounded-full border-2 border-neon-cyan object-cover">
                    <div>
                        <p class="text-white font-bold text-sm leading-tight mb-0.5 user-name-display">${displayName}</p>
                        <p class="text-neon-green text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 bg-neon-green rounded-full"></span> <span class="user-role-display">${userRole}</span>
                        </p>
                    </div>
                    <button class="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 text-gray-400"><i class="fas fa-cog text-xs"></i></button>
                </div>`;
            
            if(userArea) userArea.innerHTML = desktopHtml;
            if(mobileUserArea) mobileUserArea.innerHTML = mobileHtml;

        } else { 
            // === USUÁRIO DESLOGADO: BLOQUEIA TUDO ===
            renderLoginButtons(); 
            localStorage.setItem('ODIN_USER_NAME', 'Visitante'); 
            
            // Abre modal e remove botão de fechar
            openRegisterModal();
            setTimeout(() => {
                const closeLogin = document.getElementById('btn-close-login');
                const closeReg = document.getElementById('btn-close-reg');
                if(closeLogin) closeLogin.style.display = 'none';
                if(closeReg) closeReg.style.display = 'none';
            }, 100);
        }
    });
}

function renderLoginButtons() {
    const btnDesktop = `
        <button onclick="openLoginModal()" class="flex items-center gap-2 px-4 py-1.5 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <i class="fas fa-sign-in-alt"></i> Acessar
        </button>`;
    
    const btnMobile = `
        <div class="flex flex-col gap-3 p-4">
            <button onclick="openLoginModal()" class="w-full py-3 bg-dark-800 border border-dark-600 rounded-xl text-white font-bold hover:border-neon-violet transition uppercase text-xs tracking-wider">
                <i class="fas fa-key mr-2"></i> Entrar com Senha
            </button>
            <button onclick="window.loginGoogle()" class="w-full py-3 bg-neon-cyan/10 border border-neon-cyan/50 rounded-xl text-neon-cyan font-bold hover:bg-neon-cyan hover:text-dark-900 transition uppercase text-xs tracking-wider">
                <i class="fab fa-google mr-2"></i> Entrar com Google
            </button>
            <button onclick="openRegisterModal()" class="text-xs text-gray-500 underline text-center mt-1">Criar nova conta</button>
        </div>`;

    const ua = document.getElementById('user-area'); 
    const mua = document.getElementById('mobile-user-area');
    if(ua) ua.innerHTML = btnDesktop;
    if(mua) mua.innerHTML = btnMobile;
}

window.loginODIN = () => { if(auth) auth.signInWithPopup(provider).catch(e => alert(e.message)); };
window.logoutODIN = () => { if(confirm("Sair?")) auth.signOut().then(() => location.reload()); };

// --- UI GERAL ---
function setFavicon() { 
    const l = document.createElement('link'); l.type='image/png'; l.rel='shortcut icon'; l.href=`${basePath}/assets/img/odin-logo.png?v=${Date.now()}`; 
    const o=document.querySelector("link[rel*='icon']"); if(o) o.remove(); document.head.appendChild(l); 
}

function loadHeader() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    const getNavClass = (name) => page.includes(name) ? 'text-white bg-white/10 border-white/20 shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    const getMobClass = (name, color) => page.includes(name) ? `bg-${color}/20 text-${color} border-${color}/50 font-bold` : `bg-dark-800 text-gray-400 border-dark-700 hover:text-white`;
    const getToolClass = () => page.includes('ferr_') ? 'text-neon-orange border-white/10 bg-white/5' : 'text-gray-400 border-transparent hover:text-white';

    const headerHTML = `
    <div id="auth-modals-container"></div>
    <div id="config-modal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[250] hidden flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button onclick="closeConfigModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            <div class="text-center mb-6">
                <img id="modal-user-photo" src="" class="w-16 h-16 rounded-full mx-auto border-2 border-neon-cyan mb-3 object-cover">
                <h2 id="modal-user-name" class="text-lg font-bold text-white">User</h2>
            </div>
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <button id="btn-mute" onclick="toggleMute()" class="p-3 bg-dark-900 border border-dark-700 rounded flex flex-col items-center justify-center text-[10px] text-gray-400 hover:text-white"><i class="fas fa-volume-up text-base mb-1"></i> Som</button>
                    <button onclick="lockScreen()" class="p-3 bg-dark-900 border border-dark-700 rounded flex flex-col items-center justify-center text-[10px] text-gray-400 hover:text-white"><i class="fas fa-lock text-base mb-1"></i> Bloquear</button>
                </div>
                <button onclick="window.logoutODIN()" class="w-full bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white py-3 rounded font-bold transition text-xs uppercase tracking-widest">Sair do Sistema</button>
            </div>
        </div>
    </div>
    <div id="terms-modal" class="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] hidden flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
        <div class="bg-dark-900 border border-dark-600 rounded-xl w-full max-w-2xl h-[80vh] flex flex-col relative shadow-2xl">
            <div class="p-4 border-b border-dark-700 flex justify-between items-center">
                <h3 class="text-white font-bold uppercase tracking-wider">Termos de Uso & Privacidade</h3>
                <button onclick="document.getElementById('terms-modal').classList.add('hidden')" class="text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto custom-scroll text-sm text-gray-300 leading-relaxed space-y-4">
                <p><strong class="text-white">1. ACEITAÇÃO</strong><br>Ao acessar o sistema ODIN OS, você concorda em cumprir estes termos de serviço.</p>
                <p><strong class="text-white">2. USO DO SISTEMA</strong><br>O sistema é de uso exclusivo para fins operacionais. É proibido compartilhar credenciais.</p>
                <p><strong class="text-white">3. DADOS</strong><br>Respeitamos a LGPD. Dados são protegidos.</p>
                <p><strong class="text-white">4. SEGURANÇA</strong><br>O usuário é responsável por sua senha.</p>
            </div>
            <div class="p-4 border-t border-dark-700 bg-dark-800 text-center">
                <button onclick="document.getElementById('terms-modal').classList.add('hidden')" class="bg-neon-cyan text-dark-900 font-bold py-2 px-6 rounded hover:bg-white transition text-xs uppercase">Entendi</button>
            </div>
        </div>
    </div>
    <header class="fixed w-full top-0 z-[100] bg-dark-900/95 backdrop-blur-md border-b border-dark-700 h-16 lg:h-20 flex items-center">
        <nav class="container mx-auto px-4 lg:px-6 h-full grid grid-cols-[auto_1fr_auto] items-center gap-4">
            <a href="${basePath}/index.html" class="flex items-center gap-3 z-50">
                <img src="${basePath}/assets/img/odin-logo.png" class="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg border border-dark-600">
                <span class="text-white font-black tracking-widest text-lg lg:text-xl hidden md:block group-hover:text-neon-cyan transition">ODIN</span>
            </a>
            <div class="hidden lg:flex justify-center">
                <div class="flex items-center bg-dark-800/50 border border-dark-600 rounded-full p-1 shadow-xl gap-1">
                    <a href="${pagesPath}/secretaria.html" class="px-4 py-1.5 rounded-full text-xs font-bold transition border ${getNavClass('secretaria')}">Secretaria</a>
                    <a href="${pagesPath}/financeiro.html" class="px-4 py-1.5 rounded-full text-xs font-bold transition border ${getNavClass('financeiro')}">Financeiro</a>
                    <a href="${pagesPath}/pedagogico.html" class="px-4 py-1.5 rounded-full text-xs font-bold transition border ${getNavClass('pedagogico')}">Pedagógico</a>
                    <a href="${pagesPath}/comercial.html" class="px-4 py-1.5 rounded-full text-xs font-bold transition border ${getNavClass('comercial')}">Comercial</a>
                    <a href="${pagesPath}/coordenacao.html" class="px-4 py-1.5 rounded-full text-xs font-bold transition border ${getNavClass('coordenacao')}">Coordenação</a>
                    <div class="relative group px-2">
                        <button class="text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1"><i class="fas fa-tools"></i> <i class="fas fa-chevron-down text-[8px]"></i></button>
                        <div class="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-dark-900 border border-dark-600 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                            <a href="${pagesPath}/ferr_conversao.html" class="block px-4 py-3 text-[10px] uppercase font-bold text-gray-400 hover:text-white hover:bg-dark-800 border-b border-dark-800">Conversão</a>
                            <a href="${pagesPath}/ferr_scripts.html" class="block px-4 py-3 text-[10px] uppercase font-bold text-gray-400 hover:text-white hover:bg-dark-800 border-b border-dark-800">Scripts</a>
                            <a href="${pagesPath}/ferr_suporte.html" class="block px-4 py-3 text-[10px] uppercase font-bold text-gray-400 hover:text-white hover:bg-dark-800 border-b border-dark-800">Suporte</a>
                            <a href="${pagesPath}/ferr_agenda.html" class="block px-4 py-3 text-[10px] uppercase font-bold text-gray-400 hover:text-white hover:bg-dark-800">Agenda</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-end gap-3">
                <div class="hidden lg:flex items-center gap-2">
                    <button onclick="toggleVoice()" class="w-8 h-8 flex items-center justify-center rounded bg-dark-800 text-gray-400 hover:text-white border border-dark-600 transition"><i id="mic-icon" class="fas fa-microphone text-xs"></i></button>
                    <button onclick="toggleCommandPalette()" class="w-8 h-8 flex items-center justify-center rounded bg-dark-800 text-gray-400 hover:text-white border border-dark-600 transition"><i class="fas fa-terminal text-xs"></i></button>
                    <div class="h-6 w-px bg-dark-700 mx-2"></div>
                </div>
                <div id="user-area" class="flex items-center gap-3 justify-end min-w-[100px]"><div class="w-20 h-6 bg-dark-800 rounded animate-pulse"></div></div>
                <button id="mobile-menu-btn" class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-dark-800 text-white border border-dark-600 hover:border-neon-cyan transition z-50"><i class="fas fa-bars"></i></button>
            </div>
        </nav>
        <div id="mobile-menu" class="fixed inset-0 w-full h-[100dvh] bg-dark-900 z-[200] transform translate-x-full transition-transform duration-300 flex flex-col overflow-y-auto">
            <div class="px-6 h-16 flex items-center justify-between border-b border-dark-800 flex-none bg-dark-900 sticky top-0 z-[210]">
                <span class="text-white font-black text-xl tracking-widest flex items-center gap-3"><img src="${basePath}/assets/img/odin-logo.png" class="w-8 h-8 rounded-full border border-dark-600"> ODIN OS</span>
                <button id="close-mobile-btn" class="w-10 h-10 flex items-center justify-center rounded-full bg-dark-800 text-gray-400 hover:text-white border border-dark-700 transition"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 flex-grow flex flex-col pb-20">
                <div id="mobile-user-area" class="w-full mb-6"></div>
                <p class="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-3 ml-1">Menu Principal</p>
                <nav class="flex flex-col gap-2 text-sm">
                    <a href="${basePath}/index.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${page.includes('index') ? 'bg-dark-800 text-white border-neon-cyan' : 'bg-dark-800/40 text-gray-400 border-dark-700'}"><i class="fas fa-home w-5 text-center"></i> Visão Geral</a>
                    <a href="${pagesPath}/secretaria.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${getMobClass('secretaria', 'neon-violet')}"><i class="fas fa-folder-open w-5 text-center"></i> Secretaria</a>
                    <a href="${pagesPath}/financeiro.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${getMobClass('financeiro', 'neon-cyan')}"><i class="fas fa-wallet w-5 text-center"></i> Financeiro</a>
                    <a href="${pagesPath}/pedagogico.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${getMobClass('pedagogico', 'neon-pink')}"><i class="fas fa-brain w-5 text-center"></i> Pedagógico</a>
                    <a href="${pagesPath}/comercial.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${getMobClass('comercial', 'neon-green')}"><i class="fas fa-rocket w-5 text-center"></i> Comercial</a>
                    <a href="${pagesPath}/coordenacao.html" class="mobile-link p-3 rounded-xl border transition flex items-center gap-3 ${getMobClass('coordenacao', 'neon-pink')}"><i class="fas fa-network-wired w-5 text-center"></i> Coordenação</a>
                    <div class="pt-4 mt-2 border-t border-dark-800">
                        <p class="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-3 ml-1">Ferramentas</p>
                        <div class="grid grid-cols-2 gap-2">
                            <a href="${pagesPath}/ferr_conversao.html" class="p-3 bg-dark-800 rounded-lg text-center text-[10px] font-bold text-gray-400 border border-dark-700 hover:text-white hover:border-neon-orange">Conversão</a>
                            <a href="${pagesPath}/ferr_scripts.html" class="p-3 bg-dark-800 rounded-lg text-center text-[10px] font-bold text-gray-400 border border-dark-700 hover:text-white hover:border-neon-orange">Scripts</a>
                            <a href="${pagesPath}/ferr_agenda.html" class="p-3 bg-dark-800 rounded-lg text-center text-[10px] font-bold text-gray-400 border border-dark-700 hover:text-white hover:border-neon-orange">Agenda</a>
                            <a href="${pagesPath}/ferr_suporte.html" class="p-3 bg-dark-800 rounded-lg text-center text-[10px] font-bold text-gray-400 border border-dark-700 hover:text-white hover:border-neon-orange">Suporte</a>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    </header>`;
    
    document.getElementById('header-placeholder').innerHTML = headerHTML;
    setTimeout(updateNotificationBadge, 500);
}

function loadFooter() { document.getElementById('footer-placeholder').innerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="container mx-auto px-6 text-center text-xs text-gray-600 font-mono">ODIN SYSTEM v22.0 | COMPLETED</div></footer>`; }

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn'), closeBtn = document.getElementById('close-mobile-btn'), menu = document.getElementById('mobile-menu');
    if(btn && menu) btn.addEventListener('click', () => { menu.classList.remove('translate-x-full'); });
    if(closeBtn) closeBtn.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('translate-x-full'));
}

window.openConfigModal=()=>{document.getElementById('modal-user-name').innerText=localStorage.getItem('ODIN_USER_NAME')||"User"; document.getElementById('modal-user-photo').src=localStorage.getItem('ODIN_USER_PHOTO')||`${basePath}/assets/img/odin-logo.png`; document.getElementById('config-modal').classList.remove('hidden');};
window.closeConfigModal=()=>{document.getElementById('config-modal').classList.add('hidden');};

const HUB_LINKS = { 'sos': 'https://docs.google.com/forms/d/e/1FAIpQLSeFcVAOhDxNDj70FAaJC2-e2pfpnaUdtvtrhot5mW3qKvGUdA/viewform?usp=header', 'crm': 'https://app.taime.pro/' }; 
function initVoiceControl() { if (!('webkitSpeechRecognition' in window)) return; const recognition = new webkitSpeechRecognition(); recognition.continuous = false; recognition.lang = 'pt-BR'; recognition.interimResults = false; recognition.onresult = (e) => { let cmd = e.results[0][0].transcript.toLowerCase(); executeVoiceCommand(cmd); }; recognition.onerror = () => { document.getElementById('mic-icon')?.classList.remove('text-red-500'); }; window.toggleVoice = () => { const icon = document.getElementById('mic-icon'); if (icon.classList.contains('text-red-500')) recognition.stop(); else { recognition.start(); icon.classList.add('text-red-500'); } }; }
function executeVoiceCommand(cmd) { if(cmd.includes('início')) window.location.href = basePath+'/index.html'; window.speak(`Comando ${cmd}`); }
window.speak = (text) => { if(localStorage.getItem('ODIN_MUTE') === 'true') return; const u = new SpeechSynthesisUtterance(text); u.lang = 'pt-BR'; window.speechSynthesis.speak(u); };
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) { if(localStorage.getItem('ODIN_MUTE') === 'true') return; if(audioCtx.state === 'suspended') audioCtx.resume(); const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); const now = audioCtx.currentTime; if (type === 'click') { osc.frequency.setValueAtTime(800,now); gain.gain.setValueAtTime(0.01,now); osc.start(now); osc.stop(now+0.05); } }
function toggleMute() { const m=localStorage.getItem('ODIN_MUTE')==='true'; localStorage.setItem('ODIN_MUTE',!m); const b=document.getElementById('btn-mute'); if(b){ b.querySelector('span').innerText=!m?'Som: OFF':'Som: ON'; b.querySelector('i').className=!m?'fas fa-volume-mute text-red-500':'fas fa-volume-up text-neon-green'; } }
function initLockScreen() { /* ... */ } 
window.lockScreen = () => { document.body.insertAdjacentHTML('beforeend', `<div id="odin-lockscreen" class="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center text-white"><button onclick="this.parentElement.remove()" class="border border-neon-cyan px-6 py-2 rounded text-neon-cyan hover:bg-neon-cyan hover:text-black transition">DESBLOQUEAR</button></div>`); };
function initScratchpad() { /* ... */ }
function initCommandPalette() { /* ... */ }
window.toggleCommandPalette = () => { /* ... */ };
function initNotifications() { /* ... */ }
function addLog(msg, type) { /* ... */ }
function updateNotificationBadge() { /* ... */ }
window.toggleNotifications = () => { /* ... */ };
window.backupData = () => { /* ... */ };
window.restoreData = (i) => { /* ... */ };

// --- AUTH LOGIC (Processos de Login/Cadastro) ---
function injectAuthModals() {
    if (document.getElementById('login-modal')) return;

    // Login Modal (Com ID btn-close-login)
    const loginHtml = `
    <div id="login-modal" class="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-sm p-8 relative shadow-2xl">
            <button id="btn-close-login" onclick="closeAuthModals()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            <div class="text-center mb-6"><img src="${basePath}/assets/img/odin-logo.png" class="w-16 h-16 rounded-full mx-auto border-2 border-dark-600 mb-2"><h2 class="text-2xl font-black text-white">ODIN OS</h2></div>
            <div class="space-y-4">
                <div><label class="text-[10px] uppercase font-bold text-gray-500">Email</label><input type="email" id="login-email" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-cyan outline-none transition"></div>
                <div><label class="text-[10px] uppercase font-bold text-gray-500">Senha</label><input type="password" id="login-pass" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-cyan outline-none transition"></div>
                <button onclick="processLogin()" class="w-full bg-neon-cyan text-dark-900 font-bold py-3 rounded hover:bg-white transition">ENTRAR</button>
                <button onclick="window.loginGoogle()" class="w-full bg-dark-800 border border-dark-600 text-white font-bold py-3 rounded hover:border-neon-cyan transition text-xs uppercase"><i class="fab fa-google mr-2"></i> Entrar com Google</button>
            </div>
            <p class="text-center mt-6 text-xs text-gray-500">Novo aqui? <a href="#" onclick="openRegisterModal()" class="text-neon-cyan hover:underline">Cadastrar</a></p>
        </div>
    </div>`;

    // Register Modal (Com ID btn-close-reg e Termos)
    const registerHtml = `
    <div id="register-modal" class="fixed inset-0 bg-black/95 backdrop-blur-md z-[200] hidden flex items-center justify-center p-4">
        <div class="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md p-8 relative shadow-2xl h-auto max-h-[90vh] overflow-y-auto custom-scroll">
            <button id="btn-close-reg" onclick="closeAuthModals()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            <h2 class="text-xl font-black text-white mb-6 text-center">Novo Cadastro</h2>
            <div class="space-y-3">
                <div><label class="text-[10px] uppercase font-bold text-gray-500">Nome Completo</label><input type="text" id="reg-name" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-green outline-none transition"></div>
                <div><label class="text-[10px] uppercase font-bold text-gray-500">CPF</label><input type="text" id="reg-cpf" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-green outline-none transition" placeholder="000.000.000-00"></div>
                <div><label class="text-[10px] uppercase font-bold text-gray-500">Email</label><input type="email" id="reg-email" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-green outline-none transition"></div>
                <div><label class="text-[10px] uppercase font-bold text-gray-500">Senha</label><input type="password" id="reg-pass" class="w-full bg-dark-800 border border-dark-600 rounded p-3 text-white focus:border-neon-green outline-none transition"><p class="text-[9px] text-gray-600 mt-1">Min. 8 chars, 1 Maiúscula, 1 Especial (!@#$)</p></div>
                <div class="flex items-center gap-2 mt-2">
                    <input type="checkbox" id="reg-terms" class="w-4 h-4 rounded bg-dark-800 border-dark-600 text-neon-green focus:ring-0">
                    <label for="reg-terms" class="text-[10px] text-gray-400">Li e aceito os <a href="#" onclick="document.getElementById('terms-modal').classList.remove('hidden')" class="text-neon-green hover:underline">Termos de Uso</a></label>
                </div>
                <button onclick="processRegister()" class="w-full bg-neon-green text-dark-900 font-bold py-3 rounded hover:bg-white transition mt-2">CADASTRAR</button>
            </div>
            <p class="text-center mt-6 text-xs text-gray-500">Já possui conta? <a href="#" onclick="openLoginModal()" class="text-neon-violet hover:underline">Fazer Login</a></p>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', loginHtml + registerHtml);
    
    setTimeout(() => {
        const cpf = document.getElementById('reg-cpf');
        if(cpf) cpf.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g,"");
            v=v.replace(/(\d{3})(\d)/,"$1.$2");
            v=v.replace(/(\d{3})(\d)/,"$1.$2");
            v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
            e.target.value = v.substring(0,14);
        });
    }, 500);
}

window.openLoginModal = () => { injectAuthModals(); document.getElementById('login-modal').classList.remove('hidden'); document.getElementById('register-modal').classList.add('hidden'); };
window.openRegisterModal = () => { injectAuthModals(); document.getElementById('register-modal').classList.remove('hidden'); document.getElementById('login-modal').classList.add('hidden'); };
window.closeAuthModals = () => { document.getElementById('login-modal').classList.add('hidden'); document.getElementById('register-modal').classList.add('hidden'); };

window.loginGoogle = () => { if(auth) auth.signInWithPopup(provider).catch(e => window.showToast(e.message, 'error')); };

window.processLogin = () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if(!email || !pass) return window.showToast('Preencha todos os campos', 'error');
    auth.signInWithEmailAndPassword(email, pass).then(() => { 
        window.showToast('Login realizado!', 'success'); 
        window.closeAuthModals(); 
    }).catch(e => window.showToast('Erro: ' + e.message, 'error'));
};

window.processRegister = () => {
    const name = document.getElementById('reg-name').value;
    const cpf = document.getElementById('reg-cpf').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const terms = document.getElementById('reg-terms').checked;

    if(!name || !cpf || !email || !pass) return window.showToast('Preencha todos os campos', 'error');
    if(!terms) return window.showToast('Aceite os termos de uso', 'error');
    if(!validateCPF(cpf)) return window.showToast('CPF Inválido', 'error');
    if(!validatePasswordStrength(pass)) return window.showToast('Senha fraca: use 8 dígitos, maiúscula e caractere especial.', 'error');

    const btn = document.querySelector('#register-modal button:last-of-type');
    const originalText = btn.innerText;
    btn.innerText = "PROCESSANDO...";
    btn.disabled = true;

    auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            const user = userCredential.user;
            
            user.sendEmailVerification()
                .then(() => window.showToast('Email de verificação enviado!', 'info'))
                .catch(e => console.error(e));

            if(db) {
                db.collection('users').doc(user.uid).set({ 
                    name: name, 
                    cpf: cpf, 
                    role: 'Vendedor', 
                    email: email 
                }).then(() => { 
                    window.showToast('Cadastro realizado com sucesso!', 'success'); 
                    window.closeAuthModals(); 
                }).catch(err => {
                    console.error(err);
                    window.showToast('Conta criada, mas erro ao salvar dados.', 'warning');
                    window.closeAuthModals();
                });
            } else {
                window.showToast('Cadastro realizado!', 'success'); 
                window.closeAuthModals();
            }
        })
        .catch((error) => {
            btn.innerText = originalText;
            btn.disabled = false;
            if(error.code === 'auth/email-already-in-use') window.showToast('Email já está em uso.', 'error');
            else window.showToast('Erro: ' + error.message, 'error');
        });
};