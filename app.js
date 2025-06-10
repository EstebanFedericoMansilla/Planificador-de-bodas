// Datos de ejemplo y gestión de almacenamiento
const STORAGE_KEYS = {
    BUDGET: 'wedding_budget',
    GUESTS: 'wedding_guests',
    VENDORS: 'wedding_vendors',
    DESTINATIONS: 'wedding_destinations'
};

// Función para cargar datos del localStorage
const loadFromStorage = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

// Función para guardar datos en localStorage
const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Cargar datos iniciales
let budgetData = loadFromStorage(STORAGE_KEYS.BUDGET, {
    total: 50000,
    spent: 15000,
    categories: [
        { name: 'Lugar', budget: 15000, spent: 5000 },
        { name: 'Catering', budget: 10000, spent: 3000 },
        { name: 'Decoración', budget: 8000, spent: 2000 },
        { name: 'Fotografía', budget: 5000, spent: 2000 },
        { name: 'Música', budget: 3000, spent: 1000 },
        { name: 'Vestuario', budget: 5000, spent: 1000 },
        { name: 'Otros', budget: 3000, spent: 1000 }
    ]
});

let guests = loadFromStorage(STORAGE_KEYS.GUESTS, []);
let selectedGuests = new Set(); // Para manejar invitados seleccionados

const vendors = [
    {
        name: 'Catering Elegante',
        category: 'catering',
        rating: 4.8,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'Fotos Perfectas',
        category: 'fotografia',
        rating: 4.9,
        price: '$$$$',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
        name: 'Música en Vivo',
        category: 'musica',
        rating: 4.7,
        price: '$$$',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
];

const destinations = [
    {
        name: 'Bali, Indonesia',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: '$$$'
    },
    {
        name: 'Santorini, Grecia',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: '$$$$'
    },
    {
        name: 'Maldives',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        price: '$$$$$'
    }
];

// Funciones de utilidad
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

// Función para editar el presupuesto total
const editTotalBudget = () => {
    const newTotal = prompt('Ingrese el nuevo presupuesto total:', budgetData.total);
    if (newTotal && !isNaN(newTotal) && newTotal > 0) {
        budgetData.total = parseFloat(newTotal);
        saveToStorage(STORAGE_KEYS.BUDGET, budgetData);
        updateBudget();
        showMessage('Presupuesto total actualizado');
    }
};

// Función para editar una categoría
const editCategory = (categoryIndex) => {
    const category = budgetData.categories[categoryIndex];
    const newBudget = prompt(`Presupuesto para ${category.name}:`, category.budget);
    const newSpent = prompt(`Gastado en ${category.name}:`, category.spent);

    if (newBudget && newSpent && 
        !isNaN(newBudget) && !isNaN(newSpent) && 
        newBudget >= 0 && newSpent >= 0 && 
        parseFloat(newSpent) <= parseFloat(newBudget)) {
        
        budgetData.categories[categoryIndex] = {
            ...category,
            budget: parseFloat(newBudget),
            spent: parseFloat(newSpent)
        };

        // Actualizar el total gastado
        budgetData.spent = budgetData.categories.reduce((total, cat) => total + cat.spent, 0);
        
        saveToStorage(STORAGE_KEYS.BUDGET, budgetData);
        updateBudget();
        showMessage('Categoría actualizada');
    } else if (newBudget !== null || newSpent !== null) {
        showMessage('Valores inválidos. El gastado no puede ser mayor al presupuesto.', 'error');
    }
};

// Función para agregar nueva categoría
const addNewCategory = () => {
    const name = prompt('Nombre de la nueva categoría:');
    if (!name) return;

    const budget = prompt('Presupuesto para la nueva categoría:');
    const spent = prompt('Gastado en la nueva categoría:');

    if (budget && spent && 
        !isNaN(budget) && !isNaN(spent) && 
        parseFloat(budget) >= 0 && parseFloat(spent) >= 0 && 
        parseFloat(spent) <= parseFloat(budget)) {
        
        budgetData.categories.push({
            name: name,
            budget: parseFloat(budget),
            spent: parseFloat(spent)
        });

        // Actualizar el total gastado
        budgetData.spent = budgetData.categories.reduce((total, cat) => total + cat.spent, 0);
        
        saveToStorage(STORAGE_KEYS.BUDGET, budgetData);
        updateBudget();
        showMessage('Nueva categoría agregada');
    } else if (budget !== null || spent !== null) {
        showMessage('Valores inválidos. El gastado no puede ser mayor al presupuesto.', 'error');
    }
};

// Función para eliminar categoría
const deleteCategory = (categoryIndex) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${budgetData.categories[categoryIndex].name}"?`)) {
        budgetData.categories.splice(categoryIndex, 1);
        
        // Actualizar el total gastado
        budgetData.spent = budgetData.categories.reduce((total, cat) => total + cat.spent, 0);
        
        saveToStorage(STORAGE_KEYS.BUDGET, budgetData);
        updateBudget();
        showMessage('Categoría eliminada');
    }
};

// Actualizar presupuesto
const updateBudget = () => {
    const budgetSummary = document.querySelector('.budget-summary');
    budgetSummary.innerHTML = `
        <div class="budget-card">
            <h3>Presupuesto Total</h3>
            <div class="budget-amount">
                <p class="amount">${formatCurrency(budgetData.total)}</p>
                <button onclick="editTotalBudget()" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>
        <div class="budget-card">
            <h3>Gastado</h3>
            <p class="amount">${formatCurrency(budgetData.spent)}</p>
        </div>
        <div class="budget-card">
            <h3>Restante</h3>
            <p class="amount">${formatCurrency(budgetData.total - budgetData.spent)}</p>
        </div>
    `;

    const categoriesContainer = document.querySelector('.budget-categories');
    categoriesContainer.innerHTML = `
        <div class="budget-categories-header">
            <h3>Categorías</h3>
            <button onclick="addNewCategory()" class="add-category-btn">
                <i class="fas fa-plus"></i> Nueva Categoría
            </button>
        </div>
        ${budgetData.categories.map((category, index) => `
            <div class="budget-card category-card">
                <div class="category-header">
                    <h3>${category.name}</h3>
                    <div class="category-actions">
                        <button onclick="editCategory(${index})" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCategory(${index})" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="amount">${formatCurrency(category.spent)} / ${formatCurrency(category.budget)}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(category.spent / category.budget) * 100}%"></div>
                </div>
            </div>
        `).join('')}
    `;

    saveToStorage(STORAGE_KEYS.BUDGET, budgetData);
};

// Gestión de invitados mejorada
const addGuest = (event) => {
    event.preventDefault();
    const form = event.target;
    const guest = {
        id: Date.now(), // Identificador único
        name: form[0].value,
        email: form[1].value,
        phone: form[2].value,
        type: form[3].value,
        confirmed: false,
        addedDate: new Date().toISOString()
    };
    guests.push(guest);
    saveToStorage(STORAGE_KEYS.GUESTS, guests);
    updateGuestsList();
    form.reset();
};

// Función para importar invitados desde JSON
const importGuestsFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedGuests = JSON.parse(e.target.result);
            
            // Validar que los datos importados sean un array
            if (!Array.isArray(importedGuests)) {
                throw new Error('El archivo debe contener un array de invitados');
            }

            // Validar la estructura de cada invitado
            const validGuests = importedGuests.filter(guest => {
                return guest && 
                       typeof guest === 'object' && 
                       'name' in guest && 
                       typeof guest.name === 'string';
            });

            if (validGuests.length === 0) {
                throw new Error('No se encontraron invitados válidos en el archivo');
            }

            // Agregar IDs y fechas a los invitados importados si no los tienen
            const processedGuests = validGuests.map(guest => ({
                ...guest,
                id: guest.id || Date.now() + Math.random(),
                addedDate: guest.addedDate || new Date().toISOString(),
                confirmed: guest.confirmed || false
            }));

            // Confirmar con el usuario
            if (confirm(`¿Deseas importar ${processedGuests.length} invitados? Esto agregará los nuevos invitados a la lista existente.`)) {
                // Combinar invitados existentes con los nuevos, evitando duplicados por email
                const existingEmails = new Set(guests.map(g => g.email?.toLowerCase()));
                const newGuests = processedGuests.filter(g => !existingEmails.has(g.email?.toLowerCase()));
                
                guests = [...guests, ...newGuests];
                saveToStorage(STORAGE_KEYS.GUESTS, guests);
                updateGuestsList();
                
                showMessage(`Se importaron ${newGuests.length} invitados exitosamente`);
            }
        } catch (error) {
            showMessage(`Error al importar: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
};

// Función para mostrar mensajes
const showMessage = (message, type = 'success') => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `confirmation-message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
};

const updateGuestsList = (filteredGuests = null) => {
    const guestsTable = document.querySelector('.guests-table');
    const guestsToShow = filteredGuests || guests;
    
    guestsTable.innerHTML = `
        <div class="guests-actions">
            <div class="guests-actions-left">
                <button onclick="deleteSelectedGuests()" class="delete-selected-btn" ${selectedGuests.size === 0 ? 'disabled' : ''}>
                    Eliminar Seleccionados (${selectedGuests.size})
                </button>
                <button onclick="exportGuestsToJSON()" class="export-btn">
                    Exportar Lista
                </button>
            </div>
            <div class="guests-actions-right">
                <label for="import-json" class="import-btn">
                    Importar Lista
                    <input type="file" id="import-json" accept=".json" style="display: none;" onchange="importGuestsFromJSON(event)">
                </label>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="select-all-guests" 
                            ${guestsToShow.length > 0 && selectedGuests.size === guestsToShow.length ? 'checked' : ''}>
                    </th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Tipo</th>
                    <th>Confirmado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${guestsToShow.map((guest, index) => `
                    <tr>
                        <td>
                            <input type="checkbox" class="guest-checkbox" 
                                data-id="${guest.id}"
                                ${selectedGuests.has(guest.id) ? 'checked' : ''}>
                        </td>
                        <td>${guest.name}</td>
                        <td>${guest.email}</td>
                        <td>${guest.phone}</td>
                        <td>${guest.type}</td>
                        <td>
                            <input type="checkbox" ${guest.confirmed ? 'checked' : ''} 
                                onchange="toggleGuestConfirmation(${guest.id})">
                        </td>
                        <td>
                            <button onclick="deleteGuest(${guest.id})" class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Agregar event listeners para los checkboxes
    document.getElementById('select-all-guests')?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.guest-checkbox');
        checkboxes.forEach(checkbox => {
            const guestId = parseInt(checkbox.dataset.id);
            if (e.target.checked) {
                selectedGuests.add(guestId);
            } else {
                selectedGuests.delete(guestId);
            }
            checkbox.checked = e.target.checked;
        });
        updateGuestsList();
    });

    document.querySelectorAll('.guest-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const guestId = parseInt(e.target.dataset.id);
            if (e.target.checked) {
                selectedGuests.add(guestId);
            } else {
                selectedGuests.delete(guestId);
            }
            updateGuestsList();
        });
    });
};

const toggleGuestConfirmation = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
        guest.confirmed = !guest.confirmed;
        saveToStorage(STORAGE_KEYS.GUESTS, guests);
        updateGuestsList();
    }
};

const deleteGuest = (guestId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este invitado?')) {
        guests = guests.filter(guest => guest.id !== guestId);
        selectedGuests.delete(guestId);
        saveToStorage(STORAGE_KEYS.GUESTS, guests);
        updateGuestsList();
    }
};

const deleteSelectedGuests = () => {
    if (selectedGuests.size === 0) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedGuests.size} invitados?`)) {
        guests = guests.filter(guest => !selectedGuests.has(guest.id));
        selectedGuests.clear();
        saveToStorage(STORAGE_KEYS.GUESTS, guests);
        updateGuestsList();
    }
};

const exportGuestsToJSON = () => {
    const dataStr = JSON.stringify(guests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `invitados_boda_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

// Gestión de proveedores
const updateVendors = (category = 'todos') => {
    const vendorsGrid = document.querySelector('.vendors-grid');
    const filteredVendors = category === 'todos' 
        ? vendors 
        : vendors.filter(vendor => vendor.category === category);

    vendorsGrid.innerHTML = filteredVendors.map(vendor => `
        <div class="vendor-card">
            <img src="${vendor.image}" alt="${vendor.name}">
            <h3>${vendor.name}</h3>
            <div class="vendor-info">
                <span class="rating">
                    <i class="fas fa-star"></i> ${vendor.rating}
                </span>
                <span class="price">${vendor.price}</span>
            </div>
            <button class="contact-btn">Contactar</button>
        </div>
    `).join('');
};

// Gestión de destinos
const updateDestinations = () => {
    const destinationsGrid = document.querySelector('.destinations-grid');
    destinationsGrid.innerHTML = destinations.map(destination => `
        <div class="destination-card">
            <img src="${destination.image}" alt="${destination.name}">
            <h3>${destination.name}</h3>
            <span class="price">${destination.price}</span>
            <button class="explore-btn">Explorar</button>
        </div>
    `).join('');
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar secciones
    updateBudget();
    updateVendors();
    updateDestinations();
    updateGuestsList();

    // Event listeners para formularios
    document.getElementById('guest-form').addEventListener('submit', addGuest);

    // Event listeners para categorías de proveedores
    document.querySelectorAll('.vendor-category').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.vendor-category').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            updateVendors(e.target.dataset.category);
        });
    });

    // Menú móvil
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    // Smooth scroll para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Cargar destinos guardados al iniciar
    const savedDestinations = JSON.parse(localStorage.getItem('destinations')) || [];
    const destinationsGrid = document.getElementById('destinations-grid');

    savedDestinations.forEach(destination => {
        const destinationCard = document.createElement('div');
        destinationCard.classList.add('destination-card');
        destinationCard.innerHTML = `
            <img src="${destination.image}" alt="${destination.name}">
            <h4>${destination.name}</h4>
        `;
        destinationsGrid.appendChild(destinationCard);
    });
});

// Lógica para guardar y cargar destinos de luna de miel

document.addEventListener('DOMContentLoaded', () => {
    // Cargar destinos guardados
    const destinationsGrid = document.getElementById('destinations-grid');
    destinationsGrid.innerHTML = '';
    const savedDestinations = JSON.parse(localStorage.getItem('destinations')) || [];
    savedDestinations.forEach(destination => {
        const destinationCard = document.createElement('div');
        destinationCard.classList.add('destination-card');
        destinationCard.innerHTML = `
            <img src="${destination.image}" alt="${destination.name}">
            <h4>${destination.name}</h4>
        `;
        destinationsGrid.appendChild(destinationCard);
    });

    // Guardar destino nuevo y actualizar localStorage
    const destinationForm = document.getElementById('destination-form');
    destinationForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const destinationName = event.target.querySelector('input[type="text"]').value;
        const destinationImage = event.target.querySelector('input[type="file"]').files[0];
        if (destinationName && destinationImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Actualizar localStorage primero
                const updatedDestinations = JSON.parse(localStorage.getItem('destinations')) || [];
                updatedDestinations.push({ name: destinationName, image: e.target.result });
                localStorage.setItem('destinations', JSON.stringify(updatedDestinations));
                // Limpiar y volver a renderizar para evitar duplicados
                destinationsGrid.innerHTML = '';
                updatedDestinations.forEach(destination => {
                    const destinationCard = document.createElement('div');
                    destinationCard.classList.add('destination-card');
                    destinationCard.innerHTML = `
                        <img src="${destination.image}" alt="${destination.name}">
                        <h4>${destination.name}</h4>
                    `;
                    destinationsGrid.appendChild(destinationCard);
                });
            };
            reader.readAsDataURL(destinationImage);
        }
        event.target.reset();
    });

    // Guardar sesión manualmente (opcional, ya se guarda al agregar)
    const saveSessionBtn = document.getElementById('save-session-btn');
    saveSessionBtn.addEventListener('click', () => {
        alert('Sesión guardada exitosamente.');
    });
});