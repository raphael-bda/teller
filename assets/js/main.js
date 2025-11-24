// --- CREDENCIAIS DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBM5ZzM3zBVpIPj1Ln35F65jw7i_GZdb_I",
  authDomain: "odin-system-47a30.firebaseapp.com",
  projectId: "odin-system-47a30",
  storageBucket: "odin-system-47a30.firebasestorage.app",
  messagingSenderId: "1085403407316",
  appId: "1:1085403407316:web:45d7ce483ecb81a7faec41",
  measurementId: "G-RYPN4Q1DE9"
};

// --- VARIÁVEIS DE AMBIENTE ---
const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.';
// Verifica se estamos na página de login
const isLoginPage = window.location.pathname.includes('login.html');

// --- INICIALIZAÇÃO DO FIREBASE ---
let auth, provider;
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
} else {
    console.error("CRÍTICO: Firebase não carregado. Verifique os scripts no <head>.");
}

// --- SISTEMA DE SEGURANÇA (O PORTEIRO) ---
// Executa imediatamente, não espera o DOMContentLoaded
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // 🟢 USUÁRIO LOGADO
            // Se estiver no login, manda para o Dashboard
            if (isLoginPage) {
                window.location.replace(basePath + "/index.html");
                return;
            }
            
            // Se estiver no sistema, libera a visão e carrega perfil
            document.body.classList.remove('hidden-auth'); // Remove bloqueio visual
            updateUserProfile(user);
            
        } else {
            // 🔴 USUÁRIO DESLOGADO
            if (!isLoginPage) {
                // Se NÃO estiver no login, CHUTA para o login
                // Salva a página que ele tentou acessar para redirecionar depois (opcional)
                window.location.replace(basePath + "/login.html");
            } else {
                // Se estiver no login, libera a visão
                document.body.classList.remove('hidden-auth');
            }
        }
    });
}

// --- INICIALIZAÇÃO DA INTERFACE ---
document.addEventListener("DOMContentLoaded", function() {
    // Se não for a página de login, carrega o layout padrão
    if (!isLoginPage) {
        loadHeader();
        loadFooter();
        initMobileMenu();
    }
    setFavicon();
});

// --- FUNÇÕES VISUAIS ---

function updateUserProfile(user) {
    // Tenta encontrar a área do usuário repetidamente caso o Header demore a renderizar
    const interval = setInterval(() => {
        const userArea = document.getElementById('user-area');
        if (userArea) {
            clearInterval(interval);
            
            // Define Cargo (Simulado por enquanto)
            const role = "ADMINISTRADOR"; // Futuramente virá do banco de dados
            const photo = user.photoURL || `${basePath}/assets/img/odin-logo.png`;

            userArea.innerHTML = `
                <div class="text-right hidden md:block cursor-pointer" onclick="window.logoutODIN()">
                    <p class="text-white text-xs font-bold group-hover:text-neon-cyan transition">${user.displayName}</p>
                    <p class="text-gray-500 text-[10px] font-mono tracking-wider text-neon-green">ONLINE • ${role}</p>
                </div>
                <div class="relative group cursor-pointer" onclick="window.logoutODIN()">
                    <img src="${photo}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner group-hover:border-neon-cyan transition-all object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
                    <div class="absolute right-0 top-12 w-32 bg-dark-800 border border-dark-600 rounded p-2 opacity-0 group-hover:opacity-100 transition invisible group-hover:visible text-center pointer-events-none z-50">
                        <span class="text-[10px] text-red-400 font-bold">Sair do Sistema</span>
                    </div>
                </div>
            `;
        }
    }, 100);
}

// Funções Globais de Acesso
window.loginODIN = () => {
    if (!auth) return alert("Erro no Sistema de Login.");
    auth.signInWithPopup(provider).catch((error) => {
        console.error(error);
        alert("Falha no login: " + error.message);
    });
};

window.logoutODIN = () => {
    if (confirm("Deseja encerrar a sessão ODIN?")) {
        auth.signOut().then(() => {
            window.location.href = basePath + "/login.html";
        });
    }
};

// Componentes UI (Header/Footer/Menu)
function loadHeader() {
    const path = window.location.pathname;
    const pageName = path.split("/").pop() || 'index.html';
    const isActive = (n) => pageName.includes(n) ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    const pagesPath = isPagesDir ? '.' : './pages'; // Correção de caminho relativo

    const headerHTML = `
    <header class="fixed w-full top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 h-24 flex items-center transition-all duration-300">
        <nav class="container mx-auto px-6 flex justify-between items-center h-full">
            <a href="${basePath}/index.html" class="flex items-center group gap-4">
                <div class="relative w-14 h-14 flex-none rounded-full overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300 ring-2 ring-transparent group-hover:ring-neon-cyan">
                    <img src="${basePath}/assets/img/odin-logo.png" alt="Odin" class="w-full h-full object-cover">
                </div>
                <div class="flex flex-col">
                    <span class="text-white font-black tracking-[0.2em] text-2xl leading-none group-hover:text-neon-cyan transition duration-300">ODIN</span>
                    <span class="text-[10px] text-gray-500 uppercase tracking-[0.35em] leading-none mt-1 font-mono">Operating System</span>
                </div>
            </a>
            <div class="hidden xl:flex items-center bg-dark-800/50 border border-dark-600 rounded-full p-1.5 backdrop-blur-xl shadow-2xl">
                <a href="${pagesPath}/secretaria.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('secretaria')}"><i class="fas fa-folder-open text-xs"></i> Secretaria</a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/financeiro.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('financeiro')}"><i class="fas fa-wallet text-xs"></i> Financeiro</a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/pedagogico.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('pedagogico')}"><i class="fas fa-brain text-xs"></i> Pedagógico</a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/comercial.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('comercial')}"><i class="fas fa-rocket text-xs"></i> Comercial</a>
            </div>
            <div class="hidden lg:flex items-center gap-6">
                <button class="relative text-gray-400 hover:text-white transition"><i class="fas fa-bell text-xl"></i><span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-red rounded-full border-2 border-dark-900"></span></button>
                <div class="h-8 w-px bg-dark-700"></div>
                <div id="user-area" class="flex items-center gap-3 transition-all min-w-[150px] justify-end">
                    <div class="w-24 h-3 bg-dark-700 rounded animate-pulse"></div>
                </div>
            </div>
            <button id="mobile-menu-btn" class="xl:hidden text-white text-2xl hover:text-neon-cyan transition"><i class="fas fa-bars"></i></button>
        </nav>
    </header>`;
    
    const ph = document.getElementById('header-placeholder');
    if(ph) ph.innerHTML = headerHTML;
}

function loadFooter() {
    const footerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon-violet to-transparent opacity-50"></div><div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono"><div class="flex items-center gap-2"><i class="fas fa-circle text-[6px] text-neon-green animate-pulse"></i><span>ODIN SYSTEM <span class="text-dark-700">|</span> v8.0 SECURITY</span></div><div class="mt-4 md:mt-0 flex gap-6"><a href="#" class="hover:text-neon-cyan transition">Status</a><a href="#" class="hover:text-neon-cyan transition">Docs</a></div></div></footer>`;
    const ph = document.getElementById('footer-placeholder');
    if(ph) ph.innerHTML = footerHTML;
}

function setFavicon() {
    const existing = document.querySelectorAll("link[rel*='icon']"); existing.forEach(e=>e.remove());
    const link = document.createElement('link'); link.type = 'image/png'; link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png?v=${Date.now()}`;
    document.head.appendChild(link);
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    if(btn) btn.addEventListener('click', () => alert('ODIN Mobile: Use tablet resolution.'));
}