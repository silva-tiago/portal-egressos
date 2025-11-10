// ======= CONFIGURAÇÃO: cole aqui as URLs CSV públicas das suas abas do Google Sheets ====== //
// 
// 
 const SHEET_URLS = { vagas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=0&single=true&output=csv", cursos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=1847878382&single=true&output=csv", saude: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=743274518&single=true&output=csv", juridico: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=1913128551&single=true&output=csv", /*direitos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=485207787&single=true&output=csv" ,*/ ongs: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKPM6QrsokiKzhCk6zF_MTE7qUv177mpJGh98775BYxJjVqEoAPkVVfObYO4ujESyTmjGxC3XuNptX/pub?gid=2034435939&single=true&output=csv" }; 
 // =========================================================================================== // 
 // Utilitários 
 // 
 const painel = document.getElementById("painel");
const buttons = document.querySelectorAll("nav button");
 buttons.forEach(b => b.addEventListener("click", () => carregarSecao(b.dataset.section))); 
 document.getElementById("btn-topo")?.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));
  document.getElementById("btn-ouvir")?.addEventListener("click", () => falarTexto(painel.innerText || "Sem conteúdo para leitura.")); 
  // carregar seção inicial
  // 
   function carregarSecao(sec) { 
    // acessibilidade: mover foco para o painel 
    // 
    painel.innerHTML = "<p>Carregando...</p>"; painel.focus(); 
    if (!SHEET_URLS[sec]) { painel.innerHTML = "<p>Seção não configurada.</p>"; 
        return;
     } 
     carregarCSV(SHEET_URLS[sec]) .then(rows => renderizarSecao(sec, rows)) .catch(err => { painel.innerHTML = "<section class='card'><p>Erro ao carregar os dados. Verifique o link da planilha.</p></section>";
     console.error(err); }); } 
     // força cache-bust para evitar cache do CSV 
     // 
     function _cacheBust(url) { const sep = url.includes("?") ? "&" : "?";
         return url + sep + "cachebust=" + Date.now(); 
        } 
        // usa PapaParse para buscar e parsear CSV remoto 
        // 
        function carregarCSV(url) { 
            return new Promise((resolve, reject) => { const finalUrl = _cacheBust(url); 
                Papa.parse(finalUrl, {
                     download: true, header: true, skipEmptyLines: true, complete: function(results) { if (results && results.data) resolve(results.data); 
                        else 
                            reject(new Error("Sem dados"));
                         }, error: function(err) { reject(err); } }); }); 
                        } 
                        // renderiza conteúdo de forma legível para público com baixo letramento digital 
                        // 
                        function renderizarSecao(sec, rows) { if (!rows || rows.length === 0) { 
                            painel.innerHTML = "<section class='card'><p>Não há registros no momento.</p></section>"; 
                            return; 
                        } let html = `<section class="card"><h2>${tituloAmigavel(sec)}</h2>`;
                         // para cada linha, cria um bloco com a chave principal e detalhes 
                         // 
                         rows.forEach((r, idx) => { 
                            // seleciona a primeira coluna como título (útil pra Vagas/Cursos) 
                            // 
                            const keys = Object.keys(r); 
                            const titleKey = keys[0] || "item"; 
                            const title = r[titleKey] || `Item ${idx+1}`; 
                            html += `<article class="item" role="article" aria-label="${title}"><div><strong>${escapeHtml(title)}</strong>`; 
                            // resto dos campos 
                            // 
                            keys.forEach(k => { if (k === titleKey) return;
                                 const val = r[k] || ""; 
                                 if (val.trim()) html += `<div><small><strong>${escapeHtml(k)}:</strong> ${escapeHtml(val)}</small></div>`; });
                                  html += `</div></article>`; });
                                   html += "</section>"; 
                                   painel.innerHTML = html; 
                                   // atualizar subtitle com contagem 
                                   // 
                                   document.getElementById("subtitle").innerText = `${rows.length} itens exibidos`; } 
                                   // pequenos utilitários 
                                   // 
                                   function escapeHtml(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); } 
                                   function tituloAmigavel(id){ const map = {vagas:"Vagas de Trabalho", cursos:"Cursos e Qualificação", saude:"Apoio Psicológico e Saúde", juridico:"Apoio Jurídico", direitos:"Direitos do Egresso", ongs:"Contato de ONGs"}; return map[id] || id; } 
                                   // função de leitura em voz (Web Speech API) 
                                   // 
                                   function falarTexto(text){ if (!("speechSynthesis" in window)) { alert("Leitura por voz não disponível neste navegador.");
                                     return; } 
                                     const utter = new SpeechSynthesisUtterance(text); 
                                     utter.lang = "pt-BR"; window.speechSynthesis.cancel(); 
                                     window.speechSynthesis.speak(utter); } 
                                     // Exibir seção inicial (opcional) 
                                     // 
                                     document.addEventListener("DOMContentLoaded", () => { 
                                        // opcional: selecionar 'vagas' por padrão 
                                        // 
                                        carregarSecao('vagas'); });