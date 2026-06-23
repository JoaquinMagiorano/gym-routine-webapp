const THEME_KEY = 'gymAppTheme';
const LIGHT_THEME = 'light-theme';
const DARK_THEME = 'dark-theme';

//Inicializa el tema basado en localStorage, osea el ultimo tema que dejo el usuario 
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const htmlElement = document.documentElement;
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Intenta detectar la preferencia del sistema para la primera vez (no es mucho pero es trabajo honesto)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? DARK_THEME : LIGHT_THEME;
        applyTheme(defaultTheme);
        localStorage.setItem(THEME_KEY, defaultTheme);
    }
}

function applyTheme(theme) {
    const htmlElement = document.documentElement;
    const button = document.getElementById('themeToggleBtn');

    htmlElement.classList.remove(LIGHT_THEME, DARK_THEME);
    
    if (theme === LIGHT_THEME) {
        htmlElement.classList.add(LIGHT_THEME);
        htmlElement.setAttribute('data-bs-theme', 'light');

        if (button) {
            button.innerHTML = '<i class="bi bi-moon-fill"></i>';
            button.title = 'Cambiar a modo oscuro';
        }
    } else {
        htmlElement.classList.add(DARK_THEME);
        htmlElement.setAttribute('data-bs-theme', 'dark');
        
        if (button) {
            button.innerHTML = '<i class="bi bi-sun-fill"></i>';
            button.title = 'Cambiar a modo claro';
        }
    }
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const isLightTheme = htmlElement.classList.contains(LIGHT_THEME);
    const newTheme = isLightTheme ? DARK_THEME : LIGHT_THEME;
    
    applyTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    
    //console.log(`Tema cambiado a: ${newTheme}`);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});