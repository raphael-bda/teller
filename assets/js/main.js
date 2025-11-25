// --- CONFIGURAÇÃO FIREBASE (Versão Compat - Universal) ---
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
// Verifica se o script do Firebase foi carregado no HTML
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
    } catch (e) {
        console.error("Erro ao iniciar Firebase:", e);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    setFavicon();
    loadHeader(); 
    loadFooter();
    initMobileMenu();
    
    // Inicia o listener apenas se o Firebase estiver ativo
    if (auth) initAuthListener();
});

// Variáveis de Caminho
const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages'; 

// --- LÓGICA DE AUTENTICAÇÃO (SEM BLOQUEIO) ---
function initAuthListener() {
    auth.onAuthStateChanged((user) => {
        const userArea = document.getElementById('user-area');
        const mobileUserArea = document.getElementById('mobile-user-area');

        if (user) {
            // --- CENÁRIO 1: USUÁRIO LOGADO ---
            const displayName = user.displayName || "Operador";
            const photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
            
            // Desktop HTML
            if (userArea) {
                userArea.innerHTML = `
                    <div class="text-right hidden md:block cursor-pointer" onclick="openConfigModal()">
                        <p class="text-white text-xs font-bold hover:text-neon-cyan transition">${displayName}</p>
                        <p class="text-gray-500 text-[10px] font-mono tracking-wider text-neon-green">ONLINE</p>
                    </div>
                    <div class="relative group cursor-pointer" onclick="openConfigModal()">
                        <img src="${photoURL}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner hover:border-neon-cyan transition-all object-cover">
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
                    </div>
                `;
            }

            // Mobile HTML
            if (mobileUserArea) {
                mobileUserArea.innerHTML = `
                    <div class="flex items-center gap-3 p-4 bg-dark-800 rounded-xl border border-dark-600 w-full cursor-pointer" onclick="openConfigModal()">
                        <img src="${photoURL}" class="w-12 h-12 rounded-full border-2 border-neon-cyan">
                        <div>
                            <p class="text-white font-bold">${displayName}</p>
                            <p class="text-neon-green text-xs">Toque para Configurações</p>
                        </div>
                    </div>
                `;
            }

            // Salva info básica para o modal
            localStorage.setItem('ODIN_USER_NAME', displayName);
            localStorage.setItem('ODIN_USER_EMAIL', user.email);
            localStorage.setItem('ODIN_USER_PHOTO', photoURL);
            
        } else {
            // --- CENÁRIO 2: USUÁRIO DESLOGADO ---
            const btn = `
                <button onclick="window.loginODIN()" class="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <i class="fab fa-google"></i> Acessar
                </button>
            `;
            if (userArea) userArea.innerHTML = btn;
            if (mobileUserArea) mobileUserArea.innerHTML = btn;
        }
    });
}

// Funções Globais (Acessíveis pelo HTML)
window.loginODIN = () => {
    if(!auth) return alert("Firebase não carregado.");
    auth.signInWithPopup(provider)
        .then((result) => console.log("Logado:", result.user.displayName))
        .catch((error) => alert("Erro no Login: " + error.message));
};

window.logoutODIN = () => {
    if(confirm("Desconectar sua conta Google?")) {
        auth.signOut().then(() => window.location.reload());
    }
};

// --- COMPONENTES VISUAIS (Header/Footer) ---
function setFavicon() {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(icon => icon.remove());
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png?v=${new Date().getTime()}`;
    document.head.appendChild(link);
}

function loadHeader() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    const isActive = (n) => page.includes(n) ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    const isToolActive = page.includes('ferr_') ? 'text-neon-orange border-white/10' : 'text-gray-400 border-transparent';

    const headerHTML = `
    <div id="config-modal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-neon-cyan/10">
            <button onclick="closeConfigModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            
            <div class="text-center mb-6">
                <img id="modal-user-photo" src="" class="w-20 h-20 rounded-full mx-auto border-2 border-neon-cyan mb-3 object-cover">
                <h2 id="modal-user-name" class="text-xl font-bold text-white">Usuário</h2>
                <span class="text-xs font-mono bg-dark-900 px-3 py-1 rounded border border-dark-600 text-neon-cyan mt-2 inline-block">OPERADOR</span>
            </div>

            <div class="space-y-4">
                <div class="bg-dark-900 p-4 rounded border border-dark-600">
                    <h3 class="text-xs uppercase font-bold text-gray-500 mb-3 flex items-center"><i class="fas fa-database mr-2"></i> Segurança de Dados</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="backupData()" class="flex flex-col items-center justify-center p-3 bg-dark-800 hover:bg-neon-green/10 border border-dark-700 hover:border-neon-green rounded transition group h-20">
                            <i class="fas fa-cloud-download-alt text-xl text-gray-400 group-hover:text-neon-green mb-2"></i>
                            <span class="text-[10px] font-bold text-gray-300 group-hover:text-white uppercase">Baixar Backup</span>
                        </button>
                        
                        <label class="flex flex-col items-center justify-center p-3 bg-dark-800 hover:bg-neon-orange/10 border border-dark-700 hover:border-neon-orange rounded transition group cursor-pointer h-20">
                            <i class="fas fa-cloud-upload-alt text-xl text-gray-400 group-hover:text-neon-orange mb-2"></i>
                            <span class="text-[10px] font-bold text-gray-300 group-hover:text-white uppercase">Restaurar</span>
                            <input type="file" id="restore-file" class="hidden" accept=".json" onchange="restoreData(this)">
                        </label>
                    </div>
                    <p class="text-[9px] text-gray-600 mt-2 text-center">*O ODIN salva dados apenas no seu navegador. Faça backup regularmente.</p>
                </div>

                <button onclick="window.logoutODIN()" class="w-full bg-dark-700 hover:bg-red-600/20 hover:text-red-500 text-gray-300 border border-dark-600 hover:border-red-500 py-3 rounded font-bold transition flex items-center justify-center gap-2 mt-2">
                    <i class="fas fa-sign-out-alt"></i> Sair da Conta
                </button>
            </div>
        </div>
    </div>

    <header class="fixed w-full top-0 z-50 bg-dark-900/95 backdrop-blur-md border-b border-dark-700 h-20 flex items-center transition-all z-50">
        <nav class="container mx-auto px-4 flex justify-between items-center h-full">
            
            <a href="${basePath}/index.html" class="flex items-center group gap-3">
                <div class="relative w-10 h-10 flex-none rounded-full overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all ring-2 ring-transparent group-hover:ring-neon-cyan">
                    <img src="${basePath}/assets/img/odin-logo.png" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform">
                </div>
                <div class="flex flex-col">
                    <span class="text-white font-black tracking-widest text-xl leading-none group-hover:text-neon-cyan transition">ODIN</span>
                </div>
            </a>
            
            <div class="hidden xl:flex items-center bg-dark-800/50 border border-dark-600 rounded-full p-1 shadow-2xl">
                <a href="${pagesPath}/secretaria.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('secretaria')}">Secretaria</a>
                <div class="w-px h-3 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/financeiro.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('financeiro')}">Financeiro</a>
                <div class="w-px h-3 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/pedagogico.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('pedagogico')}">Pedagógico</a>
                <div class="w-px h-3 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/comercial.html" class="px-5 py-2 rounded-full text-xs font-bold transition border ${isActive('comercial')}">Comercial</a>
                
                <div class="w-px h-3 bg-dark-600 mx-1"></div>
                
                <div class="relative group">
                    <button class="px-5 py-2 rounded-full text-xs font-bold transition border ${isToolActive} hover:text-neon-orange flex items-center">
                        <i class="fas fa-tools mr-2"></i> Ferramentas <i class="fas fa-chevron-down ml-1 text-[8px] opacity-70 group-hover:rotate-180 transition-transform"></i>
                    </button>
                    <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-dark-800/95 backdrop-blur-xl border border-dark-600 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top overflow-hidden z-50">
                        <div class="py-1">
                            <a href="${pagesPath}/ferr_conversao.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50"><i class="fas fa-exchange-alt w-5"></i> Conversão</a>
                            <a href="${pagesPath}/ferr_procedimentos.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50"><i class="fas fa-book w-5"></i> Procedimentos</a>
                            <a href="${pagesPath}/ferr_scripts.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50"><i class="fas fa-comment-alt w-5"></i> Scripts</a>
                            <a href="${pagesPath}/ferr_suporte.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50"><i class="fas fa-headset w-5"></i> Suporte</a>
                            <a href="${pagesPath}/ferr_agenda.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center"><i class="fas fa-calendar w-5"></i> Agenda</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="hidden lg:flex items-center gap-4">
                <div id="user-area" class="flex items-center gap-3 min-w-[120px] justify-end"><div class="w-20 h-3 bg-dark-700 rounded animate-pulse"></div></div>
            </div>

            <button id="mobile-menu-btn" class="xl:hidden text-white text-2xl p-2 z-50"><i class="fas fa-bars"></i></button>
        </nav>

        <div id="mobile-menu" class="fixed inset-0 bg-dark-900 z-40 transform translate-x-full transition-transform duration-300 flex flex-col overflow-y-auto">
            <div class="p-6 pt-24 flex flex-col gap-6 h-full">
                <div id="mobile-user-area" class="w-full"></div>
                <nav class="flex flex-col gap-2 text-sm font-bold text-gray-300">
                    <a href="${basePath}/index.html" class="mobile-link flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-neon-cyan"><i class="fas fa-home w-6 text-center"></i> Visão Geral</a>
                    <a href="${pagesPath}/secretaria.html" class="mobile-link flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-neon-violet"><i class="fas fa-folder-open w-6 text-center text-neon-violet"></i> Secretaria</a>
                    <a href="${pagesPath}/financeiro.html" class="mobile-link flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-neon-cyan"><i class="fas fa-wallet w-6 text-center text-neon-cyan"></i> Financeiro</a>
                    <a href="${pagesPath}/pedagogico.html" class="mobile-link flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-neon-pink"><i class="fas fa-brain w-6 text-center text-neon-pink"></i> Pedagógico</a>
                    <a href="${pagesPath}/comercial.html" class="mobile-link flex items-center gap-4 p-4 rounded-xl bg-dark-800 border border-dark-700 hover:border-neon-green"><i class="fas fa-rocket w-6 text-center text-neon-green"></i> Comercial</a>
                    
                    <div class="pt-4 border-t border-dark-700">
                        <p class="text-xs text-gray-500 uppercase font-bold mb-2 pl-2">Ferramentas</p>
                        <a href="${pagesPath}/ferr_conversao.html" class="mobile-link flex items-center gap-4 p-3 rounded-lg hover:text-neon-orange"><i class="fas fa-exchange-alt w-6 text-center"></i> Conversão</a>
                        <a href="${pagesPath}/ferr_procedimentos.html" class="mobile-link flex items-center gap-4 p-3 rounded-lg hover:text-neon-orange"><i class="fas fa-book w-6 text-center"></i> Procedimentos</a>
                        <a href="${pagesPath}/ferr_scripts.html" class="mobile-link flex items-center gap-4 p-3 rounded-lg hover:text-neon-orange"><i class="fas fa-comment-alt w-6 text-center"></i> Scripts</a>
                        <a href="${pagesPath}/ferr_suporte.html" class="mobile-link flex items-center gap-4 p-3 rounded-lg hover:text-neon-orange"><i class="fas fa-headset w-6 text-center"></i> Suporte</a>
                        <a href="${pagesPath}/ferr_agenda.html" class="mobile-link flex items-center gap-4 p-3 rounded-lg hover:text-neon-orange"><i class="fas fa-calendar w-6 text-center"></i> Agenda</a>
                    </div>
                </nav>
                <button id="close-mobile-btn" class="mt-auto w-full py-4 bg-dark-800 border border-dark-600 rounded-xl text-gray-400 font-bold uppercase tracking-widest hover:text-white hover:bg-dark-700">Fechar Menu</button>
            </div>
        </div>
    </header>`;
    
    document.getElementById('header-placeholder').innerHTML = headerHTML;
}

function loadFooter() {
    document.getElementById('footer-placeholder').innerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="container mx-auto px-6 text-center text-xs text-gray-600 font-mono">ODIN SYSTEM v13.0 | DATA SECURE</div></footer>`;
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-btn');
    const menu = document.getElementById('mobile-menu');
    if(btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('translate-x-full');
            const icon = btn.querySelector('i');
            icon.className = menu.classList.contains('translate-x-full') ? 'fas fa-bars' : 'fas fa-times';
        });
    }
    if(closeBtn) closeBtn.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('translate-x-full'));
}

// --- FUNÇÕES DE BACKUP & RESTAURAÇÃO ---
window.openConfigModal = () => {
    document.getElementById('modal-user-name').innerText = localStorage.getItem('ODIN_USER_NAME') || "Operador";
    document.getElementById('modal-user-photo').src = localStorage.getItem('ODIN_USER_PHOTO') || `${basePath}/assets/img/odin-logo.png`;
    document.getElementById('config-modal').classList.remove('hidden');
}
window.closeConfigModal = () => document.getElementById('config-modal').classList.add('hidden');

window.backupData = () => {
    const data = {
        crm: localStorage.getItem('ODIN_CRM_LEADS'),
        secretaria: localStorage.getItem('ODIN_SECRETARIA_KANBAN'),
        financeiro: localStorage.getItem('ODIN_DEBTS'),
        pedagogico: localStorage.getItem('ODIN_PEDAGOGICO_AGENDA'),
        scripts: localStorage.getItem('ODIN_USER_SCRIPTS'),
        meta: { date: new Date(), version: '13.0' }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ODIN_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("Backup salvo! Guarde este arquivo com segurança.");
};

window.restoreData = (input) => {
    const file = input.files[0];
    if (!file) return;
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
            alert("Sistema restaurado! Recarregando...");
            location.reload();
        } catch (err) {
            console.error(err);
            alert("Arquivo de backup inválido.");
        }
    };
    reader.readAsText(file);
};