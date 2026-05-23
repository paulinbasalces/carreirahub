document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];
    const htmlElement = document.documentElement;

    // --- 1. CONTROLES DE ACESSIBILIDADE ---
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') htmlElement.setAttribute('data-theme', 'dark');

    document.getElementById('btn-tema').addEventListener('click', () => {
        const temaAtual = htmlElement.getAttribute('data-theme');
        if (temaAtual === 'dark') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
        }
    });

    let fontScale = parseInt(localStorage.getItem('fontScale')) || 100;
    atualizarFonte();

    document.getElementById('btn-fonte-mais').addEventListener('click', () => { if (fontScale < 130) { fontScale += 10; atualizarFonte(); } });
    document.getElementById('btn-fonte-menos').addEventListener('click', () => { if (fontScale > 90) { fontScale -= 10; atualizarFonte(); } });

    function atualizarFonte() {
        htmlElement.style.fontSize = fontScale + '%';
        localStorage.setItem('fontScale', fontScale);
    }

    // --- 2. CARREGAMENTO E RENDERIZAÇÃO ---
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarHome(baseDeDados);
        })
        .catch(erro => console.error('Erro ao carregar o JSON:', erro));

    function renderizarHome(ferramentas) {
        const container = document.getElementById('container-categorias-home');
        const linksRapidos = document.getElementById('links-rapidos');
        container.innerHTML = ''; 
        linksRapidos.innerHTML = '';
        
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = [];
            acc[f.categoria].push(f);
            return acc;
        }, {});

        const nomesCategorias = Object.keys(categoriasInfo);

        nomesCategorias.forEach((cat, index) => {
            const itens = categoriasInfo[cat];
            const emojiCat = itens[0].emoji;
            const catId = `cat-${index}`;

            const btnLink = document.createElement('div');
            btnLink.className = 'bento-card';
            btnLink.innerHTML = `
                <span class="bento-emoji">${emojiCat}</span>
                <span class="bento-title">${cat}</span>
                <span class="bento-subtitle">${itens.length} recursos</span>
            `;
            btnLink.onclick = () => document.getElementById(catId).scrollIntoView({ behavior: 'smooth', block: 'start' });
            linksRapidos.appendChild(btnLink);

            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            section.id = catId; 
            
            section.innerHTML = `
                <h2 class="sessao-titulo">${emojiCat} ${cat}</h2>
                <div class="grid-cards">
                    ${itens.map((item, itemIndex) => {
                        const delay = (itemIndex * 0.05) + 's';
                        return `
                        <article class="card" style="animation-delay: ${delay};" onclick="abrirModalFerramenta('${item.id}')" tabindex="0" role="button" aria-label="Abrir detalhes de ${item.nome}">
                            <div class="card-header">
                                <span class="card-emoji" aria-hidden="true">${item.emoji}</span>
                                <h3>${item.nome}</h3>
                            </div>
                            <p>${item.dor_resolvida}</p>
                            <span class="btn-card-link">Ver análise completa →</span>
                        </article>
                        `;
                    }).join('')}
                </div>
            `;
            container.appendChild(section);

            if (index < nomesCategorias.length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.className = 'area-adsense ads-home';
                adsHTML.innerHTML = '<p class="ads-label">Espaço Publicitário</p>';
                container.appendChild(adsHTML);
            }
        });
    }

    // --- 3. CONTROLE DOS MODAIS E VIRALIDADE ---
    let elementoAnteriorFocado;

    window.abrirModalFerramenta = function(id) {
        elementoAnteriorFocado = document.activeElement; 
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        
        let urlFinal = ferramenta.url;
        try {
            const urlFormatada = new URL(ferramenta.url);
            urlFormatada.searchParams.append('ref', 'portalcarreiradofuturo');
            urlFormatada.searchParams.append('utm_source', 'portalcarreiradofuturo');
            urlFinal = urlFormatada.toString();
        } catch (e) { /*Fallback*/ }
        
        document.getElementById('artigo-link').href = urlFinal;

        const textoShare = `Olha essa ferramenta incrível que achei no Portal Carreira do Futuro: *${ferramenta.nome}* - ${ferramenta.descricao}\n\nAcesse pelo hub: ${window.location.href}`;
        
        document.getElementById('btn-share-zap').onclick = () => {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textoShare)}`, '_blank');
        };
        
        document.getElementById('btn-share-in').onclick = () => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
        };

        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal-ferramenta');
        
        overlay.classList.remove('hidden');
        overlay.setAttribute('aria-hidden', 'false');
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        
        modal.focus();
        modal.scrollTo(0, 0); 
    };

    window.fecharTodosModais = function() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
        document.getElementById('modal-ferramenta').classList.add('hidden');
        document.body.classList.remove('modal-open');
        if (elementoAnteriorFocado) elementoAnteriorFocado.focus();
    };

    window.fecharAoClicarFora = function(event) { if (event.target.id === 'modal-overlay') fecharTodosModais(); };
    document.addEventListener('keydown', function(event) { if (event.key === "Escape") fecharTodosModais(); });

    // --- 4. BOTÃO VOLTAR AO TOPO ---
    const btnTopo = document.getElementById('btn-voltar-topo');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) btnTopo.classList.remove('hidden');
        else btnTopo.classList.add('hidden');
    });
    btnTopo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
