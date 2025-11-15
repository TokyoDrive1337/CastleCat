document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Состояние Игры ---
    let money = 0;
    let xp = 0;
    let level = 1;
    let selectedClass = '';
    let currentLang = 'en'; 
    // ИЗМЕНЕНИЕ 3: Более реалистичная прогрессия XP (для примера)
    // Функция для расчета XP: 1000 + (level * 100) + Math.pow(level, 2) * 50;
    const getXpToNextLevel = (lvl) => 1000 + (lvl * 100) + Math.pow(lvl, 2) * 50; 
    let xpNeededForCurrentLevel = getXpToNextLevel(1); 
    let isMusicPlaying = false;
    let lastVolume = 30; 

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
        levelDisplay: document.getElementById('current-level'),
        xpBarContainer: document.getElementById('xp-bar-container'), // Добавлено
        xpBarFill: document.getElementById('xp-bar-fill'),
        xpText: document.getElementById('xp-text'),
        characterImage: document.getElementById('character-image'),
        floatingTextContainer: document.getElementById('floating-text-container'),
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

    // --- 4. Основные Функции Игры ---

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
    
    // --- 5. Слушатели Событий ---

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

    // ИЗМЕНЕНИЕ 4: Функция переключения языка
    window.changeLanguage = (lang) => {
        currentLang = lang;
        const langData = translations[lang];
        dom.textElements.forEach(el => {
            const key = el.getAttribute('data-lang');
            if (langData[key]) {
                el.textContent = langData[key];
            }
        });
        // Дополнительно обновляем XP-текст при смене языка
        updateXPDisplay(true); 
    };

    window.selectClass = (className) => {
        selectedClass = className;
        level = 1;
        xp = 0;
        xpNeededForCurrentLevel = getXpToNextLevel(1); // Инициализация XP для 1 уровня
        
        dom.mainMenu.classList.add('hidden');
        dom.gameScreen.classList.remove('hidden');
        dom.moneyContainerBottom.classList.remove('hidden'); 
        
        updateUI();
    };

    window.handleClick = () => {
        const reward = getCoinReward();
        money += reward;
        showFloatingText(`+${reward.toFixed(1)}`, 'coin');
        updateUI();
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
                cost = 23;
                if (money >= cost) xpGain = getRandomInt(26, 60);
                break;
        }

        if (xpGain > 0) {
            money -= cost;
            xp += xpGain;
            showFloatingText(`+${xpGain} XP`, 'xp');
            checkLevelUp();
            updateUI();
        } else if (cost > 0 && money < cost) {
            // Можно добавить сообщение о недостатке денег
            showFloatingText(translations[currentLang]['cost'] + ' x', 'coin');
        }
    };

    // ИЗМЕНЕНИЕ 3: Обновленная логика повышения уровня
    function checkLevelUp() {
        // Уровень MAX_LEVEL (например, 5)
        const MAX_LEVEL = 5; 
        let leveledUp = false;

        while (xp >= xpNeededForCurrentLevel && level < MAX_LEVEL) { 
            level++;
            // Вычитаем только то XP, что нужно было для прошлого уровня
            xp -= xpNeededForCurrentLevel; 
            xpNeededForCurrentLevel = getXpToNextLevel(level); // Расчет XP для следующего уровня
            leveledUp = true;
        }
        
        // Если достигнут MAX_LEVEL
        if (level === MAX_LEVEL && xp > xpNeededForCurrentLevel) {
             xp = xpNeededForCurrentLevel;
        }

        if (leveledUp) {
            // Добавляем эффект повышения уровня (можно создать отдельную анимацию)
            console.log(`Leveled Up! New Level: ${level}`);
            showFloatingText(`LEVEL UP! ${level}`, 'xp');
        }
    }

    // ИЗМЕНЕНИЕ 3: Функция обновления интерфейса XP
    function updateXPDisplay(forceUpdate = false) {
        const MAX_LEVEL = 5;
        let xpPercent;
        
        if (level >= MAX_LEVEL) {
            xpPercent = 100;
            // Получаем перевод для "MAX LEVEL"
            const maxLevelText = translations[currentLang]['level'] ? translations[currentLang]['level'] + ' MAX' : "MAX LEVEL";
            dom.xpText.textContent = maxLevelText;
        } else {
            xpPercent = (xp / xpNeededForCurrentLevel) * 100;
            dom.xpText.textContent = `${Math.floor(xp)} / ${xpNeededForCurrentLevel} (${xpPercent.toFixed(0)}%)`;
        }

        // Плавное заполнение шкалы
        dom.xpBarFill.style.width = `${xpPercent}%`;
    }

    function updateUI() {
        dom.moneyCount.textContent = money.toFixed(1);
        dom.levelDisplay.textContent = level;
        
        // Эта строка отвечает за отображение картинки персонажа
        dom.characterImage.src = `Images/${selectedClass}${level}.png`;
        
        updateXPDisplay(); // Обновление шкалы XP
    }

    function showFloatingText(text, type) {
        const el = document.createElement('div');
        el.className = `floating-text ${type}`;
        el.textContent = text;
        
        // Рандомное позиционирование вокруг центра
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
    
    changeLanguage(currentLang);

    dom.startOverlay.addEventListener('click', () => {
        playMusic(); 
        dom.startOverlay.style.display = 'none'; 
    }, { once: true }); 

});
