// Rutinas default
const defaultBaseRoutines = {
    1: { // Rutina 1: Lunes y Jueves
        name: "Pecho, Espalda y Bíceps",
        exercises: [
            { name: "Pecho: Press plano", sets: "3x8 - 15kg", completed: false },
            { name: "Pecho: Press inclinado", sets: "3x10 - 8kg", completed: false },
            { name: "Pecho: Cruces de polea", sets: "3x10 - 10kg", completed: false },
            { name: "Espalda: Remo con agarre amplio", sets: "3x10 - 25kg", completed: false },
            { name: "Espalda: Remo con agarre cerrado", sets: "3x10 - 40kg", completed: false },
            { name: "Espalda: Tirón de polea al pecho con agarre ancho", sets: "3x10 - 40kg", completed: false },
            { name: "Bíceps: Curl con barra W", sets: "3x10 - 20kg", completed: false },
            { name: "Bíceps: Curl con barra H", sets: "3x10 - 5kg", completed: false },
            { name: "Bíceps: Drag curl", sets: "3x10 - 15kg", completed: false },
            { name: "Antebrazos", sets: "3x15 - 20kg", completed: false },
        ]
    },
    2: { // Rutina 2: Martes y Viernes
        name: "Piernas, Hombros y Tríceps",
        exercises: [
            { name: "Hombros: Press militar", sets: "3x10 - 20kg", completed: false },
            { name: "Hombros: Face pulls", sets: "3x10 - 25kg", completed: false },
            { name: "Hombros: Elevaciones laterales con polea", sets: "3x10 - 10kg", completed: false },
            { name: "Antebrazos", sets: "3x15 - 20kg", completed: false },
            { name: "Tríceps: Tirón de polea", sets: "3x10 - 25kg", completed: false },
            { name: "Tríceps: Extensión inclinada por encima (polea alta)", sets: "3x10 - 30kg", completed: false },
            { name: "Tríceps: Extensión unilateral por encima (polea baja)", sets: "3x10 - 10kg", completed: false },
            { name: "Piernas: Prensa", sets: "3x10 - 40kg", completed: false },
            { name: "Piernas: Maquina de isquios", sets: "3x10 - 30kg", completed: false },
            { name: "Piernas: Maquina de cuádriceps", sets: "3x10 - 30kg", completed: false },
            { name: "Gemelos", sets: "3x20 - 30kg", completed: false },
        ]
    }
};

// Mapeo de días a rutinas
const dayToRoutineMap = {
    0: null, // Domingo - Descanso
    1: 1,    // Lunes - Rutina 1
    2: 2,    // Martes - Rutina 2  
    3: null, // Miércoles - Descanso
    4: 1,    // Jueves - Rutina 1
    5: 2,    // Viernes - Rutina 2
    6: null  // Sábado - Descanso
};

const restDayInfo = {
    name: "Descanso",
    exercises: []
};

let baseRoutines = {};
let isEditMode = false;
let currentDay = new Date().getDay();

function initApp() {
    loadRoutines();
    resetAllExercisesToIncomplete();
    displayCurrentDay();
    updateStats();
}

function loadRoutines() {
    const saved = localStorage.getItem('gymBaseRoutines');
    if (saved) {
        baseRoutines = JSON.parse(saved);
        console.log('📁 Rutinas cargadas desde localStorage');
    } else {
        // Primera vez - cargar rutinas por defecto
        baseRoutines = JSON.parse(JSON.stringify(defaultBaseRoutines));
        saveRoutines();
        console.log('🔄 Rutinas por defecto inicializadas');
    }
}

function resetAllExercisesToIncomplete() {
    console.log('🔄 Reseteando todos los ejercicios a no completados...');
    
    // Solo resetear las rutinas base (1 y 2)
    Object.keys(baseRoutines).forEach(routineKey => {
        if (baseRoutines[routineKey].exercises && baseRoutines[routineKey].exercises.length > 0) {
            baseRoutines[routineKey].exercises.forEach(exercise => {
                exercise.completed = false;
            });
        }
    });
    
    saveRoutines();
    console.log('✅ Todos los ejercicios reseteados correctamente');
}

function saveRoutines() {
    localStorage.setItem('gymBaseRoutines', JSON.stringify(baseRoutines));
    console.log('💾 Rutinas guardadas en localStorage');
}

function getCurrentRoutine() {
    const routineNumber = dayToRoutineMap[currentDay];
    if (routineNumber === null) {
        return restDayInfo;
    }
    return baseRoutines[routineNumber];
}

function displayCurrentDay() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date();
    currentDay = today.getDay();
    
    const currentRoutine = getCurrentRoutine();
    const routineNumber = dayToRoutineMap[currentDay];
    
    let titleText = `${days[currentDay]} - ${currentRoutine.name}`;
    if (routineNumber !== null) {
        titleText += ` (Rutina ${routineNumber})`;
    }

    document.getElementById('dayTitle').textContent = titleText;
    
    document.getElementById('dayDate').textContent = 
        today.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

    displayRoutine();
}

function displayRoutine() {
    const routine = getCurrentRoutine();
    const content = document.getElementById('routineContent');

    if (routine.exercises.length === 0) {
        content.innerHTML = `
            <div class="rest-day">
                <i class="bi bi-cup-hot" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3">Día de descanso</h4>
                <p>¡Disfruta tu día libre! Tu cuerpo necesita recuperarse.</p>
                ${isEditMode && dayToRoutineMap[currentDay] !== null ? '<button class="btn btn-outline-primary mt-3" onclick="addExercise()">Agregar ejercicio</button>' : ''}
            </div>
        `;
    } else {
        let html = '';
        routine.exercises.forEach((exercise, index) => {
            html += createExerciseHTML(exercise, index);
        });
        
        if (isEditMode && dayToRoutineMap[currentDay] !== null) {
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
    
    // Mostrar información adicional en modo edición
    if (isEditMode && dayToRoutineMap[currentDay] !== null) {
        const routineNumber = dayToRoutineMap[currentDay];
        const sharedDays = Object.keys(dayToRoutineMap)
            .filter(day => dayToRoutineMap[day] === routineNumber)
            .map(day => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day]);
        
        content.innerHTML = `
            <div class="alert alert-info mb-3">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Modo Edición:</strong> Los cambios se guardarán para todos los días que usan esta rutina: <strong>${sharedDays.join(', ')}</strong>
            </div>
        ` + content.innerHTML;
    }
    
    updateProgress();
}

function createExerciseHTML(exercise, index) {
    const canEdit = isEditMode && dayToRoutineMap[currentDay] !== null;
    const editControls = canEdit ? `
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
        <div class="exercise-item ${exercise.completed ? 'completed' : ''}" ${canEdit ? 'style="border: 2px dashed #ffc107; background: rgba(255, 193, 7, 0.1);"' : ''}>
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

function toggleExercise(index) {
    const routineNumber = dayToRoutineMap[currentDay];
    if (routineNumber === null) return;
    
    baseRoutines[routineNumber].exercises[index].completed = !baseRoutines[routineNumber].exercises[index].completed;
    saveRoutines();
    displayRoutine();
    updateStats();
    
    console.log(`✅ Ejercicio ${index + 1} de la rutina ${routineNumber} ${baseRoutines[routineNumber].exercises[index].completed ? 'completado' : 'desmarcado'}`);
}

function updateProgress() {
    const routine = getCurrentRoutine();
    if (routine.exercises.length === 0) {
        document.getElementById('progressFill').style.width = '0%';
        return;
    }

    const completed = routine.exercises.filter(ex => ex.completed).length;
    const total = routine.exercises.length;
    const percentage = Math.round((completed / total) * 100);

    document.getElementById('progressFill').style.width = percentage + '%';
}

function updateStats() {
    const routine = getCurrentRoutine();
    const total = routine.exercises.length;
    const completed = routine.exercises.filter(ex => ex.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('todayTotal').textContent = total;
    document.getElementById('todayCompleted').textContent = completed;
    document.getElementById('todayProgress').textContent = percentage + '%';
}

function toggleEditMode() {
    const routineNumber = dayToRoutineMap[currentDay];
    
    // No permitir modo edición en días de descanso
    if (routineNumber === null) {
        alert('No se puede editar en días de descanso');
        return;
    }
    
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

function addExercise() {
    const routineNumber = dayToRoutineMap[currentDay];
    if (routineNumber === null) return;
    
    const name = prompt("Nombre del ejercicio:");
    if (!name) return;
    
    const sets = prompt("Series y repeticiones (ej: 3x10 - 15kg):");
    if (!sets) return;

    baseRoutines[routineNumber].exercises.push({
        name: name,
        sets: sets,
        completed: false
    });

    saveRoutines();
    displayRoutine();
    updateStats();
    
    console.log(`➕ Ejercicio "${name}" agregado a la rutina ${routineNumber}`);
}

function removeExercise(index) {
    const routineNumber = dayToRoutineMap[currentDay];
    if (routineNumber === null) return;
    
    const exerciseName = baseRoutines[routineNumber].exercises[index].name;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${exerciseName}"?\n\nEste ejercicio se eliminará de todos los días que usan la Rutina ${routineNumber}.`)) {
        baseRoutines[routineNumber].exercises.splice(index, 1);
        saveRoutines();
        displayRoutine();
        updateStats();
        
        console.log(`🗑️ Ejercicio "${exerciseName}" eliminado de la rutina ${routineNumber}`);
    }
}

function editExercise(index) {
    const routineNumber = dayToRoutineMap[currentDay];
    if (routineNumber === null) return;
    
    const exercise = baseRoutines[routineNumber].exercises[index];
    
    const newName = prompt("Nombre del ejercicio:", exercise.name);
    if (newName === null) return;
    
    const newSets = prompt("Series y repeticiones:", exercise.sets);
    if (newSets === null) return;

    const oldName = exercise.name;
    baseRoutines[routineNumber].exercises[index].name = newName || exercise.name;
    baseRoutines[routineNumber].exercises[index].sets = newSets || exercise.sets;

    saveRoutines();
    displayRoutine();
    
    console.log(`✏️ Ejercicio "${oldName}" editado en la rutina ${routineNumber}`);
}

// Función de utilidad para debugging - mostrar el estado actual
function debugRoutines() {
    console.log('🔍 Estado actual de las rutinas:');
    console.log('Base Routines:', baseRoutines);
    console.log('Current Day:', currentDay);
    console.log('Current Routine Number:', dayToRoutineMap[currentDay]);
    console.log('Current Routine:', getCurrentRoutine());
}

document.addEventListener('DOMContentLoaded', initApp);