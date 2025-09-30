document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    //  1. SELEÇÃO DE ELEMENTOS DO DOM
    // ===================================================================
    
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const allMainContainers = [loginContainer, registerContainer, mainAppContainer];

    const loginForm = document.getElementById('login-form');
    const cpfInput = document.getElementById('cpf');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const goToRegisterLink = document.getElementById('go-to-register');
    const goToLoginLink = document.getElementById('go-to-login');

    const sidebarNav = document.getElementById('sidebar-nav');
    const navItems = sidebarNav.querySelectorAll('.nav-item');
    
    // --- PÁGINA "MEUS PETS" ---
    const petsListContainer = document.getElementById('pets-list-container');
    const showAddPetFormBtn = document.getElementById('show-add-pet-form-btn');
    const addPetFormContainer = document.getElementById('add-pet-form-container');
    const addPetForm = document.getElementById('add-pet-form');
    const cancelAddPetBtn = document.getElementById('cancel-add-pet-btn');
    
    // --- PÁGINA "AGENDAMENTOS" ---
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDateSpan = document.getElementById('selected-date-span');
    const timeSlotsContainer = document.getElementById('time-slots');
    const confirmAppointmentBtn = document.getElementById('confirm-appointment-btn');
    const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');

    // ===================================================================
    //  2. DADOS E ESTADO DA APLICAÇÃO (SIMULANDO BANCO DE DADOS)
    // ===================================================================
    
    let currentDate = new Date(2025, 8, 30); // Setembro 2025
    let selectedDateElement = null;
    let selectedTimeSlotElement = null;

    const bookedAppointments = {
        '2025-09-30': ['10:00', '14:00'], '2025-10-05': ['11:00'], '2025-10-15': ['09:00', '10:00', '15:00', '16:00'],
    };
    
    let userPets = [];

    // ===================================================================
    //  3. FUNÇÕES PRINCIPAIS
    // ===================================================================

    function showMainContainer(containerToShow) {
        allMainContainers.forEach(container => container.classList.toggle('hidden', container !== containerToShow));
    }

    function showDashboardPage(pageId) {
        document.querySelectorAll('#main-app-container .dashboard-page').forEach(page => {
            page.classList.toggle('hidden', page.id !== `${pageId}-page`);
        });
        navItems.forEach(item => item.classList.toggle('active', item.dataset.page === pageId));
    }

    function renderPetsPage() {
        petsListContainer.innerHTML = '';
        if (userPets.length === 0) {
            petsListContainer.innerHTML = '<p class="initial-message">Nenhum pet cadastrado. Clique em "Adicionar Novo Pet" para começar.</p>';
        } else {
            userPets.forEach(pet => {
                const vaccineRows = pet.vaccinations.map((v, index) => `
                    <tr>
                        <td>${v.vaccine}</td>
                        <td>${v.date}</td>
                        <td>${v.time}</td>
                        <td>${v.location}</td>
                        <td>
                            <div class="vaccine-actions">
                                <button class="action-btn btn-edit" data-action="edit-vaccine" data-pet-id="${pet.id}" data-vaccine-index="${index}">Editar</button>
                                <button class="action-btn btn-delete" data-action="delete-vaccine" data-pet-id="${pet.id}" data-vaccine-index="${index}">Excluir</button>
                            </div>
                        </td>
                    </tr>`).join('');
                
                const petCardHTML = `
                    <div class="pet-card">
                        <div class="pet-card-header">
                            <div class="pet-card-title">
                                <h3>${pet.name}</h3>
                                <span>Idade: ${pet.age}</span>
                            </div>
                            <div class="pet-card-actions">
                                <button class="action-btn btn-edit" data-action="edit-pet" data-pet-id="${pet.id}">Editar Pet</button>
                                <button class="action-btn btn-delete" data-action="delete-pet" data-pet-id="${pet.id}">Excluir Pet</button>
                            </div>
                        </div>
                        <div class="pet-card-info">
                            <p><strong>Pelagem:</strong> ${pet.fur}</p>
                            <p><strong>Problemas Médicos:</strong> ${pet.medicalProblems}</p>
                            <p class="full-width"><strong>Vacinas (Histórico/Próximas):</strong> ${pet.vaccineNotes}</p>
                            ${pet.vaccinations.length > 0 ? `
                            <div class="vaccine-card">
                                <h4>Carteirinha de Vacinação</h4>
                                <table class="vaccine-table">
                                    <thead>
                                        <tr>
                                            <th>Vacina</th>
                                            <th>Data</th>
                                            <th>Hora</th>
                                            <th>Local</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>${vaccineRows}</tbody>
                                </table>
                            </div>` : ''}
                        </div>
                    </div>`;
                petsListContainer.insertAdjacentHTML('beforeend', petCardHTML);
            });
        }
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearHeader.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;
        calendarDates.innerHTML = '';
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDayOfMonth; i++) calendarDates.insertAdjacentHTML('beforeend', `<div class="other-month"></div>`);
        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.textContent = i;
            dateDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) dateDiv.classList.add('today');
            calendarDates.appendChild(dateDiv);
        }
    }
    
    function renderTimeSlots(dateString) {
        selectedDateSpan.textContent = new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
        timeSlotsContainer.innerHTML = '';
        const booked = bookedAppointments[dateString] || [];
        const availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        availableTimes.forEach(time => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.textContent = time;
            timeSlotDiv.classList.add('time-slot');
            if(booked.includes(time)) timeSlotDiv.classList.add('unavailable');
            else timeSlotDiv.dataset.time = time;
            timeSlotsContainer.appendChild(timeSlotDiv);
        });
    }

    // ===================================================================
    //  4. EVENT LISTENERS
    // ===================================================================

    // --- Autenticação ---
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        errorMessage.style.display = 'none';
        if (cpfInput.value === '123' && passwordInput.value === '123') {
            showMainContainer(mainAppContainer);
            showDashboardPage('agendamentos');
            renderPetsPage(); renderCalendar();
        } else {
            errorMessage.style.display = 'block';
        }
    });
    logoutBtn.addEventListener('click', () => { cpfInput.value = ''; passwordInput.value = ''; showMainContainer(loginContainer); });
    goToRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showMainContainer(registerContainer); });
    goToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showMainContainer(loginContainer); });

    // --- Navegação do Tutor ---
    sidebarNav.addEventListener('click', (e) => {
        if (e.target.matches('.nav-item')) { e.preventDefault(); const pageId = e.target.dataset.page; if (pageId) showDashboardPage(pageId); }
    });
    
    // --- Agendamentos ---
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    calendarDates.addEventListener('click', (e) => { if (e.target.dataset.date && !e.target.classList.contains('other-month')) { if (selectedDateElement) selectedDateElement.classList.remove('selected'); selectedDateElement = e.target; selectedDateElement.classList.add('selected'); renderTimeSlots(e.target.dataset.date); confirmAppointmentBtn.classList.add('hidden'); cancelAppointmentBtn.classList.add('hidden'); selectedTimeSlotElement = null; } });
    timeSlotsContainer.addEventListener('click', (e) => { if (e.target.matches('.time-slot')) { if (selectedTimeSlotElement) selectedTimeSlotElement.classList.remove('selected'); selectedTimeSlotElement = e.target; selectedTimeSlotElement.classList.add('selected'); cancelAppointmentBtn.classList.toggle('hidden', !e.target.classList.contains('unavailable')); confirmAppointmentBtn.classList.toggle('hidden', e.target.classList.contains('unavailable')); } });
    confirmAppointmentBtn.addEventListener('click', () => { if (!selectedDateElement || !selectedTimeSlotElement) return; const dateString = selectedDateElement.dataset.date; const timeString = selectedTimeSlotElement.dataset.time; if (!bookedAppointments[dateString]) bookedAppointments[dateString] = []; bookedAppointments[dateString].push(timeString); selectedTimeSlotElement.classList.add('unavailable'); selectedTimeSlotElement.removeAttribute('data-time'); confirmAppointmentBtn.classList.add('hidden'); selectedTimeSlotElement = null; });
    cancelAppointmentBtn.addEventListener('click', () => { if (!selectedDateElement || !selectedTimeSlotElement) return; const dateString = selectedDateElement.dataset.date; const timeString = selectedTimeSlotElement.textContent; if (bookedAppointments[dateString]) { const index = bookedAppointments[dateString].indexOf(timeString); if (index > -1) bookedAppointments[dateString].splice(index, 1); } selectedTimeSlotElement.classList.remove('unavailable'); selectedTimeSlotElement.setAttribute('data-time', timeString); cancelAppointmentBtn.classList.add('hidden'); selectedTimeSlotElement = null; });
    
    // --- Cadastro de Pets ---
    showAddPetFormBtn.addEventListener('click', () => {
        addPetFormContainer.classList.remove('hidden');
        showAddPetFormBtn.classList.add('hidden');
    });

    cancelAddPetBtn.addEventListener('click', () => {
        addPetFormContainer.classList.add('hidden');
        showAddPetFormBtn.classList.remove('hidden');
        addPetForm.reset();
    });

    addPetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPet = {
            id: userPets.length > 0 ? Math.max(...userPets.map(p => p.id)) + 1 : 1,
            name: document.getElementById('pet-name').value,
            age: document.getElementById('pet-age').value,
            fur: document.getElementById('pet-fur').value,
            medicalProblems: document.getElementById('pet-problems').value,
            vaccineNotes: document.getElementById('pet-vaccines').value,
            vaccinations: [] 
        };
        userPets.push(newPet);
        renderPetsPage();
        addPetFormContainer.classList.add('hidden');
        showAddPetFormBtn.classList.remove('hidden');
        addPetForm.reset();
    });

    // --- Gerenciamento de Pets e Vacinas ---
    petsListContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        const action = target.dataset.action;
        const petId = parseInt(target.dataset.petId);
        
        // Ações relacionadas ao PET
        if (action === 'delete-pet') {
            if (confirm('Tem certeza que deseja excluir o cadastro deste pet? Esta ação não pode ser desfeita.')) {
                const petIndex = userPets.findIndex(p => p.id === petId);
                if (petIndex > -1) {
                    userPets.splice(petIndex, 1);
                    renderPetsPage();
                }
            }
        }
        
        if (action === 'edit-pet') {
            const pet = userPets.find(p => p.id === petId);
            if (pet) {
                const newName = prompt('Nome do Pet:', pet.name);
                if (newName === null) return;
                const newAge = prompt('Idade:', pet.age);
                if (newAge === null) return;
                const newFur = prompt('Pelagem:', pet.fur);
                if (newFur === null) return;
                const newProblems = prompt('Problemas Médicos:', pet.medicalProblems);
                if (newProblems === null) return;
                const newVaccineNotes = prompt('Vacinas (Histórico/Próximas):', pet.vaccineNotes);
                if (newVaccineNotes === null) return;

                pet.name = newName;
                pet.age = newAge;
                pet.fur = newFur;
                pet.medicalProblems = newProblems;
                pet.vaccineNotes = newVaccineNotes;
                renderPetsPage();
            }
        }

        // Ações relacionadas a VACINAS
        const vaccineIndex = parseInt(target.dataset.vaccineIndex);

        if (action === 'delete-vaccine') {
            if (confirm('Tem certeza que deseja excluir este registro de vacina?')) {
                const pet = userPets.find(p => p.id === petId);
                if (pet) {
                    pet.vaccinations.splice(vaccineIndex, 1);
                    renderPetsPage();
                }
            }
        }

        if (action === 'edit-vaccine') {
            const pet = userPets.find(p => p.id === petId);
            if (pet) {
                const vaccineRecord = pet.vaccinations[vaccineIndex];
                const newVaccineName = prompt('Nome da Vacina:', vaccineRecord.vaccine);
                if (newVaccineName === null) return;
                const newDate = prompt('Data (DD/MM/AAAA):', vaccineRecord.date);
                if (newDate === null) return;
                const newTime = prompt('Hora (HH:MM):', vaccineRecord.time);
                if (newTime === null) return;
                const newLocation = prompt('Local da Aplicação:', vaccineRecord.location);
                if (newLocation === null) return;

                vaccineRecord.vaccine = newVaccineName;
                vaccineRecord.date = newDate;
                vaccineRecord.time = newTime;
                vaccineRecord.location = newLocation;
                renderPetsPage();
            }
        }
    });

    // ===================================================================
    //  5. INICIALIZAÇÃO DA APLICAÇÃO
    // ===================================================================
    showMainContainer(loginContainer);
});

