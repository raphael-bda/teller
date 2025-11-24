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
    } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", function() {
    setFavicon();
    loadHeader(); 
    loadFooter();
    initMobileMenu();
    if (auth) initAuthListener();
});

const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages'; 

// --- AUTH LISTENER ---
function initAuthListener() {
    auth.onAuthStateChanged((user) => {
        const userArea = document.getElementById('user-area');
        const mobileUserArea = document.getElementById('mobile-user-area');

        if (user) {
            const displayName = user.displayName || "Operador";
            const photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
            
            const html = `
                <div class="text-right hidden md:block cursor-pointer" onclick="window.logoutODIN()">
                    <p class="text-white text-xs font-bold hover:text-neon-cyan transition">${displayName}</p>
                    <p class="text-gray-500 text-[10px] font-mono tracking-wider text-neon-green">ONLINE</p>
                </div>
                <div class="relative group cursor-pointer" onclick="window.logoutODIN()">
                    <img src="${photoURL}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner hover:border-neon-cyan transition-all object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
                </div>`;
            
            if(userArea) userArea.innerHTML = html;
            if(mobileUserArea) mobileUserArea.innerHTML = html.replace('hidden md:block', 'block');
            
        } else {
            const btn = `<button onclick="window.loginODIN()" class="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-xs uppercase tracking-wider"><i class="fab fa-google"></i> Acessar</button>`;
            if(userArea) userArea.innerHTML = btn;
            if(mobileUserArea) mobileUserArea.innerHTML = btn;
        }
    });
}

window.loginODIN = () => { if(auth) auth.signInWithPopup(provider).catch(e => alert(e.message)); };
window.logoutODIN = () => { if(confirm("Sair?")) auth.signOut().then(() => location.reload()); };

// --- UI COMPONENTS ---
function setFavicon() {
    const link = document.createElement('link'); link.type = 'image/png'; link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png?v=${Date.now()}`;
    document.head.appendChild(link);
}

function loadHeader() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || 'index.html';
    const isActive = (n) => page.includes(n) ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    const isToolActive = page.includes('ferr_') ? 'text-neon-orange border-white/10' : 'text-gray-400 border-transparent';

    const headerHTML = `
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
                            <a href="${pagesPath}/ferr_conversao.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50">
                                <i class="fas fa-exchange-alt w-5"></i> Conversão
                            </a>
                            <a href="${pagesPath}/ferr_procedimentos.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50">
                                <i class="fas fa-book w-5"></i> Procedimentos
                            </a>
                            <a href="${pagesPath}/ferr_scripts.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50">
                                <i class="fas fa-comment-alt w-5"></i> Scripts
                            </a>
                            <a href="${pagesPath}/ferr_suporte.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center border-b border-dark-700/50">
                                <i class="fas fa-headset w-5"></i> Suporte
                            </a>
                            <a href="${pagesPath}/ferr_agenda.html" class="block px-4 py-3 text-xs font-bold text-gray-300 hover:bg-neon-orange hover:text-dark-900 transition flex items-center">
                                <i class="fas fa-calendar w-5"></i> Agenda
                            </a>
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
    document.getElementById('footer-placeholder').innerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="container mx-auto px-6 text-center text-xs text-gray-600 font-mono">ODIN SYSTEM v11.0 | LINK CORRECTION</div></footer>`;
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-btn');
    const menu = document.getElementById('mobile-menu');

    if(btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('translate-x-full');
            const icon = btn.querySelector('i');
            if(menu.classList.contains('translate-x-full')) icon.className = 'fas fa-bars';
            else icon.className = 'fas fa-times';
        });
    }
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.add('translate-x-full');
            document.querySelector('#mobile-menu-btn i').className = 'fas fa-bars';
        });
    }
}