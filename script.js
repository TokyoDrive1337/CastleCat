// --- Глобальные Переменные ---
let money = 0;
let level = 1;
let currentXP = 0;
let requiredXP = 100;
let xpMultiplier = 1.0;
let clickPower = 1;

// --- Данные Магазина (ОБНОВЛЕНИЕ: ЦЕНА ТРАВЫ 160) ---
const shopItems = {
    'healing-potion': { name: 'Зелье Лечения', price: 50, owned: 0, power: 5, description: '+5 к силе клика' },
    'magic-herb': { name: 'Волшебная Трава', price: 160, owned: 0, power: 0.05, description: '+5% к множителю XP' },
    'heavy-armor': { name: 'Тяжелая Броня', price: 250, owned: 0, power: 2, description: '+2 к силе клика' }
};

// --- DOM Элементы ---
const gameScreen = document.getElementById('game-screen');
const mainMenu = document.getElementById('main-menu');
const clickArea = document.getElementById('click-area');
const characterImage = document.getElementById('character-image');
const moneyDisplay = document.getElementById('money-display');
const levelInfo = document.getElementById('level-info');
const xpBar = document.getElementById('xp-bar');
const classSelectionButtons = document.querySelectorAll('.class-btn');
const levelupMessage = document.getElementById('levelup-message');

// --- Функции Инициализации ---

// Выбор класса
classSelectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const selectedClass = button.getAttribute('data-class');
        startGame(selectedClass);
    });
});

function startGame(className) {
    mainMenu.style.display = 'none';
    gameScreen.style.display = 'flex';
    
    // Устанавливаем стартовые бонусы в зависимости от класса
    if (className === 'Warrior') {
        xpMultiplier = 1.0; // База
        clickPower = 1;
        characterImage.src = 'Images/Character_Warrior.png';
    } else if (className === 'Mage') {
        xpMultiplier = 1.1; // Бонус к XP
        clickPower = 1;
        characterImage.src = 'Images/Character_Mage.png';
    } else if (className === 'Rogue') {
        xpMultiplier = 1.0;
        clickPower = 2; // Бонус к силе клика
        characterImage.src = 'Images/Character_Rogue.png';
    }
    
    // Инициализируем игру
    updateDisplays();
    setupShopListeners();
}

// --- Основные Игровые Функции ---

// Клик по персонажу
clickArea.addEventListener('click', () => {
    // Начисление монет (базовое значение)
    money += clickPower;
    
    // Начисление XP с учетом множителя
    gainXP(1 * xpMultiplier);
    
    updateDisplays();
});

// Начисление XP и проверка уровня
function gainXP(amount) {
    currentXP += amount;
    
    if (currentXP >= requiredXP) {
        levelUp();
    }
    
    updateDisplays();
}

// Повышение Уровня
function levelUp() {
    level++;
    currentXP -= requiredXP; // Оставшийся XP переносится
    requiredXP = Math.floor(requiredXP * 1.5); // Увеличиваем требование к XP (на 50%)
    
    // Бонусы за уровень
    money += 100;
    xpMultiplier += 0.05; // +5% к множителю XP

    // Показать сообщение
    showLevelUpMessage();
}

function showLevelUpMessage() {
    levelupMessage.classList.remove('hidden');
    // Сбрасываем и повторно запускаем анимацию
    levelupMessage.style.animation = 'none';
    levelupMessage.offsetHeight; // Триггер рефлоу для сброса анимации
    levelupMessage.style.animation = 'fadeOut 3s forwards';
}

// --- Функции Обновления Интерфейса ---

function updateDisplays() {
    // Обновляем отображение монет
    moneyDisplay.textContent = formatNumber(money);
    
    // Обновляем шкалу XP и текст уровня
    updateXPBar();
    
    // Обновляем кнопки магазина
    updateShopButtons();
}

// ОБНОВЛЕНИЕ: Объединение текста XP и уровня
function updateXPBar() {
    const percentage = Math.min(100, (currentXP / requiredXP) * 100);
    xpBar.style.width = percentage + '%';
    
    // ОБЪЕДИНЕНИЕ СТРОК: Уровень и Процент XP теперь в одном элементе
    levelInfo.textContent = `Уровень ${level} (${Math.floor(percentage)}%)`;
}


function updateShopButtons() {
    for (const key in shopItems) {
        const item = shopItems[key];
        const button = document.querySelector(`.shop-item[data-item="${key}"]`);
        
        if (button) {
            // Обновляем количество
            const itemName = item.name.substring(0, item.name.indexOf('(')).trim();
            button.innerHTML = `
                ${itemName} (${item.owned})
                <br>Цена: ${item.price}
            `;
            
            // Визуальное состояние (доступно/недоступно)
            if (money >= item.price) {
                button.disabled = false;
                button.style.opacity = '1.0';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
            
            // Добавляем описание (power) к названию кнопки
            button.title = `${item.description}. Стоимость: ${item.price}`;
        }
    }
}

// --- Функции Магазина ---

function setupShopListeners() {
    document.querySelectorAll('.shop-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemKey = e.currentTarget.getAttribute('data-item');
            buyItem(itemKey);
        });
    });
}

function buyItem(itemKey) {
    const item = shopItems[itemKey];
    
    if (money >= item.price) {
        money -= item.price;
        item.owned++;
        
        // Применение эффекта
        if (itemKey === 'healing-potion' || itemKey === 'heavy-armor') {
            clickPower += item.power;
            item.price = Math.floor(item.price * 1.5); // Увеличение цены
        } else if (itemKey === 'magic-herb') {
            xpMultiplier += item.power;
            item.price = Math.floor(item.price * 1.5); // Увеличение цены
        }
        
        updateDisplays();
    }
}

// --- Вспомогательные Функции ---

// Форматирование больших чисел
function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(2) + 'M';
}

// Инициализация при загрузке (показ меню)
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация отображения бонуса в меню
    document.getElementById('class-bonus').innerHTML = `
        <p><b>Воин:</b> Базовые характеристики</p>
        <p><b>Маг:</b> +10% к XP</p>
        <p><b>Разбойник:</b> +1 к силе клика</p>
    `;
});
