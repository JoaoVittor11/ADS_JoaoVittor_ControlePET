document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    //  1. SELEÇÃO DE ELEMENTOS DO DOM
    // ===================================================================
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const allMainContainers = [loginContainer, registerContainer, mainAppContainer];

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const cpfLoginInput = document.getElementById('cpf-login');
    const passwordLoginInput = document.getElementById('password-login');
    const regPasswordInput = document.getElementById('reg-password');
    const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');
    const goToRegisterLink = document.getElementById('go-to-register');
    const goToLoginLink = document.getElementById('go-to-login');
    const sidebarNav = document.getElementById('sidebar-nav');

    // Página "Meus Pets"
    const petsListContainer = document.getElementById('pets-list-container');
    const showAddPetFormBtn = document.getElementById('show-add-pet-form-btn');
    const addPetFormContainer = document.getElementById('add-pet-form-container');
    const addPetForm = document.getElementById('add-pet-form');
    const cancelAddPetBtn = document.getElementById('cancel-add-pet-btn');

    // Página "Agendamentos"
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarDates = document.getElementById('calendar-dates');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDateSpan = document.getElementById('selected-date-span');
    const timeSlotsContainer = document.getElementById('time-slots');
    const appointmentDetails = document.getElementById('appointment-details');
    const petSelect = document.getElementById('pet-select');
    const serviceSelect = document.getElementById('service-select');
    const confirmAppointmentBtn = document.getElementById('confirm-appointment-btn');
    const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');

    // Página "Meu Cadastro" (ATUALIZADO - SEM CPF)
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileEmailInput = document.getElementById('profile-email');
    const profileAddressInput = document.getElementById('profile-address');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditProfileBtn = document.getElementById('cancel-edit-profile-btn');

    // Inputs alternativos (backup)
    const cpfInput = document.getElementById('cpf');
    const passwordInput = document.getElementById('password');

    // API
    const API_URL = 'http://localhost:3333';

    // ===================================================================
    //  2. DADOS E ESTADO DA APLICAÇÃO
    // ===================================================================
    let currentDate = new Date(2025, 8, 30);
    let selectedDateElement = null;
    let selectedTimeSlotElement = null;

    let currentUser = {
        name: "",
        phone: "",
        email: "",
        address: ""
    };

    const availableServices = ['Banho', 'Tosa', 'Banho e Tosa', 'Consulta Veterinária'];
    const bookedAppointments = {};
    let userPets = [];

    // ===================================================================
    //  3. FUNÇÕES DE CONTROLE DA INTERFACE (UI)
    // ===================================================================
    function showMainContainer(containerToShow) {
        allMainContainers.forEach(container => {
            if (container) container.classList.add('hidden');
        });
        if (containerToShow) containerToShow.classList.remove('hidden');
    }

    function showDashboardPage(pageId) {
        document.querySelectorAll('#main-app-container .dashboard-page').forEach(page => {
            page.classList.toggle('hidden', page.id !== `${pageId}-page`);
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });

        if (pageId === 'agendamentos') {
            renderCalendar();
        }
        if (pageId === 'meu-cadastro') {
            renderProfilePage();
        }
        if (pageId === 'meus-pets') {
            renderPetsPage();
        }
    }

    function renderProfilePage() {
        if (profileNameInput) profileNameInput.value = currentUser.name || '';
        if (profilePhoneInput) profilePhoneInput.value = currentUser.phone || '';
        if (profileEmailInput) profileEmailInput.value = currentUser.email || '';
        if (profileAddressInput) profileAddressInput.value = currentUser.address || '';
    }

    function toggleProfileEdit(isEditing) {
        if (profileNameInput) profileNameInput.readOnly = !isEditing;
        if (profilePhoneInput) profilePhoneInput.readOnly = !isEditing;
        if (profileEmailInput) profileEmailInput.readOnly = !isEditing;
        if (profileAddressInput) profileAddressInput.readOnly = !isEditing;
        
        if (editProfileBtn) editProfileBtn.classList.toggle('hidden', isEditing);
        if (saveProfileBtn) saveProfileBtn.classList.toggle('hidden', !isEditing);
        if (cancelEditProfileBtn) cancelEditProfileBtn.classList.toggle('hidden', !isEditing);
    }

    function renderPetsPage() {
        if (!petsListContainer) return;
        petsListContainer.innerHTML = '';
        if (userPets.length === 0) {
            petsListContainer.innerHTML = '<p class="initial-message">Nenhum pet cadastrado. Clique em "Adicionar Novo Pet" para começar.</p>';
        } else {
            userPets.forEach(pet => {
                const petCardHTML = `
                    <div class="pet-card">
                        <div class="pet-card-header">
                            <div class="pet-card-title">
                                <h3>${pet.nome}</h3>
                                <span>Idade: ${pet.idade}</span>
                            </div>
                            <div class="pet-card-actions">
                                <button class="action-btn btn-delete" data-action="delete-pet" data-pet-id="${pet.id}">Excluir Pet</button>
                            </div>
                        </div>
                        <div class="pet-card-info">
                            <p><strong>Pelagem:</strong> ${pet.pelagem}</p>
                            <p><strong>Problemas Médicos:</strong> ${pet.problemas_medicos}</p>
                            <p><strong>Vacinas:</strong> ${pet.notas_vacinacao}</p>
                        </div>
                    </div>`;
                petsListContainer.insertAdjacentHTML('beforeend', petCardHTML);
            });
        }
    }

    function renderCalendar() {
        if (!monthYearHeader || !calendarDates) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearHeader.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' })} ${year}`;
        calendarDates.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDates.insertAdjacentHTML('beforeend', `<div class="other-month"></div>`);
        }

        for (let i = 1; i <= lastDateOfMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.textContent = i;
            dateDiv.classList.add('calendar-day');
            dateDiv.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dateDiv.classList.add('today');
            }

            calendarDates.appendChild(dateDiv);
        }
    }

    function renderTimeSlots(dateString) {
        if (!selectedDateSpan || !timeSlotsContainer) return;

        try {
            selectedDateSpan.textContent = new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
        } catch {
            selectedDateSpan.textContent = dateString;
        }

        timeSlotsContainer.innerHTML = '';
        const appointmentsOnDate = bookedAppointments[dateString] || [];
        const availableTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

        availableTimes.forEach(time => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('time-slot');
            timeSlotDiv.dataset.time = time;

            const appointment = appointmentsOnDate.find(appt => appt.time === time);
            if (appointment) {
                timeSlotDiv.classList.add('unavailable');
                timeSlotDiv.textContent = `${time} - Indisponível`;
            } else {
                timeSlotDiv.textContent = time;
            }

            timeSlotsContainer.appendChild(timeSlotDiv);
        });
    }

    function populateAppointmentDetails() {
        if (!petSelect || !serviceSelect) return;

        petSelect.innerHTML = '<option value="">Selecione...</option>';
        if (userPets.length === 0) {
            petSelect.innerHTML = '<option value="" disabled>Nenhum pet cadastrado</option>';
        } else {
            userPets.forEach(pet => {
                petSelect.innerHTML += `<option value="${pet.id}">${pet.nome}</option>`;
            });
        }

        serviceSelect.innerHTML = '<option value="">Selecione...</option>';
        availableServices.forEach(service => {
            serviceSelect.innerHTML += `<option value="${service}">${service}</option>`;
        });
    }

    // ===================================================================
    //  4. REGISTRO E LOGIN
    // ===================================================================
    if (goToRegisterLink) {
        goToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (errorMessage) errorMessage.style.display = 'none';
            showMainContainer(registerContainer);
        });
    }

    if (goToLoginLink) {
        goToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMainContainer(loginContainer);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (regPasswordInput && regConfirmPasswordInput && regPasswordInput.value !== regConfirmPasswordInput.value) {
                alert('As senhas não coincidem.');
                return;
            }

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            delete data['confirm_password'];

            try {
                const response = await fetch(`${API_URL}/api/tutores/cadastro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Falha no cadastro.');
                alert('Cadastro realizado com sucesso! Pode fazer o login.');
                registerForm.reset();
                showMainContainer(loginContainer);
            } catch (error) {
                alert(`Erro no cadastro: ${error.message}`);
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }

            if (cpfLoginInput && passwordLoginInput) {
                const cpf = cpfLoginInput.value.trim();
                const senha = passwordLoginInput.value.trim();

                const data = { cpf, senha };
                try {
                    const response = await fetch(`${API_URL}/api/tutores/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message || 'Falha no login.');
                    
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('isEmployee', 'false');
                    
                    // Carrega dados do usuário
                    currentUser.name = result.tutor.nome_completo || '';
                    currentUser.email = result.tutor.email || '';
                    currentUser.phone = result.tutor.telefone || '';
                    currentUser.address = result.tutor.endereco || '';
                    
                    showMainContainer(mainAppContainer);
                    showDashboardPage('agendamentos');
                    renderCalendar();
                } catch (error) {
                    if (errorMessage) {
                        errorMessage.textContent = error.message;
                        errorMessage.style.display = 'block';
                    }
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isEmployee');
            if (cpfLoginInput) cpfLoginInput.value = '';
            if (passwordLoginInput) passwordLoginInput.value = '';
            showMainContainer(loginContainer);
            if (loginForm) loginForm.reset();
        });
    }

    // ===================================================================
    //  5. PERFIL - EDIÇÃO
    // ===================================================================
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            toggleProfileEdit(true);
        });
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', () => {
            toggleProfileEdit(false);
            renderProfilePage();
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');

            if (!token) {
                alert('Você precisa estar autenticado.');
                return;
            }

            const updatedData = {
                nome_completo: profileNameInput.value,
                email: profileEmailInput.value,
                telefone: profilePhoneInput.value,
                endereco: profileAddressInput.value
            };

            console.log('[DEBUG PERFIL] Atualizando dados:', updatedData);

            try {
                const response = await fetch(`${API_URL}/api/tutores/perfil`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData)
                });

                const result = await response.json();
                console.log('[DEBUG PERFIL] Resposta do servidor:', result);

                if (!response.ok) {
                    throw new Error(result.message || 'Erro ao atualizar perfil.');
                }

                currentUser.name = updatedData.nome_completo;
                currentUser.email = updatedData.email;
                currentUser.phone = updatedData.telefone;
                currentUser.address = updatedData.endereco;

                alert('Dados salvos com sucesso!');
                toggleProfileEdit(false);
            } catch (error) {
                console.error('[DEBUG PERFIL] Erro:', error);
                alert(`Erro ao salvar: ${error.message}`);
            }
        });
    }

    // ===================================================================
    //  6. EVENT LISTENERS
    // ===================================================================
    
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const pageId = navItem.dataset.page;
                if (pageId) showDashboardPage(pageId);
            }
        });
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (calendarDates) {
        calendarDates.addEventListener('click', (e) => {
            if (e.target.dataset.date && !e.target.classList.contains('other-month')) {
                if (selectedDateElement) selectedDateElement.classList.remove('selected');
                selectedDateElement = e.target;
                selectedDateElement.classList.add('selected');
                renderTimeSlots(e.target.dataset.date);
                if (appointmentDetails) appointmentDetails.classList.add('hidden');
                if (confirmAppointmentBtn) confirmAppointmentBtn.classList.add('hidden');
                if (cancelAppointmentBtn) cancelAppointmentBtn.classList.add('hidden');
                selectedTimeSlotElement = null;
            }
        });
    }

    if (timeSlotsContainer) {
        timeSlotsContainer.addEventListener('click', (e) => {
            if (e.target.matches('.time-slot')) {
                if (selectedTimeSlotElement) selectedTimeSlotElement.classList.remove('selected');
                selectedTimeSlotElement = e.target;
                selectedTimeSlotElement.classList.add('selected');

                const isUnavailable = e.target.classList.contains('unavailable');
                if (cancelAppointmentBtn) cancelAppointmentBtn.classList.toggle('hidden', !isUnavailable);
                if (appointmentDetails) appointmentDetails.classList.toggle('hidden', isUnavailable);
                if (confirmAppointmentBtn) confirmAppointmentBtn.classList.toggle('hidden', isUnavailable);

                if (!isUnavailable) {
                    populateAppointmentDetails();
                }
            }
        });
    }

    if (confirmAppointmentBtn) {
        confirmAppointmentBtn.addEventListener('click', () => {
            if (!selectedDateElement || !selectedTimeSlotElement) return;

            const petId = parseInt(petSelect.value);
            const service = serviceSelect.value;

            if (!petId || !service) {
                alert('Por favor, selecione um pet e um serviço para agendar.');
                return;
            }

            const dateString = selectedDateElement.dataset.date;
            const timeString = selectedTimeSlotElement.dataset.time;

            if (!bookedAppointments[dateString]) bookedAppointments[dateString] = [];
            bookedAppointments[dateString].push({ time: timeString, petId, service });

            renderTimeSlots(dateString);
            if (appointmentDetails) appointmentDetails.classList.add('hidden');
            if (confirmAppointmentBtn) confirmAppointmentBtn.classList.add('hidden');
            selectedTimeSlotElement = null;
            alert('Agendamento confirmado com sucesso!');
        });
    }

    if (cancelAppointmentBtn) {
        cancelAppointmentBtn.addEventListener('click', () => {
            if (!selectedDateElement || !selectedTimeSlotElement) return;

            const dateString = selectedDateElement.dataset.date;
            const timeString = selectedTimeSlotElement.dataset.time;

            if (bookedAppointments[dateString]) {
                const appointmentIndex = bookedAppointments[dateString].findIndex(appt => appt.time === timeString);
                if (appointmentIndex > -1) {
                    bookedAppointments[dateString].splice(appointmentIndex, 1);
                    renderTimeSlots(dateString);
                }
            }

            if (cancelAppointmentBtn) cancelAppointmentBtn.classList.add('hidden');
            selectedTimeSlotElement = null;
        });
    }

    // ===================================================================
    //  7. PETS - CADASTRO
    // ===================================================================
    if (showAddPetFormBtn) {
        showAddPetFormBtn.addEventListener('click', () => {
            if (addPetFormContainer) addPetFormContainer.classList.remove('hidden');
            if (showAddPetFormBtn) showAddPetFormBtn.classList.add('hidden');
        });
    }

    if (cancelAddPetBtn) {
        cancelAddPetBtn.addEventListener('click', () => {
            if (addPetFormContainer) addPetFormContainer.classList.add('hidden');
            if (showAddPetFormBtn) showAddPetFormBtn.classList.remove('hidden');
            if (addPetForm) addPetForm.reset();
        });
    }

    if (addPetForm) {
        addPetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');

            if (!token) {
                alert('Você precisa estar autenticado para cadastrar um pet.');
                return;
            }

            const petData = {
                nome: document.getElementById('pet-name').value,
                idade: document.getElementById('pet-age').value,
                pelagem: document.getElementById('pet-fur').value,
                problemas_medicos: document.getElementById('pet-problems').value,
                notas_vacinacao: document.getElementById('pet-vaccines').value
            };

            try {
                const response = await fetch(`${API_URL}/api/tutores/pets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(petData)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Erro ao cadastrar pet.');
                }

                alert('Pet cadastrado com sucesso!');
                userPets.push(result.pet);
                renderPetsPage();
                addPetForm.reset();
                if (addPetFormContainer) addPetFormContainer.classList.add('hidden');
                if (showAddPetFormBtn) showAddPetFormBtn.classList.remove('hidden');
            } catch (error) {
                alert(`Erro ao cadastrar pet: ${error.message}`);
            }
        });
    }

    if (petsListContainer) {
        petsListContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.action-btn');
            if (!target) return;

            const action = target.dataset.action;
            const petId = parseInt(target.dataset.petId);

            if (action === 'delete-pet') {
                if (confirm('Tem certeza que deseja excluir este pet?')) {
                    const petIndex = userPets.findIndex(p => p.id === petId);
                    if (petIndex > -1) {
                        userPets.splice(petIndex, 1);
                        renderPetsPage();
                    }
                }
            }
        });
    }

    // ===================================================================
    //  8. INICIALIZAÇÃO
    // ===================================================================
    const token = localStorage.getItem('authToken');

    if (token) {
        showMainContainer(mainAppContainer);
        showDashboardPage('agendamentos');
    } else {
        showMainContainer(loginContainer);
    }
});
