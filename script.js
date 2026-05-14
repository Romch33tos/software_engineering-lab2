(function(){
    const BASIC_COCOMO = {
        organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38, name: "Распространённый" },
        semidetached: { a: 3.0, b: 1.12, c: 2.5, d: 0.35, name: "Полунезависимый" },
        embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32, name: "Встроенный" }
    };
    
    const INTERMEDIATE_COEFF = {
        organic: { a: 3.2, b: 1.05 },
        semidetached: { a: 3.0, b: 1.12 },
        embedded: { a: 2.8, b: 1.20 }
    };
    
    const COST_DRIVERS = {
        "RELY (Надежность ПО)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [0.75,0.88,1.00,1.15,1.40] },
        "DATA (Размер БД)": { levels: ["Низкий","Средний","Высокий","Очень высокий"], values: [0.94,1.00,1.08,1.16] },
        "CPLX (Сложность продукта)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий","Критический"], values: [0.70,0.85,1.00,1.15,1.30,1.65] },
        "TIME (Ограничения быстродействия)": { levels: ["Средний","Высокий","Очень высокий","Критический"], values: [1.00,1.11,1.30,1.66] },
        "STOR (Ограничения памяти)": { levels: ["Средний","Высокий","Очень высокий","Критический"], values: [1.00,1.06,1.21,1.56] },
        "VIRT (Неустойчивость вирт. машины)": { levels: ["Низкий","Средний","Высокий","Очень высокий"], values: [0.87,1.00,1.15,1.30] },
        "TURN (Время восстановления)": { levels: ["Низкий","Средний","Высокий","Очень высокий"], values: [0.87,1.00,1.07,1.15] },
        "ACAP (Аналитические способности)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [1.46,1.19,1.00,0.86,0.71] },
        "AEXP (Опыт разработки)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [1.29,1.13,1.00,0.91,0.82] },
        "PCAP (Возможности программиста)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [1.42,1.17,1.00,0.86,0.70] },
        "VEXP (Опыт работы с вирт. машиной)": { levels: ["Очень низкий","Низкий","Средний","Высокий"], values: [1.21,1.10,1.00,0.90] },
        "LEXP (Опыт разработки на языках)": { levels: ["Очень низкий","Низкий","Средний","Высокий"], values: [1.14,1.07,1.00,0.95] },
        "MODP (Применение методов разработки)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [1.24,1.10,1.00,0.91,0.82] },
        "TOOL (Использование инструментов)": { levels: ["Очень низкий","Низкий","Средний","Высокий","Очень высокий"], values: [1.24,1.10,1.00,0.91,0.83] },
        "SCED (Требования к графику)": { levels: ["Низкий","Средний","Высокий","Очень высокий"], values: [1.23,1.08,1.00,1.04,1.10] }
    };
    
    const SCALE_FACTORS = {
        "PREC (Прецедентность)": [6.20,4.96,3.72,2.48,1.24,0.00],
        "FLEX (Гибкость процесса)": [5.07,4.05,3.04,2.03,1.01,0.00],
        "RESL (Архитектура / разрешение рисков)": [7.07,5.65,4.24,2.83,1.41,0.00],
        "TEAM (Сработанность команды)": [5.48,4.38,3.29,2.19,1.10,0.00],
        "PMAT (Зрелость процессов)": [7.80,6.24,4.68,3.12,1.56,0.00]
    };
    const SCALE_LEVELS = ["Очень низкий","Низкий","Средний","Высокий","Очень высокий","Сверхвысокий"];
    
    const EARLY_MULTIPLIERS = {
        "PERS (Квалификация персонала)": [2.12,1.62,1.26,1.00,0.83,0.63,0.50],
        "PREX (Опыт персонала)": [1.59,1.33,1.22,1.00,0.87,0.74,0.62],
        "RCPX (Сложность и надежность)": [0.49,0.60,0.83,1.00,1.33,1.91,2.72],
        "RUSE (Повторное использование)": [null,null,0.95,1.00,1.07,1.15,1.24],
        "PDIF (Сложность платформы)": [null,null,0.87,1.00,1.29,1.81,2.61],
        "FCIL (Оборудование)": [1.43,1.30,1.10,1.00,0.87,0.73,0.62],
        "SCED (График работ)": [null,1.43,1.14,1.00,1.00,null,null]
    };
    const EM_LEVELS = ["Очень низкий","Низкий","Средний","Высокий","Очень высокий","Сверхвысокий","Критический"];
    
    const POST_MULTIPLIERS = {
        "ACAP (Аналитики)": [1.42,1.29,1.00,0.85,0.71,null],
        "AEXP (Опыт приложений)": [1.22,1.10,1.00,0.88,0.81,null],
        "PCAP (Программисты)": [1.34,1.15,1.00,0.88,0.76,null],
        "PCON (Стабильность персонала)": [1.29,1.12,1.00,0.90,0.81,null],
        "PEXP (Опыт с платформой)": [1.19,1.09,1.00,0.91,0.85,null],
        "LTEX (Опыт языков/инструментов)": [1.20,1.09,1.00,0.91,0.84,null],
        "RELY (Надежность)": [0.84,0.92,1.00,1.10,1.26,null],
        "DATA (Размер БД)": [null,0.23,1.00,1.14,1.28,null],
        "CPLX (Сложность)": [0.73,0.87,1.00,1.17,1.34,1.74],
        "RUSE (Переиспользование)": [null,0.95,1.00,1.07,1.15,1.24],
        "DOCU (Документация)": [0.81,0.91,1.00,1.11,1.23,null],
        "TIME (Время выполнения)": [null,null,1.00,1.11,1.29,1.63],
        "STOR (Память)": [null,null,1.00,1.05,1.17,1.46],
        "PVOL (Изменчивость платформы)": [null,0.87,1.00,1.15,1.30,null],
        "TOOL (Инструменты)": [1.17,1.09,1.00,0.90,0.78,null],
        "SITE (Удалённая разработка)": [1.22,1.09,1.00,0.93,0.86,0.80],
        "SCED (График)": [1.43,1.14,1.00,1.00,1.00,null]
    };
    const POST_LEVELS = ["Очень низкий","Низкий","Средний","Высокий","Очень высокий","Сверхвысокий"];
    
    const COCOMO2_B = 0.91;
    const COCOMO2_A_EARLY = 2.94;
    const COCOMO2_A_POST = 2.45;
    
    function getKslocFromInputs(sizeEl, unitEl, errorEl, hintEl) {
        let raw = parseFloat(sizeEl.value);
        if (isNaN(raw)) raw = 0;
        const unit = unitEl ? unitEl.value : 'ksloc';
        let ksloc = (unit === 'sloc') ? raw / 1000 : raw;
        
        errorEl.classList.add('hidden');
        hintEl.classList.remove('hidden');
        
        if (ksloc <= 0) {
            errorEl.innerText = '❌ Объем кода должен быть больше нуля';
            errorEl.classList.remove('hidden');
            hintEl.classList.add('hidden');
            return null;
        }
        if (ksloc > 100) {
            errorEl.innerText = '❌ Максимум 100 KSLOC (100 000 SLOC)';
            errorEl.classList.remove('hidden');
            hintEl.classList.add('hidden');
            return null;
        }
        return ksloc;
    }
    
    function buildSelect(options, values, defaultVal=1.0) {
        const select = document.createElement('select');
        select.className = "param-select text-sm";
        for (let i = 0; i < options.length; i++) {
            if (values[i] !== null && values[i] !== undefined) {
                const opt = document.createElement('option');
                opt.value = values[i];
                opt.textContent = `${options[i]} (${values[i]})`;
                if (Math.abs(values[i] - defaultVal) < 0.001) opt.selected = true;
                select.appendChild(opt);
            }
        }
        return select;
    }
    
    function renderCostDrivers() {
        const container = document.getElementById('inter-cost-drivers');
        container.innerHTML = '';
        for (const [name, data] of Object.entries(COST_DRIVERS)) {
            const div = document.createElement('div'); div.className = 'factor-card';
            const label = document.createElement('label'); label.innerText = name;
            const select = buildSelect(data.levels, data.values, 1.0);
            select.id = `inter_cd_${name.replace(/[^a-zA-Z]/g, '')}`;
            select.addEventListener('change', recalcAll);
            div.appendChild(label); div.appendChild(select);
            container.appendChild(div);
        }
    }
    
    function renderScaleFactors(containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        for (const [name, values] of Object.entries(SCALE_FACTORS)) {
            const div = document.createElement('div'); div.className = 'factor-card';
            const label = document.createElement('label'); label.innerText = name;
            const select = buildSelect(SCALE_LEVELS, values, 3.72);
            select.addEventListener('change', recalcAll);
            div.appendChild(label); div.appendChild(select);
            container.appendChild(div);
        }
    }
    
    function renderEarlyMultipliers() {
        const container = document.getElementById('early-effort-multipliers');
        container.innerHTML = '';
        for (const [name, values] of Object.entries(EARLY_MULTIPLIERS)) {
            const div = document.createElement('div'); div.className = 'factor-card';
            const label = document.createElement('label'); label.innerText = name;
            const select = buildSelect(EM_LEVELS, values, 1.0);
            select.id = `early_em_${name.substring(0,5)}`;
            select.addEventListener('change', recalcAll);
            div.appendChild(label); div.appendChild(select);
            container.appendChild(div);
        }
    }
    
    function renderPostMultipliers() {
        const container = document.getElementById('post-effort-multipliers');
        container.innerHTML = '';
        for (const [name, values] of Object.entries(POST_MULTIPLIERS)) {
            const div = document.createElement('div'); div.className = 'factor-card';
            const label = document.createElement('label'); label.innerText = name;
            const select = buildSelect(POST_LEVELS, values, 1.0);
            select.id = `post_em_${name.substring(0,5)}`;
            select.addEventListener('change', recalcAll);
            div.appendChild(label); div.appendChild(select);
            container.appendChild(div);
        }
    }
})();
