document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Состояние Игры ---
    let money = 0;
    let xp = 0;
    let level = 1;
    let selectedClass = '';
    let currentLang = 'en'; 
    const getXpToNextLevel = (lvl) => 1000 + (lvl * 100) + Math.pow(lvl, 2) * 50; 
    let xpNeededForCurrentLevel = getXpToNextLevel(1); 
    let isMusicPlaying = false;
    let lastVolume = 30; 
    const MAX_LEVEL = 5;

    // --- 2. Элементы DOM ---
    const dom = {
        startOverlay: document.getElementById('start-overlay'), 
        music: document.getElementById('bg-music'),
        
        muteBtn: document.getElementById('mute-btn'),
        speakerIcon: document.getElementById('speaker-icon'),
        volumeSlider: document.getElementById('volume-slider'),
        
        mainMenu: document.getElementById('main-menu'),
        gameScreen: document.getElementById('game-screen'),
        langSwitcher: document.getElementById('lang-switcher'),
        moneyContainerBottom: document.getElementById('money-container-bottom'), 
        moneyCount: document.getElementById('money-count'), 
        xpBarContainer: document.getElementById('xp-bar-container'), 
        xpBarFill: document.getElementById('xp-bar-fill'),
        xpText: document.getElementById('xp-text'),
        characterImage: document.getElementById('character-image'),
        floatingTextContainer: document.getElementById('floating-text-container'),
        saveIndicator: document.getElementById('save-indicator'), // Добавлено
        textElements: document.querySelectorAll('[data-lang]')
    };

    // --- 3. База данных переводов ---
    const translations = {
        'en': {
            'click_to_start': 'Click to Start',
            'select_class': 'Select Your Class',
            'class_peasant': 'Peasant', 'class_archer': 'Archer', 'class_mage': 'Mage', 'class_crusader': 'Crusader',
            'level': 'Level', 'cost': 'Cost',
            'item_food_name': 'Food', 'item_food_desc': 'Gives 5-10 XP',
            'item_water_name': 'Magic Water', 'item_water_desc': 'Gives 10-16 XP',
            'item_herb_name': 'Magic Herb', 'item_herb_desc': 'Gives 26-60 XP',
        },
        'lt': {
            'click_to_start': 'Spustelėkite, kad Pradėtumėte',
            'select_class': 'Pasirinkite Savo Klasę',
            'class_peasant': 'Valstietis', 'class_archer': 'Lankininkas', 'class_mage': 'Magas', 'class_crusader': 'Kryžiuotis',
            'level': 'Lygis', 'cost': 'Kaina',
            'item_food_name': 'Maistas', 'item_food_desc': 'Duoda 5-10 XP',
            'item_water_name': 'Magiškas Vanduo', 'item_water_desc': 'Duoda 10-16 XP',
            'item_herb_name': 'Magiška Žolė', 'item_herb_desc': 'Duoda 26-60 XP',
        },
        'ru': {
            'click_to_start': 'Нажмите, чтобы Начать',
            'select_class': 'Выберите Ваш Класс',
            'class_peasant': 'Крестьянин', 'class_archer': 'Лучник', 'class_mage': 'Маг', 'class_crusader': 'Крестоносец',
            'level': 'Уровень', 'cost': 'Цена',
            'item_food_name': 'Еда', 'item_food_desc': 'Дает 5-10 ОП',
            'item_water_name': 'Волшебная Вода', 'item_water_desc': 'Дает 10-16 ОП',
            'item_herb_name': 'Волшебная Трава', 'item_herb_desc': 'Дает 26-60 ОП',
        },
        'ua': {
            'click_to_start': 'Натисніть, щоб Почати',
            'select_class': 'Виберіть Ваш Клас',
            'class_peasant': 'Селянин', 'class_archer': 'Лучник', 'class_mage': 'Маг', 'class_crusader': 'Хрестоносець',
            'level': 'Рівень', 'cost': 'Ціна',
            'item_food_name': 'Їжа', 'item_food_desc': 'Дає 5-10 ДС',
            'item_water_name': 'Чарівна Вода', 'item_water_desc': 'Дає 10-16 ДС',
            'item_herb_name': 'Чарівна Трава', 'item_herb_desc': 'Дає 26-60 ДС',
        }
    };
    
    // --- 4. Функции Сохранения/Загрузки ---
    
    function saveGame() {
        const gameState = {
            money: money,
            xp: xp,
            level: level,
            selectedClass: selectedClass,
            xpNeeded: xpNeededForCurrentLevel,
            currentLang: currentLang
        };
        localStorage.setItem('gameSave', JSON.stringify(gameState));
        
        // Показать индикатор сохранения
        dom.saveIndicator.classList.remove('hidden');
        setTimeout(() => {
            dom.saveIndicator.classList.add('hidden');
        }, 500);
    }

    function loadGame() {
        const savedData = localStorage.getItem('gameSave');
        if (savedData) {
            const gameState = JSON.parse(savedData);
            money = gameState.money || 0;
            xp = gameState.xp || 0;
            level = gameState.level || 1;
            selectedClass = gameState.selectedClass || '';
            xpNeededForCurrentLevel = gameState.xpNeeded || getXpToNextLevel(level);
            currentLang = gameState.currentLang || 'en';
            
            // Если класс выбран, сразу показываем игровой экран
            if (selectedClass) {
                dom.startOverlay.style.display = 'none'; 
                dom.mainMenu.classList.add('hidden');
                dom.gameScreen.classList.remove('hidden');
                dom.moneyContainerBottom.classList.remove('hidden');
            }
            
            // Применяем язык и обновляем UI
            changeLanguage(currentLang, true); 
            updateUI(); 
            return true;
        }
        changeLanguage(currentLang, true); // Применяем язык по умолчанию
        return false;
    }

    // --- 5. Основные Функции Игры ---

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

    window.toggleMute = () => {
        if (dom.music.muted) {
            dom.music.muted = false;
            dom.speakerIcon.src = 'Images/icon_speaker_on.png';
            dom.volumeSlider.value = lastVolume;
            dom.music.volume = lastVolume / 100;

        } else {
            lastVolume = dom.volumeSlider.value;
            dom.music.muted = true;
            dom.speakerIcon.src = 'Images/icon_speaker_off.png';
            dom.volumeSlider.value = 0; 
        }
    };
    
    dom.volumeSlider.addEventListener('input', (e) => {
        const volumeValue = e.target.value;
        const musicVolume = volumeValue / 100;

        dom.music.volume = musicVolume;
        
        if (volumeValue > 0) {
            dom.music.muted = false;
            dom.speakerIcon.src = 'Images/icon_speaker_on.png';
            lastVolume = volumeValue;
        } else {
            dom.music.muted = true;
            dom.speakerIcon.src = 'Images/icon_speaker_off.png';
        }
    });

    window.changeLanguage = (lang, skipSave = false) => {
        currentLang = lang;
        const langData = translations[lang];
        dom.textElements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
        updateXPDisplay(true); 
        if (!skipSave) saveGame();
    };

    window.selectClass = (className) => {
        selectedClass = className;
        // Сброс, если это действительно новый старт, а не загрузка
        level = 1;
        xp = 0;
        xpNeededForCurrentLevel = getXpToNextLevel(1); 
        
        dom.mainMenu.classList.add('hidden');
        dom.gameScreen.classList.remove('hidden');
        dom.moneyContainerBottom.classList.remove('hidden'); 
        
        updateUI();
        saveGame();
    };

    window.handleClick = () => {
        const reward = getCoinReward();
        money += reward;
        showFloatingText(`+${reward.toFixed(1)}`, 'coin');
        updateUI();
        saveGame();
    };

    function getCoinReward() {
        const rand = Math.random() * 100; 
        if (rand < 4) { return 0.2; }
        else if (rand < 9) { return 20.0; }
        else { return getRandomInt(5, 16) + Math.random(); }
    }

    window.buyItem = (item) => {
        let cost = 0;
        let xpGain = 0;

        switch (item) {
            case 'food':
                cost = 10;
                if (money >= cost) xpGain = getRandomInt(5, 10);
                break;
            case 'water':
                cost = 16;
                if (money >= cost) xpGain = getRandomInt(10, 16);
                break;
            case 'herb':
                cost = 160; // УВЕЛИЧЕННАЯ ЦЕНА
                if (money >= cost) xpGain = getRandomInt(26, 60);
                break;
        }

        if (xpGain > 0) {
            money -= cost;
            xp += xpGain;
            showFloatingText(`+${xpGain} XP`, 'xp');
            checkLevelUp();
            updateUI();
            saveGame();
        } else if (cost > 0 && money < cost) {
            showFloatingText(translations[currentLang]['cost'] + ' x', 'coin');
        }
    };

    function checkLevelUp() {
        let leveledUp = false;

        while (xp >= xpNeededForCurrentLevel && level < MAX_LEVEL) { 
            level++;
            xp -= xpNeededForCurrentLevel; 
            xpNeededForCurrentLevel = getXpToNextLevel(level); 
            leveledUp = true;
        }
        
        if (level === MAX_LEVEL && xp > xpNeededForCurrentLevel) {
              xp = xpNeededForCurrentLevel;
        }

        if (leveledUp) {
            showFloatingText(`${translations[currentLang]['level'].toUpperCase()} UP! ${level}`, 'xp');
        }
        saveGame();
    }

    function updateXPDisplay(forceUpdate = false) {
        let xpPercent;
        
        const levelText = translations[currentLang]['level'] || "Level";

        if (level >= MAX_LEVEL) {
            xpPercent = 100;
            dom.xpText.textContent = `${levelText} MAX`;
        } else {
            xpPercent = (xp / xpNeededForCurrentLevel) * 100;
            // ОБЪЕДИНЕННАЯ СТРОКА УРОВЕНЬ И ПРОГРЕСС
            dom.xpText.textContent = `${levelText} ${level}: ${Math.floor(xp)} / ${xpNeededForCurrentLevel} (${xpPercent.toFixed(0)}%)`;
        }

        dom.xpBarFill.style.width = `${xpPercent}%`;
        
        // Эффект "живой воды": переключение анимации дрожания
        if (xpPercent > 0 && xpPercent < 100) {
            dom.xpBarContainer.classList.remove('idle-wave');
        } else {
            dom.xpBarContainer.classList.add('idle-wave');
        }
    }

    function updateUI() {
        dom.moneyCount.textContent = money.toFixed(1);
        dom.characterImage.src = `Images/${selectedClass}${level}.png`;
        updateXPDisplay(); 
    }

    function showFloatingText(text, type) {
        const el = document.createElement('div');
        el.className = `floating-text ${type}`;
        el.textContent = text;
        
        const randomX = getRandomInt(-50, 50); 
        const randomY = getRandomInt(-50, 50);
        
        el.style.left = `calc(50% + ${randomX}px)`;
        el.style.top = `calc(50% + ${randomY}px)`;
        
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
    
    loadGame();

    dom.startOverlay.addEventListener('click', () => {
        playMusic(); 
        dom.startOverlay.style.display = 'none'; 
        
        if (!selectedClass) {
            dom.mainMenu.classList.remove('hidden');
        }

    }, { once: true }); 

});
