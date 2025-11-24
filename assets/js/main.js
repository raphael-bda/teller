// --- IMPORTAÇÕES DO FIREBASE (Via CDN para funcionar direto no browser) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- SUAS CREDENCIAIS (Odin System) ---
const firebaseConfig = {
  apiKey: "AIzaSyBM5ZzM3zBVpIPj1Ln35F65jw7i_GZdb_I",
  authDomain: "odin-system-47a30.firebaseapp.com",
  projectId: "odin-system-47a30",
  storageBucket: "odin-system-47a30.firebasestorage.app",
  messagingSenderId: "1085403407316",
  appId: "1:1085403407316:web:45d7ce483ecb81a7faec41",
  measurementId: "G-RYPN4Q1DE9"
};

// --- INICIALIZAÇÃO DO SISTEMA ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", function() {
    setFavicon();
    loadHeader(); 
    loadFooter();
    initMobileMenu();
    initAuthListener(); // Inicia o vigia de login
});

// Caminhos relativos
const isPagesDir = window.location.pathname.includes('/pages/');
const basePath = isPagesDir ? '..' : '.'; 
const pagesPath = isPagesDir ? '.' : './pages'; 

// 1. LÓGICA DE AUTENTICAÇÃO (LOGIN/LOGOUT)
function initAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const userArea = document.getElementById('user-area');
        if (!userArea) return;

        if (user) {
            // -- USUÁRIO LOGADO --
            // Se não tiver foto, usa o logo do Odin como fallback
            const displayName = user.displayName || "Operador Odin";
            const photoURL = user.photoURL || `${basePath}/assets/img/odin-logo.png`;
            
            userArea.innerHTML = `
                <div class="text-right hidden md:block">
                    <p class="text-white text-xs font-bold group-hover:text-neon-cyan transition">${displayName}</p>
                    <p class="text-gray-500 text-[10px] font-mono tracking-wider text-neon-green">ONLINE • GOOGLE ID</p>
                </div>
                <div class="relative group cursor-pointer" onclick="window.logoutODIN()">
                    <img src="${photoURL}" class="w-10 h-10 rounded-lg border border-dark-600 shadow-inner group-hover:border-neon-cyan transition-all object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-neon-green border-2 border-dark-900 rounded-full"></div>
                    
                    <div class="absolute right-0 top-12 w-32 bg-dark-800 border border-dark-600 rounded p-2 opacity-0 group-hover:opacity-100 transition invisible group-hover:visible text-center pointer-events-none z-50">
                        <span class="text-[10px] text-red-400 font-bold">Clique para Sair</span>
                    </div>
                </div>
            `;
        } else {
            // -- USUÁRIO DESLOGADO --
            userArea.innerHTML = `
                <button onclick="window.loginODIN()" class="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/50 rounded text-neon-cyan hover:bg-neon-cyan hover:text-dark-900 transition font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <i class="fab fa-google"></i> Acessar
                </button>
            `;
        }
    });
}

// Funções globais para o HTML acessar
window.loginODIN = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Login OK:", result.user.displayName);
        }).catch((error) => {
            console.error("Erro Login:", error);
            alert("Erro ao conectar com Google. Verifique o console.");
        });
};

window.logoutODIN = () => {
    if(confirm("Desconectar do ODIN?")) {
        signOut(auth).then(() => {
            console.log("Desconectado");
        });
    }
};

// 2. UI & COMPONENTES
function setFavicon() {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach(icon => icon.remove());
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = `${basePath}/assets/img/odin-logo.png?v=${new Date().getTime()}`;
    document.getElementsByTagName('head')[0].appendChild(link);
}

function loadHeader() {
    const path = window.location.pathname;
    const pageName = path.split("/").pop() || 'index.html';

    const isActive = (name) => {
        return pageName.includes(name) 
            ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(0,240,255,0.15)] border-white/20' 
            : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent';
    };

    const headerHTML = `
    <header class="fixed w-full top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 h-24 flex items-center transition-all duration-300">
        <nav class="container mx-auto px-6 flex justify-between items-center h-full">
            
            <a href="${basePath}/index.html" class="flex items-center group gap-4">
                <div class="relative w-14 h-14 flex-none rounded-full overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all duration-300 ring-2 ring-transparent group-hover:ring-neon-cyan">
                    <img src="${basePath}/assets/img/odin-logo.png" alt="Odin Logo" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                </div>
                <div class="flex flex-col">
                    <span class="text-white font-black tracking-[0.2em] text-2xl leading-none group-hover:text-neon-cyan transition duration-300">ODIN</span>
                    <span class="text-[10px] text-gray-500 uppercase tracking-[0.35em] leading-none mt-1 font-mono">Operating System</span>
                </div>
            </a>
            
            <div class="hidden xl:flex items-center bg-dark-800/50 border border-dark-600 rounded-full p-1.5 backdrop-blur-xl shadow-2xl">
                <a href="${pagesPath}/secretaria.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('secretaria')}">
                    <i class="fas fa-folder-open text-xs"></i> Secretaria
                </a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/financeiro.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('financeiro')}">
                    <i class="fas fa-wallet text-xs"></i> Financeiro
                </a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/pedagogico.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('pedagogico')}">
                    <i class="fas fa-brain text-xs"></i> Pedagógico
                </a>
                <div class="w-px h-4 bg-dark-600 mx-1"></div>
                <a href="${pagesPath}/comercial.html" class="px-6 py-2.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all duration-300 border ${isActive('comercial')}">
                    <i class="fas fa-rocket text-xs"></i> Comercial
                </a>
            </div>

            <div class="hidden lg:flex items-center gap-6">
                <button class="relative text-gray-400 hover:text-white transition">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-neon-red rounded-full border-2 border-dark-900"></span>
                </button>
                <div class="h-8 w-px bg-dark-700"></div>
                
                <div id="user-area" class="flex items-center gap-3 transition-all min-w-[150px] justify-end">
                    <div class="w-24 h-3 bg-dark-700 rounded animate-pulse"></div> </div>
            </div>

            <button id="mobile-menu-btn" class="xl:hidden text-white text-2xl hover:text-neon-cyan transition"><i class="fas fa-bars"></i></button>
        </nav>
    </header>
    `;
    document.getElementById('header-placeholder').innerHTML = headerHTML;
}

function loadFooter() {
    const footerHTML = `
    <footer class="mt-auto border-t border-dark-800 bg-dark-900 py-8 relative overflow-hidden">
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-neon-violet to-transparent opacity-50"></div>
        <div class="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-mono">
            <div class="flex items-center gap-2">
                <i class="fas fa-circle text-[6px] text-neon-green animate-pulse"></i>
                <span>ODIN SYSTEM <span class="text-dark-700">|</span> v7.0 AUTH</span>
            </div>
            <div class="mt-4 md:mt-0 flex gap-6">
                <a href="#" class="hover:text-neon-cyan transition">Status</a>
                <a href="#" class="hover:text-neon-cyan transition">Docs</a>
                <a href="#" class="hover:text-neon-cyan transition">Logout</a>
            </div>
        </div>
    </footer>`;
    document.getElementById('footer-placeholder').innerHTML = footerHTML;
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    if(btn) btn.addEventListener('click', () => alert('ODIN Mobile: Use tablet resolution.'));
}