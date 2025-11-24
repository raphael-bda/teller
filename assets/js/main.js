// assets/js/main.js (Versão Final: Auth + RBAC + UI)

// --- CONFIGURAÇÃO DE PERMISSÕES ---
// Adicione aqui os e-mails que terão acesso TOTAL (Admin)
const ADMIN_EMAILS = [
    "seu.email.real@gmail.com", // <--- COLOQUE SEU EMAIL AQUI
    "raphael.admin@odin.com"
];

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

let auth, provider;
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    provider = new firebase.auth.GoogleAuthProvider();
}

const isPagesDir = window.location.pathname.includes('/pages/');
const isLoginPage = window.location.pathname.includes('login.html');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages';

document.addEventListener("DOMContentLoaded", function() {
    if (!isLoginPage) {
        loadHeader(); 
        loadFooter();
        setFavicon();
        initMobileMenu();
    }
    if (auth) initAuthListener();
});

// --- LÓGICA DE AUTENTICAÇÃO & ROTAS ---
function initAuthListener() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // USUÁRIO LOGADO
            const role = ADMIN_EMAILS.includes(user.email) ? 'ADMIN' : 'OPERADOR';
            
            // Salva dados para uso global
            localStorage.setItem('ODIN_USER_ROLE', role);
            localStorage.setItem('ODIN_USER_EMAIL', user.email);
            localStorage.setItem('ODIN_USER_NAME', user.displayName);
            localStorage.setItem('ODIN_USER_PHOTO', user.photoURL);

            // Se estiver na página de login, manda pra Home
            if (isLoginPage) {
                window.location.href = "index.html"; 
            } else {
                updateUserInterface(user, role);
                applyPermissions(role); // Aplica regras de visualização
            }

        } else {
            // USUÁRIO DESLOGADO
            if (!isLoginPage) {
                // Chuta para o login (Descomente para produção)
                // window.location.href = basePath + "/login.html";
                
                // Para DEV: Mostra botão de login no header
                const userArea = document.getElementById('user-area');
                if(userArea) userArea.innerHTML = `<button onclick="window.loginODIN()" class="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-xs uppercase tracking-wider"><i class="fab fa-google"></i> Entrar</button>`;
            }
        }
    });
}

function updateUserInterface(user, role) {
    const userArea = document.getElementById('user-area');
    if (!userArea) return;

    const roleColor = role === 'ADMIN' ? 'text-neon-cyan' : 'text-gray-400';
    const photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
    
    userArea.innerHTML = `
        <div class="text-right hidden md:block cursor-pointer" onclick="openConfigModal()">
            <p class="text-white text-xs font-bold hover:text-neon-cyan transition">${user.displayName}</p>
            <p class="text-[10px] font-mono tracking-wider ${roleColor}">${role}</p>
        </div>
        <div class="relative group cursor-pointer" onclick="openConfigModal()">
            <img src="${photoURL}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner hover:border-neon-cyan transition-all object-cover">
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
        </div>
    `;
}

// --- SISTEMA DE PERMISSÕES (RBAC) ---
function applyPermissions(role) {
    if (role !== 'ADMIN') {
        // Exemplo: Esconde botão de 'Resetar Sistema' para quem não é admin
        const dangerousButtons = document.querySelectorAll('.admin-only');
        dangerousButtons.forEach(el => el.style.display = 'none');
        
        // Se quiser esconder o Financeiro de não-admins, descomente:
        // const financeLink = document.querySelector('a[href*="financeiro"]');
        // if(financeLink) financeLink.style.display = 'none';
    }
}

// --- FUNÇÕES GLOBAIS ---
window.loginODIN = () => {
    auth.signInWithPopup(provider).catch((error) => alert("Erro Login: " + error.message));
};

window.logoutODIN = () => {
    auth.signOut().then(() => {
        localStorage.clear();
        window.location.href = basePath + "/login.html";
    });
};

// --- MODAL DE CONFIGURAÇÕES ---
window.openConfigModal = () => {
    const role = localStorage.getItem('ODIN_USER_ROLE');
    const name = localStorage.getItem('ODIN_USER_NAME');
    const email = localStorage.getItem('ODIN_USER_EMAIL');
    const photo = localStorage.getItem('ODIN_USER_PHOTO');

    document.getElementById('modal-user-name').innerText = name;
    document.getElementById('modal-user-email').innerText = email;
    document.getElementById('modal-user-photo').src = photo;
    document.getElementById('modal-user-role').innerText = role;
    
    // Mostra painel admin se for admin
    const adminPanel = document.getElementById('admin-settings');
    if(role === 'ADMIN') {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }

    document.getElementById('config-modal').classList.remove('hidden');
}

window.closeConfigModal = () => {
    document.getElementById('config-modal').classList.add('hidden');
}

// --- UI COMPONENTS (Header + Modal Injetado) ---
function loadHeader() {
    const path = window.location.pathname;
    const pageName = path.split("/").pop() || 'index.html';
    const isActive = (n) => pageName.includes(n) ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';

    const headerHTML = `
    <div id="config-modal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-neon-cyan/10">
            <button onclick="closeConfigModal()" class="absolute top-4 right-4 text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
            <div class="text-center mb-6">
                <img id="modal-user-photo" src="" class="w-20 h-20 rounded-full mx-auto border-2 border-neon-cyan mb-3 object-cover">
                <h2 id="modal-user-name" class="text-xl font-bold text-white">...</h2>
                <span id="modal-user-role" class="text-xs font-mono bg-dark-900 px-3 py-1 rounded border border-dark-600 text-neon-cyan mt-2 inline-block">...</span>
            </div>
            <div class="space-y-4">
                <div class="bg-dark-900 p-4 rounded border border-dark-600">
                    <h3 class="text-xs uppercase font-bold text-gray-500 mb-2">Dados da Conta</h3>
                    <div class="flex justify-between items-center text-sm text-gray-300 mb-2"><span>E-mail</span><span id="modal-user-email" class="text-gray-500 text-xs">...</span></div>
                    <div class="flex justify-between items-center text-sm text-gray-300"><span>Tema</span><span class="text-neon-green text-xs">ODIN DARK</span></div>
                </div>
                <div id="admin-settings" class="bg-red-900/10 p-4 rounded border border-red-900/30 hidden">
                    <h3 class="text-xs uppercase font-bold text-red-400 mb-2"><i class="fas fa-lock mr-1"></i> Painel Admin</h3>
                    <p class="text-[10px] text-gray-400 mb-3">Acesso privilegiado detectado.</p>
                    <button class="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 py-2 rounded text-xs font-bold transition">Gerenciar Usuários</button>
                </div>
                <button onclick="window.logoutODIN()" class="w-full bg-dark-700 hover:bg-red-600 text-white py-3 rounded font-bold transition flex items-center justify-center gap-2"><i class="fas fa-sign-out-alt"></i> Sair</button>
            </div>
        </div>
    </div>

    <header class="fixed w-full top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 h-24 flex items-center transition-all duration-300">
        <nav class="container mx-auto px-6 flex justify-between items-center h-full">
            <a href="${basePath}/index.html" class="flex items-center group gap-4">
                <div class="relative w-14 h-14 flex-none rounded-full overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300 ring-2 ring-transparent group-hover:ring-neon-cyan"><img src="${basePath}/assets/img/odin-logo.png" class="w-full h-full object-cover"></div>
                <div class="flex flex-col"><span class="text-white font-black tracking-[0.2em] text-2xl leading-none group-hover:text-neon-cyan transition duration-300">ODIN</span><span class="text-[10px] text-gray-500 uppercase tracking-[0.35em] leading-none mt-1 font-mono">OS</span></div>
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
                <div id="user-area" class="flex items-center gap-3 transition-all min-w-[150px] justify-end"><div class="w-24 h-3 bg-dark-700 rounded animate-pulse"></div></div>
            </div>
            <button id="mobile-menu-btn" class="xl:hidden text-white text-2xl hover:text-neon-cyan transition"><i class="fas fa-bars"></i></button>
        </nav>
    </header>`;
    
    if(document.getElementById('header-placeholder')) document.getElementById('header-placeholder').innerHTML = headerHTML;
}

function loadFooter() {
    const footerHTML = `<footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden"><div class="container mx-auto px-6 text-center text-xs text-gray-600 font-mono">ODIN SYSTEM v8.0 | AUTH SECURE</div></footer>`;
    if(document.getElementById('footer-placeholder')) document.getElementById('footer-placeholder').innerHTML = footerHTML;
}

function setFavicon() {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(icon => icon.remove());
    const link = document.createElement('link'); link.type = 'image/png'; link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png`;
    document.head.appendChild(link);
}

function initMobileMenu() { /* ... */ }