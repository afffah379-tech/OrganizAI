// Banco de dados temporário (será substituído pelo Google Sheets)
let users = JSON.parse(localStorage.getItem('organizai_users')) || [];
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const dashboard = document.getElementById('dashboard');
const authForms = document.getElementById('authForms');

// Inicialização
document.getElementById('signupBtn').addEventListener('click', () => showAuthForm('signup'));
document.getElementById('loginBtn').addEventListener('click', () => showAuthForm('login'));
document.querySelector('.close').addEventListener('click', () => authModal.style.display = 'none');

// Mostrar formulário de autenticação
function showAuthForm(type) {
    authModal.style.display = 'block';
    
    if (type === 'signup') {
        authForms.innerHTML = `
            <h2>Criar Conta</h2>
            <form id="signupForm">
                <input type="text" placeholder="Nome do Restaurante" required>
                <input type="email" placeholder="E-mail" required>
                <input type="password" placeholder="Senha" required>
                <button type="submit">Começar Teste Grátis</button>
            </form>
            <p>Já tem conta? <a href="#" onclick="showAuthForm('login')">Faça login</a></p>
        `;
        
        document.getElementById('signupForm').addEventListener('submit', signup);
    } else {
        authForms.innerHTML = `
            <h2>Login</h2>
            <form id="loginForm">
                <input type="email" placeholder="E-mail" required>
                <input type="password" placeholder="Senha" required>
                <button type="submit">Entrar</button>
            </form>
            <p>Não tem conta? <a href="#" onclick="showAuthForm('signup')">Cadastre-se</a></p>
        `;
        
        document.getElementById('loginForm').addEventListener('submit', login);
    }
}

// Cadastro de usuário
function signup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const restaurant = formData.get(0);
    const email = formData.get(1);
    const password = formData.get(2);
    
    // Salvar usuário
    const newUser = {
        id: Date.now(),
        restaurant,
        email,
        password,
        plan: 'trial',
        trialEnd: Date.now() + 7*24*60*60*1000, // 7 dias
        data: {
            inventory: [],
            orders: [],
            menu: []
        }
    };
    
    users.push(newUser);
    localStorage.setItem('organizai_users', JSON.stringify(users));
    
    authModal.style.display = 'none';
    alert('Conta criada! Bem-vindo ao período de teste de 7 dias.');
    showDashboard(newUser);
}

// Login
function login(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get(0);
    const password = formData.get(1);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Verificar plano
        if (user.plan === 'trial' && Date.now() > user.trialEnd) {
            alert('Seu período de teste terminou. Ative o plano premium.');
            return;
        }
        
        authModal.style.display = 'none';
        showDashboard(user);
    } else {
        alert('Credenciais inválidas!');
    }
}

// Dashboard Principal
function showDashboard(user) {
    currentUser = user;
    document.querySelector('header h1').textContent = user.restaurant;
    dashboard.classList.remove('hidden');
    
    dashboard.innerHTML = `
        <div class="card">
            <h2>Resumo</h2>
            <div class="grid-container">
                <div class="summary-card">
                    <h3>Pedidos Hoje</h3>
                    <p>12</p>
                </div>
                <div class="summary-card">
                    <h3>Estoque Baixo</h3>
                    <p>3 itens</p>
                </div>
                <div class="summary-card">
                    <h3>Faturamento</h3>
                    <p>R$ 1.240,00</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>Gráficos</h2>
            <canvas id="salesChart"></canvas>
        </div>
        
        <div class="grid-container">
            <div class="card">
                <h2>Pedidos</h2>
                <button class="action-btn">Novo Pedido</button>
                <ul id="ordersList"></ul>
            </div>
            
            <div class="card">
                <h2>Estoque</h2>
                <button class="action-btn">Adicionar Item</button>
                <ul id="inventoryList"></ul>
            </div>
        </div>
        
        <div class="card">
            <h2>Seu Plano: ${user.plan === 'trial' ? 'Teste Grátis' : 'Premium'}</h2>
            ${user.plan === 'trial' ? 
                `<p>Dias restantes: ${Math.ceil((user.trialEnd - Date.now())/(1000*60*60*24))}</p>
                 <button id="upgradeBtn" class="premium-btn">Ativar Premium - R$20/mês</button>` : 
                '<p>Plano ativo! Obrigado.</p>'}
        </div>
    `;
    
    // Renderizar gráficos
    renderCharts();
    
    // Carregar dados
    loadInventory();
    loadOrders();
    
    // Event listeners
    if (document.getElementById('upgradeBtn')) {
        document.getElementById('upgradeBtn').addEventListener('click', activatePremium);
    }
}

// Funções de exemplo para módulos
function loadInventory() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = `
        <li>Tomate - 8kg (alerta: 10kg)</li>
        <li class="low">Arroz - 5kg (alerta: 15kg)</li>
        <li>Carne - 22kg (alerta: 10kg)</li>
    `;
}

function loadOrders() {
    const list = document.getElementById('ordersList');
    list.innerHTML = `
        <li>Mesa 3: R$ 120,00 (preparo)</li>
        <li>Entrega #32: R$ 85,00 (a caminho)</li>
        <li>Mesa 5: R$ 65,00 (entregue)</li>
    `;
}

function renderCharts() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            datasets: [{
                label: 'Vendas Diárias (R$)',
                data: [1200, 980, 1560, 1100, 2300, 1890],
                backgroundColor: '#2e7d32'
            }]
        }
    });
}

function activatePremium() {
    currentUser.plan = 'premium';
    localStorage.setItem('organizai_users', JSON.stringify(users));
    alert('Plano premium ativado com sucesso!');
    showDashboard(currentUser);
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target === authModal) {
        authModal.style.display = 'none';
    }
};
