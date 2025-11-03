// ==UserScript==
// @name         Data e Hora Automáticos V11 FAT
// @namespace    http://tampermonkey.net/
// @version      11.0
// @description  Script para alterar data e hora automáticamente em determinados sites.
// @author       Jhon | GPT
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY_START = 'orcamentoDateOnlyStartRandom';
    const STORAGE_KEY_END = 'orcamentoDateOnlyEndRandom';
    let orcamentoBase = '1026.1';

    // ================== ESTILO ==================
    GM_addStyle(`
        #dateRangeModal {
            position: fixed; top:0; left:0; width:100%; height:100%;
            background-color: rgba(0,0,0,0.5);
            display:none; justify-content:center; align-items:center; z-index:10000;
        }
        #modalContent {
            background-color: #fff; padding:25px; border-radius:8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); width:90%; max-width:400px;
        }
        #modalContent h3 { margin-top:0; color:#3c4350; border-bottom:1px solid #ddd; padding-bottom:10px; margin-bottom:15px; }
        .form-row { margin-bottom:15px; }
        .form-row label { display:block; margin-bottom:5px; font-weight:bold; color:#596270; }
        .form-row input[type="date"] { width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px; }
        #modalButtons { display:flex; justify-content:space-between; margin-top:20px; }
        #modalButtons button { padding:10px 15px; border:none; border-radius:4px; cursor:pointer; font-weight:bold; }
        #aplicarData { background-color:#49C758; color:white; }
        #fecharModal { background-color:#E55352; color:white; }
        #openDatePickerButton { position:fixed; bottom:20px; right:20px; background-color:#1797F5; color:white; padding:15px;
            border-radius:50%; border:none; box-shadow:0 4px 8px rgba(0,0,0,0.2); cursor:pointer; font-size:14px; font-weight:bold;
            z-index:9999; width:50px; height:50px; text-align:center; line-height:20px; transition: background-color 0.3s;
        }
        #openDatePickerButton:hover { background-color:#0056b3; }
        #horarioFixo { font-size:0.9em; color:#777; margin-top:5px; }
    `);

    function injectModalHTML() {
        const modalHTML = `
            <div id="dateRangeModal">
                <div id="modalContent">
                    <h3>Selecionar Intervalo de Datas</h3>
                    <p id="horarioFixo">Horário do orçamento: aleatório entre 08:00 e 18:00. Rodapé: 1-5h depois.</p>
                    <div class="form-row">
                        <label for="modalDataInicio">Data de Início:</label>
                        <input type="date" id="modalDataInicio" required>
                    </div>
                    <div class="form-row">
                        <label for="modalDataFim">Data de Fim:</label>
                        <input type="date" id="modalDataFim" required>
                    </div>
                    <div id="modalButtons">
                        <button id="aplicarData">Aplicar ao Orçamento</button>
                        <button id="fecharModal">Cancelar</button>
                    </div>
                    <p id="modalFeedback" style="color:red; margin-top:10px;"></p>
                </div>
            </div>
            <button id="openDatePickerButton" title="Abrir Seleção de Data">🗓️</button>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ================== FUNÇÕES AUXILIARES ==================
    function generateRandomTimeStr(minH, maxH){
        let hour = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
        let minute = Math.floor(Math.random() * 60);
        let second = Math.floor(Math.random() * 60);
        return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second).padStart(2,'0')}`;
    }

    function findOrcamentoElement(){
        const labelsB = document.querySelectorAll('b.not-select.nowrap');
        let labelOrcamento = null;
        labelsB.forEach(b=>{
            if(b.textContent && b.textContent.trim()==='Orçamento'){
                labelOrcamento = b;
            }
        });
        if(labelOrcamento){
            const formGroupDiv = labelOrcamento.closest('.form-group');
            if(formGroupDiv) return formGroupDiv.querySelector('p.nowrap');
        }
        return null;
    }

    function updateOrcamentoBase(el){
        if(el){
            const text = el.textContent.trim();
            const match = text.match(/^([\d\.]+) -/);
            if(match) orcamentoBase = match[1];
        }
    }

    function formatarData(date){
        const dia = String(date.getDate()).padStart(2,'0');
        const mes = String(date.getMonth()+1).padStart(2,'0');
        const ano = String(date.getFullYear());
        return `${dia}/${mes}/${ano}`;
    }

    function formatarHora(date){
        return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;
    }

    // ================== APLICAÇÃO ==================
    function applySavedData(startStr,endStr){
        if(!startStr || !endStr) return;
        const orcEl = findOrcamentoElement();
        if(!orcEl) return;
        updateOrcamentoBase(orcEl);

        // DATA ALEATÓRIA ENTRE INÍCIO E FIM
        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        const randomTime = startDate.getTime() + Math.random()*(endDate.getTime()-startDate.getTime());
        const randomDate = new Date(randomTime);

        // HORA ALEATÓRIA DO ORÇAMENTO 08:00-18:00
        const randomHourStr = generateRandomTimeStr(8,18);
        const [h,m,s] = randomHourStr.split(':').map(Number);
        randomDate.setHours(h,m,s);

        const dataFmt = formatarData(randomDate);
        const novoValor = `${orcamentoBase} - ${dataFmt} - ${randomHourStr}`;
        orcEl.textContent = novoValor;

        // ATUALIZA RODAPÉ
        updateFooter(randomDate);
        console.log(`Tampermonkey: Orçamento atualizado para ${novoValor}`);
    }

    function updateFooter(baseDate){
        const footerB = document.querySelector('footer b');
        if(!footerB) return;

        const newDate = new Date(baseDate.getTime());
        // adiciona aleatoriamente 1 a 5 horas
        const addHours = Math.floor(Math.random()*5)+1;
        const addMinutes = Math.floor(Math.random()*60);
        const addSeconds = Math.floor(Math.random()*60);
        newDate.setHours(newDate.getHours()+addHours,newDate.getMinutes()+addMinutes,newDate.getSeconds()+addSeconds);

        const formatted = formatarData(newDate)+' - '+formatarHora(newDate);
        footerB.innerHTML = footerB.innerHTML.replace(/Relatório gerado em .*? pelo/, `Relatório gerado em ${formatted} pelo`);
    }

    function openModal(){
        const modal = document.getElementById('dateRangeModal');
        const startInput = document.getElementById('modalDataInicio');
        const endInput = document.getElementById('modalDataFim');
        modal.style.display = 'flex';
        document.getElementById('modalFeedback').textContent = '';

        const savedStart = localStorage.getItem(STORAGE_KEY_START);
        const savedEnd = localStorage.getItem(STORAGE_KEY_END);
        updateOrcamentoBase(findOrcamentoElement());
        if(savedStart && savedEnd){
            startInput.value = savedStart;
            endInput.value = savedEnd;
        } else {
            const today = new Date();
            startInput.value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            const endD = new Date();
            endD.setDate(endD.getDate()+24);
            endInput.value = `${endD.getFullYear()}-${String(endD.getMonth()+1).padStart(2,'0')}-${String(endD.getDate()).padStart(2,'0')}`;
        }
    }

    function closeModal(){ document.getElementById('dateRangeModal').style.display='none'; }

    function applyDataToOrcamento(){
        const startInput = document.getElementById('modalDataInicio');
        const endInput = document.getElementById('modalDataFim');
        const feedback = document.getElementById('modalFeedback');

        const startStr = startInput.value;
        const endStr = endInput.value;
        if(!startStr || !endStr){ feedback.textContent='⚠️ Preencha as duas datas.'; return; }

        const startDate = new Date(startStr);
        const endDate = new Date(endStr);
        if(startDate.getTime()>=endDate.getTime()){
            feedback.textContent=`❌ Erro: Data de Início (${startStr}) não pode ser depois da Data de Fim (${endStr}).`;
            return;
        }

        localStorage.setItem(STORAGE_KEY_START,startStr);
        localStorage.setItem(STORAGE_KEY_END,endStr);
        applySavedData(startStr,endStr);
        feedback.textContent='✅ Aplicado e salvo com sucesso!';
        setTimeout(closeModal,800);
    }

    // ================== INICIALIZAÇÃO ==================
    function setupListeners(){
        const modal = document.getElementById('dateRangeModal');
        document.getElementById('openDatePickerButton').addEventListener('click',openModal);
        document.getElementById('fecharModal').addEventListener('click',closeModal);
        document.getElementById('aplicarData').addEventListener('click',applyDataToOrcamento
