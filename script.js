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
    
    function getProduct(prefix) {
        let prod = 1.0;
        document.querySelectorAll(`select[id^="${prefix}"]`).forEach(s => prod *= parseFloat(s.value));
        return prod;
    }
    
    function getScaleSum(containerId) {
        let sum = 0;
        document.querySelectorAll(`#${containerId} select`).forEach(s => sum += parseFloat(s.value));
        return sum;
    }
    
    function recalcAll() {
        const basicSize = document.getElementById('basic-size-value');
        const basicUnit = document.getElementById('basic-size-unit');
        const basicErr = document.getElementById('basic-size-error');
        const basicHint = document.getElementById('basic-size-hint');
        let ksloc = getKslocFromInputs(basicSize, basicUnit, basicErr, basicHint);
        if (ksloc !== null) {
            const type = document.getElementById('basic-type').value;
            const coeff = BASIC_COCOMO[type];
            const pm = coeff.a * Math.pow(ksloc, coeff.b);
            const tm = coeff.c * Math.pow(pm, coeff.d);
            document.getElementById('basic-pm-value').innerText = pm.toFixed(2);
            document.getElementById('basic-tm-value').innerText = tm.toFixed(2);
            document.getElementById('basic-pm-detail').innerHTML = `PM = ${coeff.a} × ${ksloc.toFixed(3)}^${coeff.b} = ${pm.toFixed(2)} чел-мес.`;
            document.getElementById('basic-tm-detail').innerHTML = `TM = ${coeff.c} × ${pm.toFixed(2)}^${coeff.d} = ${tm.toFixed(2)} мес.`;
        } else {
            document.getElementById('basic-pm-value').innerText = '—';
            document.getElementById('basic-tm-value').innerText = '—';
            document.getElementById('basic-pm-detail').innerHTML = 'PM = a × (SIZE)^b (некорректный размер)';
            document.getElementById('basic-tm-detail').innerHTML = 'TM = c × (PM)^d';
        }
        
        const interSize = document.getElementById('inter-size-value');
        const interUnit = document.getElementById('inter-size-unit');
        const interErr = document.getElementById('inter-size-error');
        const interHint = document.getElementById('inter-size-hint');
        let iksloc = getKslocFromInputs(interSize, interUnit, interErr, interHint);
        if (iksloc !== null) {
            const type = document.getElementById('inter-type').value;
            const coeff = INTERMEDIATE_COEFF[type];
            const eaf = getProduct('inter_cd_');
            const pm = eaf * coeff.a * Math.pow(iksloc, coeff.b);
            const base = BASIC_COCOMO[type];
            const tm = base.c * Math.pow(pm, base.d);
            document.getElementById('inter-eaf').innerText = eaf.toFixed(3);
            document.getElementById('inter-pm').innerText = pm.toFixed(2);
            document.getElementById('inter-tm').innerText = tm.toFixed(2);
            document.getElementById('inter-eaf-detail').innerHTML = `EAF = произведение 15 множителей = ${eaf.toFixed(3)}`;
            document.getElementById('inter-pm-detail').innerHTML = `PM = ${eaf.toFixed(3)} × ${coeff.a} × ${iksloc.toFixed(3)}^${coeff.b} = ${pm.toFixed(2)} чел-мес.`;
            document.getElementById('inter-tm-detail').innerHTML = `TM = ${base.c} × ${pm.toFixed(2)}^${base.d} = ${tm.toFixed(2)} мес.`;
        } else {
            document.getElementById('inter-eaf').innerText = '—';
            document.getElementById('inter-pm').innerText = '—';
            document.getElementById('inter-tm').innerText = '—';
        }
        
        function calcCocomo2(panel, A, sizeId, scaleId, emPrefix) {
            const sizeVal = parseFloat(document.getElementById(sizeId).value);
            const errSpan = document.getElementById(`${panel}-size-error`);
            const hintSpan = document.getElementById(`${panel}-size-hint`);
            if (isNaN(sizeVal) || sizeVal <= 0) {
                if(errSpan) { errSpan.innerText = '❌ Введите положительное число'; errSpan.classList.remove('hidden'); hintSpan.classList.add('hidden'); }
                document.getElementById(`${panel}-exp`).innerText = '—';
                document.getElementById(`${panel}-eaf`).innerText = '—';
                document.getElementById(`${panel}-pm`).innerText = '—';
                document.getElementById(`${panel}-tm`).innerText = '—';
                return;
            }
            if (sizeVal > 100) {
                if(errSpan) { errSpan.innerText = '❌ Максимум 100 KSLOC'; errSpan.classList.remove('hidden'); hintSpan.classList.add('hidden'); }
                document.getElementById(`${panel}-exp`).innerText = '—';
                document.getElementById(`${panel}-eaf`).innerText = '—';
                document.getElementById(`${panel}-pm`).innerText = '—';
                document.getElementById(`${panel}-tm`).innerText = '—';
                return;
            }
            errSpan.classList.add('hidden');
            hintSpan.classList.remove('hidden');
            
            let sumSF = getScaleSum(scaleId);
            const E = COCOMO2_B + 0.01 * sumSF;
            let eaf = getProduct(emPrefix);
            let pm_ns = eaf * A * Math.pow(sizeVal, E);
            
            let sced = 1.0;
            if (panel === 'early') {
                let scedSel = document.querySelector('#early-effort-multipliers select[id*="SCED"]');
                if (scedSel) sced = parseFloat(scedSel.value);
            } else {
                let scedSel = document.querySelector('#post-effort-multipliers select[id*="SCED"]');
                if (scedSel) sced = parseFloat(scedSel.value);
            }
            const pm_final = pm_ns * sced;
            const exponentTM = 0.28 + 0.2 * (E - COCOMO2_B);
            const tm = 3.67 * Math.pow(pm_ns, exponentTM);
            const tm_final = tm * sced;
            
            document.getElementById(`${panel}-exp`).innerText = E.toFixed(4);
            document.getElementById(`${panel}-eaf`).innerText = eaf.toFixed(3);
            document.getElementById(`${panel}-pm`).innerText = pm_final.toFixed(2);
            document.getElementById(`${panel}-tm`).innerText = tm_final.toFixed(2);
            document.getElementById(`${panel}-exp-detail`).innerHTML = `ΣSF = ${sumSF.toFixed(2)} → E = 0.91 + 0.01×${sumSF.toFixed(2)} = ${E.toFixed(4)}`;
            document.getElementById(`${panel}-eaf-detail`).innerHTML = `EAF = произведение всех EM = ${eaf.toFixed(3)}`;
            document.getElementById(`${panel}-pm-detail`).innerHTML = `PM_номин = ${eaf.toFixed(3)} × ${A} × ${sizeVal}^${E.toFixed(4)} = ${pm_ns.toFixed(2)} чел-мес.<br>С учётом SCED (${sced}) → PM = ${pm_final.toFixed(2)} чел-мес.`;
            document.getElementById(`${panel}-tm-detail`).innerHTML = `TM = SCED × 3.67 × (PM_номин)^(0.28+0.2×(E-0.91)) = ${sced} × 3.67 × (${pm_ns.toFixed(2)})^${exponentTM.toFixed(4)} = ${tm_final.toFixed(2)} мес.`;
        }
        
        calcCocomo2('early', COCOMO2_A_EARLY, 'early-size', 'early-scale-factors', 'early_em_');
        calcCocomo2('post', COCOMO2_A_POST, 'post-size', 'post-scale-factors', 'post_em_');
    }
    
    function bindTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('tab-active');
                    b.classList.add('tab-inactive');
                });
                btn.classList.add('tab-active');
                btn.classList.remove('tab-inactive');
                const tabId = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(`panel-${tabId}`).classList.remove('hidden');
            });
        });
    }
    
    function init() {
        bindTabs();
        renderCostDrivers();
        renderScaleFactors('early-scale-factors');
        renderScaleFactors('post-scale-factors');
        renderEarlyMultipliers();
        renderPostMultipliers();
        document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', recalcAll));
        recalcAll();
    }
    init();
})();
