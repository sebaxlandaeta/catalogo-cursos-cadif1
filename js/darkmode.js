'use strict';

const btnDark = document.getElementById('darkMode');
const btnLight = document.getElementById('lightMode');
const htmlElement = document.documentElement;


function inicializarTema() {
    const temaGuardado = localStorage.getItem('theme');
    
    if (temaGuardado === 'dark' || (!temaGuardado && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
}

function activarModoOscuro() {
    htmlElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
}

function activarModoClaro() {
    htmlElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
}

if (btnDark) {
    btnDark.addEventListener('click', activarModoOscuro);
}

if (btnLight) {
    btnLight.addEventListener('click', activarModoClaro);
}

inicializarTema();