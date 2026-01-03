let routines = [];
let isEditMode = false;
let currentDay = new Date().getDay();
let editingRoutineId = null;
let draggedElement = null;
let draggedIndex = null;
let draggedRoutineId = null;
let dragStartY = 0;
let currentY = 0;
let modalExercises = [];

// Variables para el modal de los ejercicios
let exerciseModalMode = null; // add, edit, addToModal
let exerciseModalRoutineId = null;
let exerciseModalIndex = null;

// Mapeo de días numericos a nombres de propiedades
const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function initApp() {
    loadRoutines();
    resetAllCompletedExercises();
    displayCurrentDay();
    updateStats();
}

function resetAllCompletedExercises() {
    routines.forEach(routine => {
        routine.exercises.forEach(exercise => {
            exercise.completed = false;
        });
    });
    saveRoutines();
    console.log('Todos los ejercicios reseteados a no completados');
}

function loadRoutines() {
    const saved = localStorage.getItem('gymRoutines');
    if (saved) {
        routines = JSON.parse(saved);
        console.log('Rutinas cargadas desde localStorage');
    } else {
        routines = [];
        console.log('No hay rutinas guardadas');
    }
}

function saveRoutines() {
    localStorage.setItem('gymRoutines', JSON.stringify(routines));
    console.log('Rutinas guardadas en localStorage');
}

function displayCurrentDay() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date();
    currentDay = today.getDay();
    
    document.getElementById('dayTitle').textContent = `${days[currentDay]}`;
    
    document.getElementById('dayDate').textContent = 
        today.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

    displayRoutines();
    updateProgress();
}

function getTodayRoutines() {
    const dayName = dayMap[currentDay];
    return routines.filter(routine => routine.days[dayName] === true);
}

function displayRoutines() {
    const content = document.getElementById('routineContent');
    const todayRoutines = getTodayRoutines();

    if (todayRoutines.length === 0) {
        content.innerHTML = `
            <div class="rest-day">
                <i class="bi bi-cup-hot" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3">Día de descanso</h4>
                <p>No tienes rutinas asignadas para hoy.</p>
                <button class="btn btn-outline-primary mt-3" onclick="openManageRoutinesModal()">
                    <i class="bi bi-gear me-2"></i>Gestionar Rutinas
                </button>
            </div>
        `;
        updateProgress();
        return;
    }

    let html = '';
    
    todayRoutines.forEach(routine => {
        html += `
            <div class="routine-section mb-4">
                <div class="routine-header mb-3">
                    <h5 class="text-white">
                        <i class="bi bi-clipboard-check me-2"></i>
                        ${routine.name}
                    </h5>
                </div>
        `;
        
        routine.exercises.forEach((exercise, index) => {
            html += createExerciseHTML(exercise, index, routine.id);
        });
        
        if (isEditMode) {
            html += `
                <div class="text-center mt-3">
                    <button class="btn btn-sm btn-outline-success" onclick="addQuickExercise(${routine.id})">
                        <i class="bi bi-plus-circle me-2"></i>Agregar ejercicio
                    </button>
                </div>
            `;
        }
        
        html += `</div>`;
    });
    
    if (isEditMode) {
        content.innerHTML = `
            <div class="alert alert-info mb-3">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Modo Edición:</strong> Puedes editar, eliminar y reordenar ejercicios.
            </div>
        ` + html;
    } else {
        content.innerHTML = html;
    }
    
    updateProgress();
}

function createExerciseHTML(exercise, index, routineId) {
    const canEdit = isEditMode;
    
    const dragHandle = canEdit ? `
        <button class="btn-drag-handle" 
                onmousedown="startDrag(event, ${index}, ${routineId})"
                ontouchstart="startDrag(event, ${index}, ${routineId})"
                title="Arrastrar para reordenar">
            <i class="bi bi-grip-vertical"></i>
        </button>
    ` : '';
    
    const editControls = canEdit ? `
        <div class="mt-2">
            <button class="btn btn-sm btn-outline-danger" onclick="removeExercise(${index}, ${routineId})">
                <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning ms-2" onclick="editExercise(${index}, ${routineId})">
                <i class="bi bi-pencil"></i>
            </button>
        </div>
    ` : '';

    return `
        <div class="exercise-item ${exercise.completed ? 'completed' : ''}" 
             data-index="${index}" 
             data-routine-id="${routineId}"
             ${canEdit ? 'style="border: 2px dashed #ffc107; background: rgba(255, 193, 7, 0.1);"' : ''}>
            ${dragHandle}
            <div class="d-flex align-items-center">
                <input type="checkbox" 
                        class="form-check-input exercise-checkbox" 
                        ${exercise.completed ? 'checked' : ''} 
                        onchange="toggleExercise(${index}, ${routineId})"
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

// Funciones de Drag & Drop
function startDrag(event, index, routineId) {
    event.preventDefault();
    
    draggedIndex = index;
    draggedRoutineId = routineId;
    
    const target = event.target.closest('.btn-drag-handle');
    draggedElement = target.closest('.exercise-item');
    
    const rect = draggedElement.getBoundingClientRect();
    
    if (event.type === 'mousedown') {
        dragStartY = event.clientY;
    } else if (event.type === 'touchstart') {
        dragStartY = event.touches[0].clientY;
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
    
    console.log(`Iniciando arrastre del ejercicio ${index} de rutina ${routineId}`);
}

function drag(event) {
    if (!draggedElement) return;
    
    event.preventDefault();
    
    const clientY = event.type === 'mousemove' ? event.clientY : event.touches[0].clientY;
    currentY = clientY - dragStartY;
    
    draggedElement.style.transform = `translateY(${currentY}px)`;
    
    const allItems = Array.from(document.querySelectorAll('.exercise-item'))
        .filter(item => {
            const itemRoutineId = parseInt(item.dataset.routineId);
            return item !== draggedElement && itemRoutineId === draggedRoutineId;
        });
    
    const draggedRect = draggedElement.getBoundingClientRect();
    const draggedCenter = draggedRect.top + draggedRect.height / 2;
    
    allItems.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const actualIndex = parseInt(item.dataset.index);
        
        item.style.transform = '';
        item.classList.remove('drag-shift-down', 'drag-shift-up');
        
        if (draggedCenter < itemCenter && draggedIndex > actualIndex) {
            item.style.transform = `translateY(${draggedRect.height + 10}px)`;
            item.classList.add('drag-shift-down');
        } else if (draggedCenter > itemCenter && draggedIndex < actualIndex) {
            item.style.transform = `translateY(-${draggedRect.height + 10}px)`;
            item.classList.add('drag-shift-up');
        }
    });
}

function endDrag(event) {
    if (!draggedElement) return;
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    
    const allItems = Array.from(document.querySelectorAll('.exercise-item'))
        .filter(item => {
            const itemRoutineId = parseInt(item.dataset.routineId);
            return item !== draggedElement && itemRoutineId === draggedRoutineId;
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
        const routine = routines.find(r => r.id === draggedRoutineId);
        if (routine) {
            const [movedExercise] = routine.exercises.splice(draggedIndex, 1);
            routine.exercises.splice(newIndex, 0, movedExercise);
            
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
        displayRoutines();
        draggedElement = null;
        draggedIndex = null;
        draggedRoutineId = null;
    }, 150);
}

function toggleExercise(index, routineId) {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    routine.exercises[index].completed = !routine.exercises[index].completed;
    saveRoutines();
    displayRoutines();
    updateProgress();
    updateStats();
}

function addQuickExercise(routineId) {
    exerciseModalMode = 'add';
    exerciseModalRoutineId = routineId;
    
    document.getElementById('exerciseModalTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar Ejercicio';
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseSets').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('exerciseModal'));
    modal.show();
    
    setTimeout(() => {
        document.getElementById('exerciseName').focus();
    }, 500);
}

function removeExercise(index, routineId) {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    const exerciseName = routine.exercises[index].name;
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${exerciseName}"?`)) {
        routine.exercises.splice(index, 1);
        saveRoutines();
        displayRoutines();
        updateProgress();
        updateStats();
    }
}

function editExercise(index, routineId) {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    const exercise = routine.exercises[index];
    
    exerciseModalMode = 'edit';
    exerciseModalRoutineId = routineId;
    exerciseModalIndex = index;
    
    document.getElementById('exerciseModalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Ejercicio';
    document.getElementById('exerciseName').value = exercise.name;
    document.getElementById('exerciseSets').value = exercise.sets;
    
    const modal = new bootstrap.Modal(document.getElementById('exerciseModal'));
    modal.show();
    
    setTimeout(() => {
        document.getElementById('exerciseName').focus();
    }, 500);
}

function updateProgress() {
    const todayRoutines = getTodayRoutines();
    let total = 0;
    let completed = 0;
    
    todayRoutines.forEach(routine => {
        total += routine.exercises.length;
        completed += routine.exercises.filter(ex => ex.completed).length;
    });
    
    if (total === 0) {
        document.getElementById('progressFill').style.width = '0%';
        return;
    }

    const percentage = Math.round((completed / total) * 100);
    document.getElementById('progressFill').style.width = percentage + '%';
}

function updateStats() {
    const todayRoutines = getTodayRoutines();
    let total = 0;
    let completed = 0;
    
    todayRoutines.forEach(routine => {
        total += routine.exercises.length;
        completed += routine.exercises.filter(ex => ex.completed).length;
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
    
    displayRoutines();
}

// Gestion de rutinas
function openManageRoutinesModal() {
    displayRoutinesList();
    const modal = new bootstrap.Modal(document.getElementById('manageRoutinesModal'));
    modal.show();
}

function displayRoutinesList() {
    const container = document.getElementById('routinesList');
    
    if (routines.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                <p class="mt-3">No hay rutinas creadas</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="list-group">';
    
    routines.forEach(routine => {
        const daysActive = Object.entries(routine.days)
            .filter(([day, active]) => active)
            .map(([day]) => day.substring(0, 3).toUpperCase());
        
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${routine.name}</h6>
                        <small class="text-muted">
                            <i class="bi bi-calendar-week me-1"></i>
                            ${daysActive.length > 0 ? daysActive.join(', ') : 'Sin días asignados'}
                        </small>
                        <br>
                        <small class="text-muted">
                            <i class="bi bi-list-check me-1"></i>
                            ${routine.exercises.length} ejercicios
                        </small>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editRoutineModal(${routine.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteRoutine(${routine.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function openCreateRoutineModal() {
    editingRoutineId = null;
    modalExercises = [];
    
    document.getElementById('routineEditorTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva Rutina';
    document.getElementById('routineName').value = '';
    
    // Desmarcar todos los dias
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        document.getElementById('day' + day.charAt(0).toUpperCase() + day.slice(1)).checked = false;
    });
    
    updateModalExercisesList();
    
    const modal = new bootstrap.Modal(document.getElementById('routineEditorModal'));
    modal.show();
}

function editRoutineModal(routineId) {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    editingRoutineId = routineId;
    modalExercises = JSON.parse(JSON.stringify(routine.exercises));
    
    document.getElementById('routineEditorTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Rutina';
    document.getElementById('routineName').value = routine.name;
    
    Object.entries(routine.days).forEach(([day, active]) => {
        document.getElementById('day' + day.charAt(0).toUpperCase() + day.slice(1)).checked = active;
    });
    
    updateModalExercisesList();
    
    bootstrap.Modal.getInstance(document.getElementById('manageRoutinesModal')).hide();
    const modal = new bootstrap.Modal(document.getElementById('routineEditorModal'));
    modal.show();
}

function addExerciseToModal() {
    exerciseModalMode = 'addToModal';
    
    document.getElementById('exerciseModalTitle').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar Ejercicio a la Rutina';
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseSets').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('exerciseModal'));
    modal.show();
    
    setTimeout(() => {
        document.getElementById('exerciseName').focus();
    }, 500);
}

function updateModalExercisesList() {
    const container = document.getElementById('exercisesList');
    
    if (modalExercises.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No hay ejercicios agregados</p>';
        return;
    }
    
    let html = '';
    modalExercises.forEach((exercise, index) => {
        html += `
            <div class="modal-exercise-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${exercise.name}</strong>
                        <br>
                        <small class="text-muted">${exercise.sets}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeExerciseFromModal(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function confirmExerciseModal() {
    const name = document.getElementById('exerciseName').value.trim();
    const sets = document.getElementById('exerciseSets').value.trim();
    
    if (!name) {
        alert('Por favor ingresa el nombre del ejercicio');
        return;
    }
    
    if (!sets) {
        alert('Por favor ingresa las series y repeticiones');
        return;
    }
    
    if (exerciseModalMode === 'add') {
        // Agregar ejercicio a una rutina existente
        const routine = routines.find(r => r.id === exerciseModalRoutineId);
        if (routine) {
            routine.exercises.push({
                name: name,
                sets: sets,
                completed: false
            });
            saveRoutines();
            displayRoutines();
            updateProgress();
            updateStats();
        }
    } else if (exerciseModalMode === 'edit') {
        // Editar ejercicio existente
        const routine = routines.find(r => r.id === exerciseModalRoutineId);
        if (routine) {
            routine.exercises[exerciseModalIndex].name = name;
            routine.exercises[exerciseModalIndex].sets = sets;
            saveRoutines();
            displayRoutines();
            updateProgress();
        }
    } else if (exerciseModalMode === 'addToModal') {
        // Agregar ejercicio al modal de rutina
        modalExercises.push({
            name: name,
            sets: sets,
            completed: false
        });
        updateModalExercisesList();
    }
    
    bootstrap.Modal.getInstance(document.getElementById('exerciseModal')).hide();
    
    exerciseModalMode = null;
    exerciseModalRoutineId = null;
    exerciseModalIndex = null;
}

function removeExerciseFromModal(index) {
    modalExercises.splice(index, 1);
    updateModalExercisesList();
}

function saveRoutine() {
    const name = document.getElementById('routineName').value.trim();
    
    if (!name) {
        alert('Por favor ingresa un nombre para la rutina');
        return;
    }
    
    const days = {
        monday: document.getElementById('dayMonday').checked,
        tuesday: document.getElementById('dayTuesday').checked,
        wednesday: document.getElementById('dayWednesday').checked,
        thursday: document.getElementById('dayThursday').checked,
        friday: document.getElementById('dayFriday').checked,
        saturday: document.getElementById('daySaturday').checked,
        sunday: document.getElementById('daySunday').checked
    };
    
    if (editingRoutineId) {
        // Editar rutina existente
        const routine = routines.find(r => r.id === editingRoutineId);
        if (routine) {
            routine.name = name;
            routine.days = days;
            routine.exercises = modalExercises;
        }
    } else {
        // Crear nueva rutina
        const newRoutine = {
            id: Date.now(),
            name: name,
            days: days,
            exercises: modalExercises
        };
        
        routines.push(newRoutine);
    }
    
    saveRoutines();
    bootstrap.Modal.getInstance(document.getElementById('routineEditorModal')).hide();
    displayCurrentDay();
    updateProgress();
    updateStats();
    
    if (document.getElementById('manageRoutinesModal').classList.contains('show')) {
        displayRoutinesList();
    }
}

function deleteRoutine(routineId) {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?`)) {
        routines = routines.filter(r => r.id !== routineId);
        saveRoutines();
        displayRoutinesList();
        displayCurrentDay();
        updateProgress();
        updateStats();
    }
}

// Event listeners adicionales
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    
    // Agrego listener para Enter en los campos del modal de ejercicio
    const exerciseModal = document.getElementById('exerciseModal');
    if (exerciseModal) {
        exerciseModal.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nameInput = document.getElementById('exerciseName');
                const setsInput = document.getElementById('exerciseSets');
                
                // Si estamos en el nombre, pasar a sets
                if (document.activeElement === nameInput) {
                    setsInput.focus();
                }
                // Si estamos en sets o cualquier otro lugar, guardar
                else {
                    confirmExerciseModal();
                }
            }
        });
    }
});