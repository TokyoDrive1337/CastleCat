document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Состояние Игры (Используем структуру для сохранения) ---
    const initialProgress = { money: 0, xp: 0, level: 1 };
    let gameState = {
        selectedClass: '',
        progress: {
            'krest': { ...initialProgress },
            'BOW': { ...initialProgress },
            'MAG': { ...initialProgress },
            'krestos': { ...initialProgress },
        }
    };

    const xpToNextLevel = 1613;
    let isMusicPlaying = false;
    let lastVolume = 30; 
    let currentLang = 'en';

    // --- 2. Элементы DOM ---
    const dom = {
        startOverlay: document.getElementById('start-overlay'), 
        music: document.getElementById('bg-music'),
        
        muteBtn: document.getElementById('mute-btn'),
        speakerIcon: document.getElementById('speaker-icon'),
        volumeSlider: document.getElementById('volume-slider'),
        
        mainMenu: document.getElementById('main-menu'),
        gameScreen: document.getElementById('game-screen'),
        moneyContainerBottom: document.getElementById('money-container-bottom'), 
        moneyCount: document.getElementById('money-count'), 
        levelDisplay: document.getElementById('current-level'),
        xpBarFill: document.getElementById('xp-bar-fill'),
        xpText: document.getElementById('xp-text'),
        characterImage: document.getElementById('character-image'),
        floatingTextContainer: document.getElementById('floating-text-container'),
        textElements: document.querySelectorAll('[data-lang]')
    };

    // --- 3. База данных переводов ---
    const translations = {
        'en': {
            'click_to_start': 'Click to Start', 'select_class': 'Select Your Class',
            'class_peasant': 'Peasant', 'class_archer': 'Archer', 'class_mage': 'Mage', 'class_crusader': 'Crusader',
            'level': 'Level', 'cost': 'Cost',
            'item_food_name': 'Food', 'item_food_desc': 'Gives 5-10 XP',
            'item_water_name': 'Magic Water', 'item_water_desc': 'Gives 10-16 XP',
            'item_herb_name': 'Magic Herb', 'item_herb_desc': 'Gives 26-60 XP',
        },
        'lt': {
            'click_to_start': 'Spustelėkite, kad Pradėtumėte', 'select_class': 'Pasirinkite Savo Klasę',
            'class_peasant': 'Valstietis', 'class_archer': 'Lankininkas', 'class_mage': 'Magas', 'class_crusader': 'Kryžiuotis',
            'level': 'Lygis', 'cost': 'Kaina',
            'item_food_name': 'Maistas', 'item_food_desc': 'Duoda 5-10 XP',
            'item_water_name': 'Magiškas Vanduo', 'item_water_desc': 'Duoda 10-16 XP',
            'item_herb_name': 'Magiška Žolė', 'item_herb_desc': 'Duoda 26-60 XP',
        },
        'ru': {
            'click_to_start': 'Нажмите, чтобы Начать', 'select_class': 'Выберите Ваш Класc',
            'class_peasant': 'Крестьянин', 'class_archer': 'Лучник', 'class_mage': 'Маг', 'class_crusader': 'Крестоносец',
            'level': 'Уровень', 'cost': 'Цена',
            'item_food_name': 'Еда', 'item_food_desc': 'Дает 5-10 ОП',
            'item_water_name': 'Волшебная Вода', 'item_water_desc': 'Дает 10-16 ОП',
            'item_herb_name': 'Волшебная Трава', 'item_herb_desc': 'Дает 26-60 ОП',
        },
        'ua': {
            'click_to_start': 'Натисніть, щоб Почати', 'select_class': 'Виберіть Ваш Клас',
            'class_peasant': 'Селянин', 'class_archer': 'Лучник', 'class_mage': 'Маг', 'class_crusader': 'Хрестоносець',
            'level': 'Рівень', 'cost': 'Ціна',
            'item_food_name': 'Їжа', 'item_food_desc': 'Дає 5-10 ДС',
            'item_water_name': 'Чарівна Вода', 'item_water_desc': 'Дає 10-16 ДС',
            'item_herb_name': 'Чарівна Трава', 'item_herb_desc': 'Дає 26-60 ДС',
        }
    };


    // --- 4. Функции Сохранения/Загрузки (УСИЛЕНО) ---

    function saveGame() {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }

    function loadGame() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const loadedState = JSON.parse(savedState);
            // Мерж загруженного состояния с начальным для гарантии, что все персонажи присутствуют
            gameState = {
                ...gameState,
                ...loadedState,
                progress: { ...gameState.progress, ...loadedState.progress }
            };

            // Если сохраненный класс есть, сразу переходим на экран игры
            if (gameState.selectedClass) {
                dom.mainMenu.classList.add('hidden');
                dom.gameScreen.classList.remove('hidden');
                dom.moneyContainerBottom.classList.remove('hidden'); 
                updateUI();
            }
        }
    }

    // Вспомогательная функция для получения текущего прогресса персонажа
    function getCurrentProgress() {
        if (!gameState.selectedClass) return gameState.progress['krest']; // Fallback
        return gameState.progress[gameState.selectedClass];
    }

    // --- 5. Основные Функции Игры ---

    // ... (toggleMute, volumeSlider.addEventListener, changeLanguage - без изменений)

    window.selectClass = (className) => {
        // Сохраняем прогресс предыдущего персонажа, если он был
        if (gameState.selectedClass) {
            saveGame();
        }
        
        gameState.selectedClass = className;
        
        // Переход к экрану игры
        dom.mainMenu.classList.add('hidden');
        dom.gameScreen.classList.remove('hidden');
        dom.moneyContainerBottom.classList.remove('hidden'); 
        
        updateUI();
        saveGame();
    };

    window.handleClick = () => {
        const currentProgress = getCurrentProgress();
        const reward = getCoinReward();
        currentProgress.money += reward;
        
        showFloatingText(`+${reward.toFixed(1)}`, 'coin');
        updateUI();
        saveGame(); // Сохраняем после каждого клика
    };

    window.buyItem = (item) => {
        const currentProgress = getCurrentProgress();
        let cost = 0;
        let xpGain = 0;

        switch (item) {
            case 'food': cost = 10; if (currentProgress.money >= cost) xpGain = getRandomInt(5, 10); break;
            case 'water': cost = 16; if (currentProgress.money >= cost) xpGain = getRandomInt(10, 16); break;
            case 'herb': cost = 23; if (currentProgress.money >= cost) xpGain = getRandomInt(26, 60); break;
        }

        if (xpGain > 0) {
            currentProgress.money -= cost;
            currentProgress.xp += xpGain;
            showFloatingText(`+${xpGain} XP`, 'xp');
            checkLevelUp();
            updateUI();
            saveGame(); // Сохраняем после покупки
        } else if (cost > 0 && currentProgress.money < cost) {
            console.log("Not enough money");
        }
    };

    function checkLevelUp() {
        const currentProgress = getCurrentProgress();
        const oldLevel = currentProgress.level;

        while (currentProgress.xp >= xpToNextLevel) { 
            if (currentProgress.level < 5) {
                currentProgress.level++;
                currentProgress.xp -= xpToNextLevel; 
            } else {
                currentProgress.xp = xpToNextLevel; 
                break; 
            }
        }
        
        // Активируем эффект при повышении уровня
        if (currentProgress.level > oldLevel) {
            dom.xpBarFill.classList.add('level-up-flash');
            // Убираем класс, чтобы можно было запустить эффект снова
            setTimeout(() => {
                dom.xpBarFill.classList.remove('level-up-flash');
            }, 500);
        }
    }

    function updateUI() {
        const currentProgress = getCurrentProgress();
        
        dom.moneyCount.textContent = currentProgress.money.toFixed(1);
        dom.levelDisplay.textContent = currentProgress.level;
        
        // Обновление картинки и XP Bar
        dom.characterImage.src = `Images/${gameState.selectedClass}${currentProgress.level}.png`;
        
        let xpPercent = (currentProgress.xp / xpToNextLevel) * 100;
        
        if (currentProgress.level === 5) {
            xpPercent = 100;
            dom.xpText.textContent = "MAX LEVEL";
        } else {
            dom.xpText.textContent = `${Math.floor(currentProgress.xp)} / ${xpToNextLevel} (${xpPercent.toFixed(0)}%)`;
        }
        
        dom.xpBarFill.style.width = `${xpPercent}%`;
    }

    // ... (остальные вспомогательные функции: getCoinReward, playMusic, showFloatingText, getRandomInt)
    
    function getCoinReward() { 
        const rand = Math.random() * 100; 
        if (rand < 4) { return 0.2; }
        else if (rand < 9) { return 20.0; }
        else { return getRandomInt(5, 16) + Math.random(); }
    }
    
    function playMusic() {
        if (!isMusicPlaying) {
            dom.music.volume = dom.volumeSlider.value / 100;
            dom.music.play().then(() => {
                isMusicPlaying = true;
            }).catch(error => {
                console.warn("Music play failed.", error);
            });
        }
    }
    
    function showFloatingText(text, type) { 
        const el = document.createElement('div');
        el.className = `floating-text ${type}`;
        el.textContent = text;
        el.style.left = `${getRandomInt(-30, 30)}px`;
        dom.floatingTextContainer.appendChild(el);
        
        setTimeout(() => {
            el.remove();
        }, 1000); 
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // --- 6. Инициализация ---
    
    loadGame(); // Загружаем прогресс при старте
    changeLanguage(currentLang);

    dom.startOverlay.addEventListener('click', () => {
        playMusic(); 
        dom.startOverlay.style.display = 'none'; 
    }, { once: true }); 

});
