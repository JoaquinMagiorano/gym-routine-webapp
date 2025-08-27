// Configuración de rutinas por día
const defaultRoutines = {
    0: { // Domingo
        name: "Descanso",
        exercises: []
    },
    1: { // Lunes
        name: "Pecho, Espalda y Bíceps",
        exercises: [
            { name: "Pecho: Press plano", sets: "3x8 - 15kg", completed: false },
            { name: "Pecho: Press inclinado", sets: "3x10 - 15kg", completed: false },
            { name: "Pecho: Cruces de polea", sets: "3x10 - 10kg", completed: false },
            { name: "Espalda: Remo con agarre amplio", sets: "3x10 - 20kg", completed: false },
            { name: "Espalda: Remo con agarre cerrado", sets: "3x10 - 35kg", completed: false },
            { name: "Espalda: Tirón de polea al pecho con agarre ancho", sets: "3x10 - 35kg", completed: false },
            { name: "Bíceps: Curl con barra W", sets: "3x8 - 10kg", completed: false },
            { name: "Bíceps: Curl con barra H", sets: "3x10 - 5kg", completed: false },
            { name: "Bíceps: Drag curl", sets: "3x10 - 10kg", completed: false },
            { name: "Antebrazo", sets: "3x15 - 20kg", completed: false },
        ]
    },
    2: { // Martes
        name: "Piernas, Hombros y Tríceps",
        exercises: [
            { name: "Hombros: Press militar", sets: "3x10 - 15kg", completed: false },
            { name: "Hombros: Face pulls", sets: "3x10 - 20kg", completed: false },
            { name: "Hombros: Elevaciones laterales con polea", sets: "3x10 - 10kg", completed: false },
            { name: "Tríceps: Tirón de polea", sets: "3x10 - 25kg", completed: false },
            { name: "Tríceps: Extensión inclinada por encima (polea alta)", sets: "3x10 - 30kg", completed: false },
            { name: "Tríceps: Extensión unilateral por encima (polea baja)", sets: "3x10 - 10", completed: false },
            { name: "Piernas: Prensa", sets: "3x10 - 40kg", completed: false },
            { name: "Piernas: Maquina de isquios", sets: "3x10 - 30kg", completed: false },
            { name: "Piernas: Maquina de cuádriceps", sets: "3x10 - 30kg", completed: false },
            { name: "Gemelos", sets: "3x20 - 30kg", completed: false },
        ]
    },
    3: { // Miércoles
        name: "Descanso",
        exercises: []
    },
    4: { // Jueves
        name: "Pecho, Espalda y Bíceps",
        exercises: [
            { name: "Pecho: Press plano", sets: "3x8 - 15kg", completed: false },
            { name: "Pecho: Press inclinado", sets: "3x10 - 15kg", completed: false },
            { name: "Pecho: Cruces de polea", sets: "3x10 - 10kg", completed: false },
            { name: "Espalda: Remo con agarre amplio", sets: "3x10 - 20kg", completed: false },
            { name: "Espalda: Remo con agarre cerrado", sets: "3x10 - 35kg", completed: false },
            { name: "Espalda: Tirón de polea al pecho con agarre ancho", sets: "3x10 - 35kg", completed: false },
            { name: "Bíceps: Curl con barra W", sets: "3x8 - 10kg", completed: false },
            { name: "Bíceps: Curl con barra H", sets: "3x10 - 5kg", completed: false },
            { name: "Bíceps: Drag curl", sets: "3x10 - 10kg", completed: false },
            { name: "Antebrazo", sets: "3x15 - 20kg", completed: false },
        ]
    },
    5: { // Viernes
        name: "Piernas, Hombros y Tríceps",
        exercises: [
            { name: "Hombros: Press militar", sets: "3x10 - 15kg", completed: false },
            { name: "Hombros: Face pulls", sets: "3x10 - 20kg", completed: false },
            { name: "Hombros: Elevaciones laterales con polea", sets: "3x10 - 10kg", completed: false },
            { name: "Tríceps: Tirón de polea", sets: "3x10 - 25kg", completed: false },
            { name: "Tríceps: Extensión inclinada por encima (polea alta)", sets: "3x10 - 30kg", completed: false },
            { name: "Tríceps: Extensión unilateral por encima (polea baja)", sets: "3x10 - 10", completed: false },
            { name: "Piernas: Prensa", sets: "3x10 - 40kg", completed: false },
            { name: "Piernas: Maquina de isquios", sets: "3x10 - 30kg", completed: false },
            { name: "Piernas: Maquina de cuádriceps", sets: "3x10 - 30kg", completed: false },
            { name: "Gemelos", sets: "3x20 - 30kg", completed: false },
        ]
    },
    6: { // Sábado
        name: "Descanso",
        exercises: []
    }
};

let routines = {};
let isEditMode = false;
let currentDay = new Date().getDay();

// Inicializar la aplicación
function initApp() {
    loadRoutines();
    displayCurrentDay();
    updateStats();
}

// Cargar rutinas desde localStorage o usar las por defecto
function loadRoutines() {
    const saved = localStorage.getItem('gymRoutines');
    if (saved) {
        routines = JSON.parse(saved);
    } else {
        routines = JSON.parse(JSON.stringify(defaultRoutines));
        saveRoutines();
    }
}

// Guardar rutinas en localStorage
function saveRoutines() {
    localStorage.setItem('gymRoutines', JSON.stringify(routines));
}

// Mostrar el día actual
function displayCurrentDay() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date();
    currentDay = today.getDay();

    document.getElementById('dayTitle').textContent = 
        `${days[currentDay]} - ${routines[currentDay].name}`;
    
    document.getElementById('dayDate').textContent = 
        today.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

    displayRoutine();
}

// Mostrar la rutina del día
function displayRoutine() {
    const routine = routines[currentDay];
    const content = document.getElementById('routineContent');

    if (routine.exercises.length === 0) {
        content.innerHTML = `
            <div class="rest-day">
                <i class="bi bi-cup-hot" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3">Día de descanso</h4>
                <p>¡Disfruta tu día libre! Tu cuerpo necesita recuperarse.</p>
                ${isEditMode ? '<button class="btn btn-outline-primary mt-3" onclick="addExercise()">Agregar ejercicio</button>' : ''}
            </div>
        `;
    } else {
        let html = '';
        routine.exercises.forEach((exercise, index) => {
            html += createExerciseHTML(exercise, index);
        });
        
        if (isEditMode) {
            html += `
                <div class="text-center mt-3">
                    <button class="btn btn-outline-success" onclick="addExercise()">
                        <i class="bi bi-plus-circle me-2"></i>Agregar ejercicio
                    </button>
                </div>
            `;
        }
        
        content.innerHTML = html;
    }
    
    updateProgress();
}

// Crear HTML para un ejercicio
function createExerciseHTML(exercise, index) {
    const editControls = isEditMode ? `
        <div class="mt-2">
            <button class="btn btn-sm btn-outline-danger" onclick="removeExercise(${index})">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning ms-2" onclick="editExercise(${index})">
                <i class="bi bi-pencil"></i>
            </button>
        </div>
    ` : '';

    return `
        <div class="exercise-item ${exercise.completed ? 'completed' : ''}" ${isEditMode ? 'style="border: 2px dashed #ffc107; background: rgba(255, 193, 7, 0.1);"' : ''}>
            <div class="d-flex align-items-center">
                <input type="checkbox" 
                        class="form-check-input exercise-checkbox" 
                        ${exercise.completed ? 'checked' : ''} 
                        onchange="toggleExercise(${index})"
                        ${isEditMode ? 'disabled' : ''}>
                <div class="flex-grow-1">
                    <h6 class="mb-1 ${exercise.completed ? 'text-decoration-line-through' : ''}">${exercise.name}</h6>
                    <div class="exercise-details">${exercise.sets}</div>
                </div>
                ${exercise.completed ? '<i class="bi bi-check-circle-fill text-success"></i>' : ''}
            </div>
            ${editControls}
        </div>
    `;
}

// Toggle completado de ejercicio
function toggleExercise(index) {
    routines[currentDay].exercises[index].completed = !routines[currentDay].exercises[index].completed;
    saveRoutines();
    displayRoutine();
    updateStats();
}

// Actualizar progreso y estadísticas
function updateProgress() {
    const routine = routines[currentDay];
    if (routine.exercises.length === 0) {
        document.getElementById('progressFill').style.width = '0%';
        return;
    }

    const completed = routine.exercises.filter(ex => ex.completed).length;
    const total = routine.exercises.length;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('progressFill').style.width = percentage + '%';
}

// Actualizar estadísticas
function updateStats() {
    const routine = routines[currentDay];
    const total = routine.exercises.length;
    const completed = routine.exercises.filter(ex => ex.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('todayTotal').textContent = total;
    document.getElementById('todayCompleted').textContent = completed;
    document.getElementById('todayProgress').textContent = percentage + '%';
}

// Toggle modo edición
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.getElementById('editBtn');
    
    if (isEditMode) {
        editBtn.innerHTML = '<i class="bi bi-check-square"></i>';
        editBtn.style.background = 'rgba(40, 167, 69, 0.8)';
    } else {
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    }
    
    displayRoutine();
}

// Agregar ejercicio
function addExercise() {
    const name = prompt("Nombre del ejercicio:");
    if (!name) return;
    
    const sets = prompt("Series y repeticiones (ej: 3x10):");
    if (!sets) return;

    routines[currentDay].exercises.push({
        name: name,
        sets: sets,
        completed: false
    });

    saveRoutines();
    displayRoutine();
    updateStats();
}

// Eliminar ejercicio
function removeExercise(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este ejercicio?")) {
        routines[currentDay].exercises.splice(index, 1);
        saveRoutines();
        displayRoutine();
        updateStats();
    }
}

// Editar ejercicio
function editExercise(index) {
    const exercise = routines[currentDay].exercises[index];
    
    const newName = prompt("Nombre del ejercicio:", exercise.name);
    if (newName === null) return;
    
    const newSets = prompt("Series y repeticiones:", exercise.sets);
    if (newSets === null) return;

    routines[currentDay].exercises[index].name = newName || exercise.name;
    routines[currentDay].exercises[index].sets = newSets || exercise.sets;

    saveRoutines();
    displayRoutine();
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', initApp);