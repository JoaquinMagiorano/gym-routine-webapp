const defaultBaseRoutines = {
    1: { 
        name: "Pecho, Espalda y Bíceps",
        exercises: [
            { name: "Pecho: Press plano", sets: "3x10 - 20kg", completed: false },
            { name: "Pecho: Press inclinado", sets: "3x10 - 12.5kg", completed: false },
            { name: "Pecho: Cruces de polea", sets: "3x10 - 25kg", completed: false },
            { name: "Espalda: Remo con pecho apoyado", sets: "3x10 - 35kg", completed: false },
            { name: "Espalda: Remo con agarre cerrado", sets: "3x10 - 50kg", completed: false },
            { name: "Espalda: Lat Pulldown unilateral", sets: "3x10 - 20kg", completed: false },
            { name: "Bíceps: Curl con barra W", sets: "3x10 - 25kg", completed: false },
            { name: "Bíceps: Rope hammer curl", sets: "3x10 - 40kg", completed: false },
            { name: "Bíceps: Drag curl", sets: "3x10 - 20kg", completed: false },
            { name: "Antebrazos", sets: "3x15 - 25kg", completed: false },
        ]
    },
    2: {
        name: "Piernas, Hombros y Tríceps",
        exercises: [
            { name: "Hombros: Press militar", sets: "3x10 - 32kg", completed: false },
            { name: "Hombros: Face pulls", sets: "3x10 - 40kg", completed: false },
            { name: "Hombros: Elevaciones laterales con polea", sets: "3x10 - 15kg", completed: false },
            { name: "Tríceps: Pushdown", sets: "3x10 - 45kg", completed: false },
            { name: "Tríceps: Extensión inclinada por encima (polea alta)", sets: "3x10 - 40kg", completed: false },
            { name: "Tríceps: Extensión unilateral por encima (polea baja)", sets: "3x10 - 15kg", completed: false },
            { name: "Piernas: Prensa", sets: "3x10 - 55kg", completed: false },
            { name: "Piernas: Maquina de isquios", sets: "3x10 - 45kg", completed: false },
            { name: "Piernas: Maquina de cuádriceps", sets: "3x10 - 45kg", completed: false },
            { name: "Gemelos", sets: "3x20 - 50kg", completed: false },
            { name: "Antebrazos", sets: "3x15 - 25kg", completed: false },
        ]
    },
    3: {
        name: "Rutina Opcional - Core",
        exercises: [
            { name: "Plancha", sets: "3x30seg", completed: false },
            { name: "Elevaciones de piernas", sets: "3x10", completed: false },
            { name: "Russian twists", sets: "3x20", completed: false },
            { name: "Superman", sets: "3x15", completed: false },
        ]
    }
};

const dayToRoutineMap = {
    0: null,
    1: 1,
    2: 2,
    3: null,
    4: 1,
    5: 2,
    6: null
};

const restDayInfo = {
    name: "Descanso",
    exercises: []
};

let baseRoutines = {};
let isEditMode = false;
let currentDay = new Date().getDay();
let draggedElement = null;
let draggedIndex = null;
let draggedIsOptional = false;
let dragStartY = 0;
let currentY = 0;
let initialY = 0;

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
        console.log('Rutinas cargadas desde localStorage');
        
        if (!baseRoutines[3]) {
            baseRoutines[3] = JSON.parse(JSON.stringify(defaultBaseRoutines[3]));
            saveRoutines();
            console.log('Rutina opcional agregada');
        }
    } else {
        baseRoutines = JSON.parse(JSON.stringify(defaultBaseRoutines));
        saveRoutines();
        console.log('Rutinas por defecto cargadas');
    }
}

function resetAllExercisesToIncomplete() {
    Object.keys(baseRoutines).forEach(routineKey => {
        if (baseRoutines[routineKey].exercises && baseRoutines[routineKey].exercises.length > 0) {
            baseRoutines[routineKey].exercises.forEach(exercise => {
                exercise.completed = false;
            });
        }
    });
    
    saveRoutines();
    console.log('Todos los ejercicios reseteados correctamente');
}

function saveRoutines() {
    localStorage.setItem('gymBaseRoutines', JSON.stringify(baseRoutines));
    console.log('Rutinas guardadas en localStorage');
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
    
    document.getElementById('dayTitle').textContent = `${days[currentDay]} - Todas las Rutinas`;
    
    document.getElementById('dayDate').textContent = 
        today.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

    displayAllRoutines();
    updateProgress();
}

function displayAllRoutines() {
    const content = document.getElementById('routineContent');
    const optionalDiv = document.getElementById('optionalRoutine');
    
    let html = '';
    
    // Rutina 1
    html += `
        <div class="mt-4 mb-3">
            <h5 class="text-white">
                <i class="bi bi-clipboard-check me-2"></i>
                ${baseRoutines[1].name}
            </h5>
        </div>
    `;
    baseRoutines[1].exercises.forEach((exercise, index) => {
        html += createExerciseHTML(exercise, index, false, 1);
    });
    
    if (isEditMode) {
        html += `
            <div class="text-center mt-3 mb-4">
                <button class="btn btn-sm btn-outline-success" onclick="addExercise(false, 1)">
                    <i class="bi bi-plus-circle me-2"></i>Agregar ejercicio a Rutina 1
                </button>
            </div>
        `;
    }
    
    // Rutina 2
    html += `
        <div class="mt-4 mb-3">
            <h5 class="text-white">
                <i class="bi bi-clipboard-check me-2"></i>
                ${baseRoutines[2].name}
            </h5>
        </div>
    `;
    baseRoutines[2].exercises.forEach((exercise, index) => {
        html += createExerciseHTML(exercise, index, false, 2);
    });
    
    if (isEditMode) {
        html += `
            <div class="text-center mt-3 mb-4">
                <button class="btn btn-sm btn-outline-success" onclick="addExercise(false, 2)">
                    <i class="bi bi-plus-circle me-2"></i>Agregar ejercicio a Rutina 2
                </button>
            </div>
        `;
    }
    
    content.innerHTML = html;
    
    // Rutina Opcional
    let optionalHtml = `
        <div class="mt-4 mb-3">
            <h5 class="text-white-50">
                <i class="bi bi-star me-2"></i>
                ${baseRoutines[3].name}
            </h5>
        </div>
    `;
    
    baseRoutines[3].exercises.forEach((exercise, index) => {
        optionalHtml += createExerciseHTML(exercise, index, true, 3);
    });
    
    if (isEditMode) {
        optionalHtml += `
            <div class="text-center mt-3">
                <button class="btn btn-sm btn-outline-success" onclick="addExercise(true, 3)">
                    <i class="bi bi-plus-circle me-2"></i>Agregar ejercicio opcional
                </button>
            </div>
        `;
    }
    
    optionalDiv.innerHTML = optionalHtml;
}

function createExerciseHTML(exercise, index, isOptional = false, routineNum = null) {
    const canEdit = isEditMode;
    
    const dragHandle = canEdit ? `
        <button class="btn-drag-handle" 
                onmousedown="startDrag(event, ${index}, ${routineNum})"
                ontouchstart="startDrag(event, ${index}, ${routineNum})"
                title="Arrastrar para reordenar">
            <i class="bi bi-grip-vertical"></i>
        </button>
    ` : '';
    
    const editControls = canEdit ? `
        <div class="mt-2">
            <button class="btn btn-sm btn-outline-danger" onclick="removeExercise(${index}, ${routineNum})">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning ms-2" onclick="editExercise(${index}, ${routineNum})">
                <i class="bi bi-pencil"></i>
            </button>
        </div>
    ` : '';

    return `
        <div class="exercise-item ${exercise.completed ? 'completed' : ''}" 
             data-index="${index}" 
             data-routine="${routineNum}"
             ${canEdit ? 'style="border: 2px dashed #ffc107; background: rgba(255, 193, 7, 0.1);"' : ''}>
            ${dragHandle}
            <div class="d-flex align-items-center">
                <input type="checkbox" 
                        class="form-check-input exercise-checkbox" 
                        ${exercise.completed ? 'checked' : ''} 
                        onchange="toggleExercise(${index}, ${routineNum})"
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

function startDrag(event, index, routineNum) {
    event.preventDefault();
    
    draggedIndex = index;
    draggedIsOptional = routineNum;
    
    const target = event.target.closest('.btn-drag-handle');
    draggedElement = target.closest('.exercise-item');
    
    const rect = draggedElement.getBoundingClientRect();
    
    if (event.type === 'mousedown') {
        dragStartY = event.clientY;
        initialY = rect.top;
    } else if (event.type === 'touchstart') {
        dragStartY = event.touches[0].clientY;
        initialY = rect.top;
    }
    
    currentY = 0;
    
    draggedElement.classList.add('dragging');
    draggedElement.style.zIndex = '1000';
    
    if (event.type === 'mousedown') {
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
    } else if (event.type === 'touchstart') {
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
    }
    
    console.log(`Iniciando arrastre del ejercicio ${index} de rutina ${routineNum}`);
}

function drag(event) {
    if (!draggedElement) return;
    
    event.preventDefault();
    
    const clientY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
    currentY = clientY - dragStartY;
    
    draggedElement.style.transform = `translateY(${currentY}px)`;
    
    const container = draggedIsOptional === 3 ? 
        document.getElementById('optionalRoutine') : 
        document.getElementById('routineContent');
    
    const allItems = Array.from(container.querySelectorAll('.exercise-item'))
        .filter(item => {
            const itemRoutine = parseInt(item.dataset.routine);
            return item !== draggedElement && itemRoutine === draggedIsOptional;
        });
    
    const draggedRect = draggedElement.getBoundingClientRect();
    const draggedCenter = draggedRect.top + draggedRect.height / 2;
    
    let newIndex = draggedIndex;
    
    allItems.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const actualIndex = parseInt(item.dataset.index);
        
        item.style.transform = '';
        item.classList.remove('drag-shift-down', 'drag-shift-up');
        
        if (draggedCenter < itemCenter && draggedIndex > actualIndex) {
            item.style.transform = `translateY(${draggedRect.height + 10}px)`;
            item.classList.add('drag-shift-down');
            newIndex = Math.min(newIndex, actualIndex);
        } else if (draggedCenter > itemCenter && draggedIndex < actualIndex) {
            item.style.transform = `translateY(-${draggedRect.height + 10}px)`;
            item.classList.add('drag-shift-up');
            newIndex = Math.max(newIndex, actualIndex);
        }
    });
}

function endDrag(event) {
    if (!draggedElement) return;
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    
    const container = draggedIsOptional === 3 ? 
        document.getElementById('optionalRoutine') : 
        document.getElementById('routineContent');
    
    const allItems = Array.from(container.querySelectorAll('.exercise-item'))
        .filter(item => {
            const itemRoutine = parseInt(item.dataset.routine);
            return item !== draggedElement && itemRoutine === draggedIsOptional;
        });
    
    const draggedRect = draggedElement.getBoundingClientRect();
    const draggedCenter = draggedRect.top + draggedRect.height / 2;
    
    let newIndex = draggedIndex;
    
    allItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const actualIndex = parseInt(item.dataset.index);
        
        if (draggedCenter < itemCenter && draggedIndex > actualIndex) {
            newIndex = Math.min(newIndex, actualIndex);
        } else if (draggedCenter > itemCenter && draggedIndex < actualIndex) {
            newIndex = Math.max(newIndex, actualIndex);
        }
    });
    
    if (newIndex !== draggedIndex) {
        const routineNumber = draggedIsOptional;
        if (routineNumber !== null) {
            const exercises = baseRoutines[routineNumber].exercises;
            const [movedExercise] = exercises.splice(draggedIndex, 1);
            exercises.splice(newIndex, 0, movedExercise);
            
            saveRoutines();
            console.log(`Ejercicio movido de posición ${draggedIndex} a ${newIndex}`);
        }
    }
    
    draggedElement.classList.remove('dragging');
    draggedElement.style.transform = '';
    draggedElement.style.zIndex = '';
    
    allItems.forEach(item => {
        item.style.transform = '';
        item.classList.remove('drag-shift-down', 'drag-shift-up');
    });
    
    setTimeout(() => {
        displayAllRoutines();
        draggedElement = null;
        draggedIndex = null;
        draggedIsOptional = false;
    }, 150);
    
    console.log('Arrastre finalizado');
}

function toggleExercise(index, routineNum) {
    if (!baseRoutines[routineNum]) return;
    
    baseRoutines[routineNum].exercises[index].completed = !baseRoutines[routineNum].exercises[index].completed;
    saveRoutines();
    
    displayAllRoutines();
    updateStats();
    
    console.log(`Ejercicio ${index + 1} de la rutina ${routineNum} ${baseRoutines[routineNum].exercises[index].completed ? 'completado' : 'desmarcado'}`);
}

function updateProgress() {
    let total = 0;
    let completed = 0;
    
    // Contar todos los ejercicios de todas las rutinas
    [1, 2, 3].forEach(routineNum => {
        if (baseRoutines[routineNum]) {
            total += baseRoutines[routineNum].exercises.length;
            completed += baseRoutines[routineNum].exercises.filter(ex => ex.completed).length;
        }
    });
    
    if (total === 0) {
        document.getElementById('progressFill').style.width = '0%';
        return;
    }

    const percentage = Math.round((completed / total) * 100);
    document.getElementById('progressFill').style.width = percentage + '%';
}

function updateStats() {
    let total = 0;
    let completed = 0;
    
    // Contar todos los ejercicios de todas las rutinas
    [1, 2, 3].forEach(routineNum => {
        if (baseRoutines[routineNum]) {
            total += baseRoutines[routineNum].exercises.length;
            completed += baseRoutines[routineNum].exercises.filter(ex => ex.completed).length;
        }
    });
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('todayTotal').textContent = total;
    document.getElementById('todayCompleted').textContent = completed;
    document.getElementById('todayProgress').textContent = percentage + '%';
}

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
    
    displayAllRoutines();
}

function addExercise(isOptional = false, routineNum = null) {
    if (!routineNum) return;
    
    const name = prompt("Nombre del ejercicio:");
    if (!name) return;
    
    const sets = prompt("Series y repeticiones (ej: 3x10 - 15kg):");
    if (!sets) return;

    baseRoutines[routineNum].exercises.push({
        name: name,
        sets: sets,
        completed: false
    });

    saveRoutines();
    displayAllRoutines();
    updateStats();
    
    console.log(`Ejercicio "${name}" agregado a la rutina ${routineNum}`);
}

function removeExercise(index, routineNum) {
    if (!baseRoutines[routineNum]) return;
    
    const exerciseName = baseRoutines[routineNum].exercises[index].name;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${exerciseName}"?`;
    
    if (confirm(confirmMessage)) {
        baseRoutines[routineNum].exercises.splice(index, 1);
        saveRoutines();
        displayAllRoutines();
        updateStats();
        
        console.log(`Ejercicio "${exerciseName}" eliminado de la rutina ${routineNum}`);
    }
}

function editExercise(index, routineNum) {
    if (!baseRoutines[routineNum]) return;
    
    const exercise = baseRoutines[routineNum].exercises[index];
    
    const newName = prompt("Nombre del ejercicio:", exercise.name);
    if (newName === null) return;
    
    const newSets = prompt("Series y repeticiones:", exercise.sets);
    if (newSets === null) return;

    const oldName = exercise.name;
    baseRoutines[routineNum].exercises[index].name = newName || exercise.name;
    baseRoutines[routineNum].exercises[index].sets = newSets || exercise.sets;

    saveRoutines();
    displayAllRoutines();
    
    console.log(`Ejercicio "${oldName}" editado en la rutina ${routineNum}`);
}

function debugRoutines() {
    console.log('Estado actual de las rutinas:');
    console.log('Rutinas base:', baseRoutines);
    console.log('Dia actual:', currentDay);
    console.log('Numero de rutina actual:', dayToRoutineMap[currentDay]);
    console.log('Rutina actual:', getCurrentRoutine());
}

document.addEventListener('DOMContentLoaded', initApp);