document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];
    const htmlElement = document.documentElement;

    // --- CONTROLES DE ACESSIBILIDADE ---
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
    const atualizarFonte = () => { htmlElement.style.fontSize = fontScale + '%'; localStorage.setItem('fontScale', fontScale); };
    atualizarFonte();

    document.getElementById('btn-fonte-mais').addEventListener('click', () => { if (fontScale < 130) { fontScale += 10; atualizarFonte(); } });
    document.getElementById('btn-fonte-menos').addEventListener('click', () => { if (fontScale > 90) { fontScale -= 10; atualizarFonte(); } });

    // --- CARREGAMENTO E RENDERIZAÇÃO ---
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarInterface(baseDeDados);
        })
        .catch(erro => console.error('Erro ao carregar o JSON:', erro));

    function renderizarInterface(ferramentas) {
        const bentoMenu = document.getElementById('bento-menu');
        const listaFerramentas = document.getElementById('lista-ferramentas');
        bentoMenu.innerHTML = ''; listaFerramentas.innerHTML = '';
        
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = [];
            acc[f.categoria].push(f);
            return acc;
        }, {});

        const nomesCategorias = Object.keys(categoriasInfo);

        nomesCategorias.forEach((cat, index) => {
            const itens = categoriasInfo[cat];
            const emojiCat = itens[0].emoji;
            const anchorId = `cat-${index}`;

            // Bento Grid (Novo Padrão Pílula)
            const bentoCard = document.createElement('div');
            bentoCard.className = 'bento-card';
            bentoCard.innerHTML = `<span class="bento-emoji">${emojiCat}</span><span class="bento-title">${cat}</span>`;
            bentoCard.onclick = () => document.getElementById(anchorId).scrollIntoView({ behavior: 'smooth', block: 'start' });
            bentoMenu.appendChild(bentoCard);

            // Geração da Seção de Categoria
            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            section.id = anchorId; 
            
            let htmlCards = itens.map(item => {
                const linkSite = encodeURIComponent(window.location.href);
                const textoShare = encodeURIComponent(`Olha essa ferramenta incrível: ${item.nome}`);
                
                return `
                <article class="card">
                    <div class="card-conteudo">
                        <h3>${item.nome}</h3>
                        <p class="card-desc">${item.dor_resolvida}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn-card-abrir" onclick="abrirModalFerramenta('${item.id}')">Explorar Ferramenta</button>
                        <div class="mini-share-bar">
                            <button class="mini-btn zap" onclick="window.open('https://api.whatsapp.com/send?text=${textoShare}%20${linkSite}', '_blank')" aria-label="WhatsApp">Wa</button>
                            <button class="mini-btn in" onclick="window.open('https://www.linkedin.com/sharing/share-offsite/?url=${linkSite}', '_blank')" aria-label="LinkedIn">In</button>
                            <button class="mini-btn bsky" onclick="window.open('https://bsky.app/intent/compose?text=${textoShare}%20${linkSite}', '_blank')" aria-label="Bluesky">Sky</button>
                            <button class="mini-btn x" onclick="window.open('https://twitter.com/intent/tweet?text=${textoShare}&url=${linkSite}', '_blank')" aria-label="X">X</button>
                        </div>
                    </div>
                </article>
                `;
            }).join('');

            section.innerHTML = `<h2 class="sessao-titulo"><span>${emojiCat}</span> ${cat}</h2><div class="grid-cards">${htmlCards}</div>`;
            listaFerramentas.appendChild(section);

            // ADSENSE DE VOLTA ENTRE AS CATEGORIAS (Exceto na última)
            if (index < nomesCategorias.length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.className = 'area-adsense ads-home';
                adsHTML.style.marginBottom = '100px'; // Respiro alinhado ao design
                adsHTML.style.height = '100px';
                adsHTML.innerHTML = '<p class="ads-label">Espaço Publicitário</p>';
                listaFerramentas.appendChild(adsHTML);
            }
        });
    }

    // --- CONTROLE DOS MODAIS ---
    window.abrirModalFerramenta = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'tool_click',
            'tool_id': ferramenta.id,
            'tool_name': ferramenta.nome,
            'tool_category': ferramenta.categoria
        });

        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        document.getElementById('artigo-link').href = ferramenta.url;

        const emailSuporte = "suporte@carreiradofuturo.com";
        const assunto = encodeURIComponent(`Link Quebrado: ${ferramenta.nome}`);
        const corpoEmail = encodeURIComponent(`Olá,\n\nO link da ferramenta "${ferramenta.nome}" apresenta erro.\nURL: ${ferramenta.url}`);
        document.getElementById('btn-reportar').href = `mailto:${emailSuporte}?subject=${assunto}&body=${corpoEmail}`;

        const containerBotoes = document.getElementById('botoes-compartilhamento');
        containerBotoes.innerHTML = ''; 
        const linkSite = window.location.href; 
        const textoShare = `Olha essa ferramenta incrível: ${ferramenta.nome} - ${ferramenta.descricao}`;
        const textoFormatado = encodeURIComponent(`${textoShare}\n\nAcesse: ${linkSite}`);
        const linkSiteFormatado = encodeURIComponent(linkSite);

        // Substitua o innerHTML do botoes-share por este bloco:
    <button class="btn-social" onclick="window.open('https://api.whatsapp.com/send?text=${f.url}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l1.65-3.8A9 9 0 1 1 12 21h-9z"/></svg>
    </button>
    <button class="btn-social" onclick="window.open('https://bsky.app/intent/compose?text=${f.nome}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    </button>
    <button class="btn-social" onclick="window.open('https://www.threads.net/intent/post?text=${f.nome}')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
    </button>`;

        if (navigator.share && window.innerWidth <= 768) {
            const btnNative = document.createElement('button');
            btnNative.className = 'btn-share native';
            btnNative.innerText = '📤 Compartilhar';
            btnNative.onclick = () => navigator.share({ title: ferramenta.nome, text: textoShare, url: linkSite }).catch(console.error);
            containerBotoes.appendChild(btnNative);
        } else {
            const redes = [
                { id: 'whatsapp', nome: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${textoFormatado}` },
                { id: 'linkedin', nome: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${linkSiteFormatado}` },
                { id: 'bluesky', nome: 'Bluesky', url: `https://bsky.app/intent/compose?text=${textoFormatado}` },
                { id: 'threads', nome: 'Threads', url: `https://www.threads.net/intent/post?text=${textoFormatado}` },
                { id: 'x', nome: 'X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoShare)}&url=${linkSiteFormatado}` }
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
