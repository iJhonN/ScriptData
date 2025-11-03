// ==UserScript==
// @name         Data e Hora Automáticos V12 SLIM
// @namespace    http://tampermonkey.net/
// @version      12.0
// @description  Script para alterar data e hora automáticamente em determinados sites.
// @author       Jhon | GPT
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function(){
    'use strict';
    
    const STORAGE_START='orcamentoDateStart', STORAGE_END='orcamentoDateEnd';
    let orcBase='1026.1';

    // -------------------- CSS --------------------
    GM_addStyle(`#dateRangeModal{position:fixed;top:0;left:0;width:100%;height:100%;display:none;justify-content:center;align-items:center;background:rgba(0,0,0,0.5);z-index:10000;}
    #modalContent{background:#fff;padding:25px;border-radius:8px;width:90%;max-width:400px;}
    #modalButtons button{padding:10px 15px;border:none;border-radius:4px;cursor:pointer;}
    #openDatePickerButton{position:fixed;bottom:20px;right:20px;width:50px;height:50px;border-radius:50%;background:#1797F5;color:#fff;cursor:pointer;z-index:9999;}`);

    // -------------------- Modal HTML --------------------
    const modalHTML=`<div id="dateRangeModal">
        <div id="modalContent">
            <h3>Intervalo de Datas</h3>
            <p>Hora aleatória (08:00-18:00) e rodapé 1-5h depois</p>
            <div><label>Data Início:</label><input type="date" id="modalDataInicio"></div>
            <div><label>Data Fim:</label><input type="date" id="modalDataFim"></div>
            <div id="modalButtons">
                <button id="aplicarData">Aplicar</button>
                <button id="fecharModal">Cancelar</button>
            </div>
            <p id="modalFeedback" style="color:red;"></p>
        </div>
    </div>
    <button id="openDatePickerButton">🗓️</button>`;
    document.body.insertAdjacentHTML('beforeend',modalHTML);

    // -------------------- Funções --------------------
    const pad=n=>String(n).padStart(2,'0');
    const formatDate=d=>`${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    const formatTime=d=>`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    function randomTime(minH=0,maxH=23){return [Math.floor(Math.random()*(maxH-minH+1))+minH,Math.floor(Math.random()*60),Math.floor(Math.random()*60)];}
    function randomDate(start,end){
        const s=start.getTime(), e=end.getTime();
        return new Date(s + Math.random()*(e-s));
    }

    function findOrc(){const b=document.querySelectorAll('b.not-select.nowrap');for(let i of b) if(i.textContent.trim()==='Orçamento') return i.closest('.form-group')?.querySelector('p.nowrap'); return null;}
    function updateOrcBase(el){if(el){const m=el.textContent.trim().match(/^([\d\.]+) -/); if(m) orcBase=m[1];}}

    function applyDates(){
        const sStr=document.getElementById('modalDataInicio').value;
        const eStr=document.getElementById('modalDataFim').value;
        if(!sStr||!eStr){document.getElementById('modalFeedback').textContent='Preencha as datas!';return;}

        let sDate=new Date(sStr), eDate=new Date(eStr);
        sDate.setHours(...randomTime(8,18));
        // Garante eDate após sDate com 1-5h
        let addH=Math.floor(Math.random()*5)+1, [m,s]=randomTime(0,59);
        eDate=new Date(sDate.getTime()+addH*3600000 + m*60000 + s*1000);

        localStorage.setItem(STORAGE_START,sStr);
        localStorage.setItem(STORAGE_END,eStr);

        const orcEl=findOrc();
        if(orcEl){updateOrcBase(orcEl);orcEl.textContent=`${orcBase} - ${formatDate(sDate)} - ${formatTime(sDate)}`;}

        // Atualiza footer
        const foot=document.querySelector('footer b');
        if(foot) foot.textContent=`Status do Orçamento: Iniciado | Relatório gerado em ${formatDate(eDate)} - ${formatTime(eDate)} pelo Sistema  • `;

        closeModal();
    }

    function openModal(){
        document.getElementById('dateRangeModal').style.display='flex';
        const s=document.getElementById('modalDataInicio'), e=document.getElementById('modalDataFim');
        s.value=localStorage.getItem(STORAGE_START) || new Date().toISOString().split('T')[0];
        e.value=localStorage.getItem(STORAGE_END) || new Date(new Date().setDate(new Date().getDate()+24)).toISOString().split('T')[0];
        document.getElementById('modalFeedback').textContent='';
    }
    function closeModal(){document.getElementById('dateRangeModal').style.display='none';}

    // -------------------- Listeners --------------------
    document.getElementById('openDatePickerButton').addEventListener('click',openModal);
    document.getElementById('fecharModal').addEventListener('click',closeModal);
    document.getElementById('aplicarData').addEventListener('click',applyDates);
    document.getElementById('dateRangeModal').addEventListener('click',e=>{if(e.target===document.getElementById('dateRangeModal')) closeModal();});

    // -------------------- Inicialização --------------------
    window.addEventListener('load',()=>{
        const savedEnd=localStorage.getItem(STORAGE_END);
        if(savedEnd){
            // Aplica uma hora aleatória na inicialização
            const sDate=new Date(localStorage.getItem(STORAGE_START));
            sDate.setHours(...randomTime(8,18));
            const foot=document.querySelector('footer b');
            if(foot){
                let addH=Math.floor(Math.random()*5)+1,[m,s]=randomTime(0,59);
                let eDate=new Date(sDate.getTime()+addH*3600000+m*60000+s*1000);
                foot.textContent=`Status do Orçamento: Iniciado | Relatório gerado em ${formatDate(eDate)} - ${formatTime(eDate)} pelo Sistema  • `;
            }
        }
    });

})();
