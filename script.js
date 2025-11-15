document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Состояние Игры и Настройки ---
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
        volumeSlider: document.getElementById('volume-slider'),
        langSwitcher: document.getElementById('lang-switcher'), 
        currentFlagIcon: document.getElementById('current-flag'),
        mainMenu: document.getElementById('main-menu'),
        gameScreen: document.getElementById('game-screen'),
        moneyCount: document.getElementById('money-count'), 
        levelDisplay: document.getElementById('current-level'),
        xpBarFill: document.getElementById('xp-bar-fill'),
        xpText: document.getElementById('xp-text'),
        characterImage: document.getElementById('character-image'),
        floatingTextContainer: document.getElementById('floating-text-container'),
        textElements: document.querySelectorAll('[data-lang]')
    };

    // --- 3. База данных переводов (без изменений) ---
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


    // --- 4. Функции Сохранения/Загрузки (без изменений) ---

    function saveGame() {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }

    function loadGame() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const loadedState = JSON.parse(savedState);
            
            if (loadedState.progress) {
                gameState.progress = { ...gameState.progress, ...loadedState.progress };
            }
            if (loadedState.selectedClass) {
                gameState.selectedClass = loadedState.selectedClass;
            }

            if (gameState.selectedClass && gameState.progress[gameState.selectedClass]) {
                dom.mainMenu.classList.add('hidden');
                dom.gameScreen.classList.remove('hidden');
                document.getElementById('money-container-bottom').classList.remove('hidden'); 
                updateUI();
            }
        }
    }

    function getCurrentProgress() {
        const currentClass = gameState.selectedClass || 'krest';
        return gameState.progress[currentClass];
    }

    // --- 5. Основные Функции Игры ---
    
    window.toggleLanguageMenu = () => {
        dom.langSwitcher.classList.toggle('visible');
    };

    window.changeLanguage = (lang, flagSrc) => {
        currentLang = lang;
        const langData = translations[lang];
        dom.textElements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
        
        dom.currentFlagIcon.src = flagSrc;
        dom.langSwitcher.classList.remove('visible');
    };
    
    // Музыка
    window.playMusic = () => {
        if (!isMusicPlaying) {
            dom.music.volume = dom.volumeSlider.value / 100;
            // Убрал .then().catch(), чтобы не блокировать выполнение
            dom.music.play();
            isMusicPlaying = true;
        }
    };
    
    window.toggleMute = () => {
        // Логика mute/unmute
        if (dom.music.muted) {
            dom.music.muted = false;
            document.getElementById('speaker-icon').src = 'Images/icon_speaker_on.png';
            dom.volumeSlider.value = lastVolume;
            dom.music.volume = lastVolume / 100;
            playMusic();
        } else {
            lastVolume = dom.volumeSlider.value;
            dom.music.muted = true;
            document.getElementById('speaker-icon').src = 'Images/icon_speaker_off.png';
            dom.volumeSlider.value = 0; 
        }
    };
    
    dom.volumeSlider.addEventListener('input', (e) => {
        const volumeValue = e.target.value;
        const musicVolume = volumeValue / 100;

        dom.music.volume = musicVolume;
        
        if (volumeValue > 0) {
            dom.music.muted = false;
            document.getElementById('speaker-icon').src = 'Images/icon_speaker_on.png';
            lastVolume = volumeValue;
            playMusic();
        } else {
            dom.music.muted = true;
            document.getElementById('speaker-icon').src = 'Images/icon_speaker_off.png';
        }
    });

    // Функция выбора класса (запускает музыку)
    window.selectClass = (className) => {
        if (gameState.selectedClass && gameState.selectedClass !== className) {
            saveGame();
        }
        
        gameState.selectedClass = className;
        
        dom.mainMenu.classList.add('hidden');
        dom.gameScreen.classList.remove('hidden');
        document.getElementById('money-container-bottom').classList.remove('hidden'); 
        
        updateUI();
        saveGame();
        playMusic(); // Музыка запускается здесь, после первого взаимодействия
    };

    // ... (handleClick, buyItem, checkLevelUp, updateUI - без изменений) ...
    window.handleClick = () => {
        const currentProgress = getCurrentProgress();
        const reward = getCoinReward();
        currentProgress.money += reward;
        
        showFloatingText(`+${reward.toFixed(1)}`, 'coin');
        updateUI();
        saveGame();
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
            saveGame();
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
        
        if (currentProgress.level > oldLevel) {
            dom.xpBarFill.classList.add('level-up-flash');
            setTimeout(() => {
                dom.xpBarFill.classList.remove('level-up-flash');
            }, 500);
        }
    }

    function updateUI() {
        const currentProgress = getCurrentProgress();
        
        dom.moneyCount.textContent = currentProgress.money.toFixed(1);
        dom.levelDisplay.textContent = currentProgress.level;
        
        const currentClass = gameState.selectedClass || 'krest';
        dom.characterImage.src = `Images/${currentClass}${currentProgress.level}.png`;
        
        let xpPercent = (currentProgress.xp / xpToNextLevel) * 100;
        
        if (currentProgress.level === 5) {
            xpPercent = 100;
            dom.xpText.textContent = "MAX LEVEL";
        } else {
            dom.xpText.textContent = `${Math.floor(currentProgress.xp)} / ${xpToNextLevel} (${xpPercent.toFixed(0)}%)`;
        }
        
        dom.xpBarFill.style.width = `${xpPercent}%`;
    }
    
    // ... (Вспомогательные функции - без изменений) ...


    // Инициализация
    loadGame(); 
    
    const defaultFlagSrc = document.querySelector(`#lang-switcher img[alt="${currentLang.toUpperCase()}"]`)?.src || 'Images/flag_en.png';
    window.changeLanguage(currentLang, defaultFlagSrc);

    // ФИКС БЛОКИРОВКИ: Просто скрываем оверлей при клике
    document.getElementById('start-overlay').addEventListener('click', () => {
        if (!gameState.selectedClass) {
            gameState.selectedClass = 'krest';
            saveGame();
        }
        
        document.getElementById('start-overlay').style.display = 'none'; 
    }, { once: true }); 

});
