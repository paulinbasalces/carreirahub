document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];
    const htmlElement = document.documentElement;

    // --- 1. CONTROLES DE ACESSIBILIDADE (Restaurados) ---
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') htmlElement.setAttribute('data-theme', 'dark');

    document.getElementById('btn-tema').addEventListener('click', () => {
        if (htmlElement.getAttribute('data-theme') === 'dark') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
        }
    });

    let fontScale = parseInt(localStorage.getItem('fontScale')) || 100;
    const atualizarFonte = () => { 
        htmlElement.style.fontSize = fontScale + '%'; 
        localStorage.setItem('fontScale', fontScale); 
    };
    atualizarFonte();

    document.getElementById('btn-fonte-mais').addEventListener('click', () => { 
        if (fontScale < 130) { fontScale += 10; atualizarFonte(); } 
    });
    document.getElementById('btn-fonte-menos').addEventListener('click', () => { 
        if (fontScale > 90) { fontScale -= 10; atualizarFonte(); } 
    });

    // --- 2. CARREGAMENTO E RENDERIZAÇÃO ---
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarInterface(baseDeDados);
        });

    function renderizarInterface(ferramentas) {
        const bentoMenu = document.getElementById('bento-menu');
        const listaFerramentas = document.getElementById('lista-ferramentas');
        bentoMenu.innerHTML = ''; listaFerramentas.innerHTML = '';
        
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = [];
            acc[f.categoria].push(f);
            return acc;
        }, {});

        Object.keys(categoriasInfo).forEach((cat, index) => {
            const itens = categoriasInfo[cat];
            const emojiCat = itens[0].emoji;
            const anchorId = `cat-${index}`;

            // Bento Grid
            const bentoCard = document.createElement('div');
            bentoCard.className = 'bento-card';
            bentoCard.innerHTML = `<span class="bento-emoji">${emojiCat}</span><span class="bento-title">${cat}</span>`;
            bentoCard.onclick = () => document.getElementById(anchorId).scrollIntoView({ behavior: 'smooth', block: 'start' });
            bentoMenu.appendChild(bentoCard);

            // Grid de Conteúdo
            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            section.id = anchorId; 
            section.innerHTML = `
                <h2 class="sessao-titulo">${emojiCat} ${cat}</h2>
                <div class="grid-cards">
                    ${itens.map(item => `
                        <article class="card" onclick="abrirModalFerramenta('${item.id}')">
                            <h3>${item.nome}</h3>
                            <p>${item.dor_resolvida}</p>
                        </article>
                    `).join('')}
                </div>
            `;
            listaFerramentas.appendChild(section);
        });
    }

    // --- 3. MODAIS, GTM E COMPARTILHAMENTO ---
    window.abrirModalFerramenta = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        // Push GTM Event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'tool_click',
            'tool_id': ferramenta.id,
            'tool_name': ferramenta.nome,
            'tool_category': ferramenta.categoria
        });

        // Preencher dados
        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        document.getElementById('artigo-link').href = ferramenta.url;

        // Link de Reporte
        const emailSuporte = "suporte@carreiradofuturo.com";
        const assunto = encodeURIComponent(`Link Quebrado: ${ferramenta.nome}`);
        const corpo = encodeURIComponent(`O link da ferramenta "${ferramenta.nome}" está quebrado.\n\nURL: ${ferramenta.url}`);
        document.getElementById('btn-reportar').href = `mailto:${emailSuporte}?subject=${assunto}&body=${corpo}`;

        // Compartilhamento Social (Restaurado)
        const containerBotoes = document.getElementById('botoes-compartilhamento');
        containerBotoes.innerHTML = ''; 
        
        const textoShare = `Olha essa ferramenta para a carreira: ${ferramenta.nome}`;
        const linkSite = window.location.href; 
        const textoFormatado = encodeURIComponent(`${textoShare}\n\nAcesse: ${linkSite}`);
        const linkSiteFormatado = encodeURIComponent(linkSite);

        if (navigator.share && window.innerWidth <= 768) {
            const btnNative = document.createElement('button');
            btnNative.className = 'btn-share native';
            btnNative.innerText = '📤 Compartilhar (Nativo)';
            btnNative.onclick = () => navigator.share({ title: ferramenta.nome, text: textoShare, url: linkSite });
            containerBotoes.appendChild(btnNative);
        } else {
            const redes = [
                { id: 'whatsapp', nome: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${textoFormatado}` },
                { id: 'linkedin', nome: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${linkSiteFormatado}` },
                { id: 'bluesky', nome: 'Bluesky', url: `https://bsky.app/intent/compose?text=${textoFormatado}` },
                { id: 'threads', nome: 'Threads', url: `https://www.threads.net/intent/post?text=${textoFormatado}` },
                { id: 'x', nome: 'X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoShare)}&url=${linkSiteFormatado}` },
                { id: 'telegram', nome: 'Telegram', url: `https://t.me/share/url?url=${linkSiteFormatado}&text=${encodeURIComponent(textoShare)}` }
            ];

            redes.forEach(rede => {
                const b = document.createElement('button');
                b.className = `btn-share ${rede.id}`;
                b.innerText = rede.nome;
                b.onclick = () => window.open(rede.url, '_blank');
                containerBotoes.appendChild(b);
            });
        }

        document.getElementById('modal-overlay').classList.remove('hidden');
        document.body.classList.add('modal-open');
    };

    window.fecharTodosModais = function() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.body.classList.remove('modal-open');
    };

    window.fecharAoClicarFora = function(event) { if (event.target.id === 'modal-overlay') fecharTodosModais(); };
    document.addEventListener('keydown', function(event) { if (event.key === "Escape") fecharTodosModais(); });
});