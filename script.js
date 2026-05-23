document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];
    const htmlElement = document.documentElement;

    // --- 1. A11Y E PREFERÊNCIAS ---
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
    function atualizarFonte() { htmlElement.style.fontSize = fontScale + '%'; localStorage.setItem('fontScale', fontScale); }

    // --- 2. RENDERIZAÇÃO ---
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarHome(baseDeDados);
        });

    function renderizarHome(ferramentas) {
        const container = document.getElementById('container-categorias-home');
        const linksRapidos = document.getElementById('links-rapidos');
        container.innerHTML = ''; linksRapidos.innerHTML = '';
        
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = [];
            acc[f.categoria].push(f); return acc;
        }, {});

        Object.keys(categoriasInfo).forEach((cat, index) => {
            const itens = categoriasInfo[cat];
            const emojiCat = itens[0].emoji;
            const catId = `cat-${index}`;

            const btnLink = document.createElement('div');
            btnLink.className = 'bento-card';
            btnLink.innerHTML = `<span class="bento-emoji">${emojiCat}</span><span class="bento-title">${cat}</span><span class="bento-subtitle">${itens.length} recursos</span>`;
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
                        <article class="card" style="animation-delay: ${delay};" onclick="abrirModalFerramenta('${item.id}')" tabindex="0">
                            <div class="card-header"><span class="card-emoji" aria-hidden="true">${item.emoji}</span><h3>${item.nome}</h3></div>
                            <p>${item.dor_resolvida}</p>
                            <span class="btn-card-link">Ver análise →</span>
                        </article>`;
                    }).join('')}
                </div>
            `;
            container.appendChild(section);

            if (index < Object.keys(categoriasInfo).length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.className = 'area-adsense ads-home';
                adsHTML.innerHTML = '<p class="ads-label">Espaço Publicitário</p>';
                container.appendChild(adsHTML);
            }
        });
    }

    // --- 3. MODAIS, GTM E COMPARTILHAMENTO ---
    let elementoAnteriorFocado;

    window.abrirModalFerramenta = function(id) {
        elementoAnteriorFocado = document.activeElement; 
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        // Push GTM Event para rastrear cliques específicos
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'view_tool',
            'tool_id': ferramenta.id,
            'tool_name': ferramenta.nome,
            'tool_category': ferramenta.categoria
        });

        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        
        let urlFinal = ferramenta.url;
        try {
            const u = new URL(ferramenta.url);
            u.searchParams.append('ref', 'portalcarreiradofuturo');
            u.searchParams.append('utm_source', 'portalcarreiradofuturo');
            urlFinal = u.toString();
        } catch(e){}
        document.getElementById('artigo-link').href = urlFinal;

        // Lógica de Compartilhamento UX 2026
        const containerBotoes = document.getElementById('botoes-compartilhamento');
        containerBotoes.innerHTML = ''; // Limpa botões antigos
        
        const textoShare = `Descobri essa ferramenta incrível: ${ferramenta.nome} - ${ferramenta.descricao}`;
        const linkSite = window.location.href;

        // Verifica se o celular suporta compartilhamento nativo de OS
        if (navigator.share) {
            const btnNative = document.createElement('button');
            btnNative.className = 'btn-share native-share';
            btnNative.innerText = '📤 Compartilhar via celular';
            btnNative.onclick = () => {
                navigator.share({ title: ferramenta.nome, text: textoShare, url: linkSite })
                .catch(console.error);
            };
            containerBotoes.appendChild(btnNative);
        } else {
            // Fallback para Desktop com botões individuais robustos
            const redes = [
                { id: 'zap', nome: 'WhatsApp', cor: 'zap', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(textoShare + ' ' + linkSite)}` },
                { id: 'in', nome: 'LinkedIn', cor: 'in', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkSite)}` },
                { id: 'x', nome: 'X', cor: 'x', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(textoShare)}&url=${encodeURIComponent(linkSite)}` },
                { id: 'bsky', nome: 'Bluesky', cor: 'bsky', url: `https://bsky.app/intent/compose?text=${encodeURIComponent(textoShare + ' ' + linkSite)}` },
                { id: 'thr', nome: 'Threads', cor: 'thr', url: `https://www.threads.net/intent/post?text=${encodeURIComponent(textoShare + ' ' + linkSite)}` }
            ];

            redes.forEach(rede => {
                const b = document.createElement('button');
                b.className = `btn-share ${rede.cor}`;
                b.innerText = rede.nome;
                b.onclick = () => window.open(rede.url, '_blank');
                containerBotoes.appendChild(b);
            });
        }

        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('modal-ferramenta');
        overlay.classList.remove('hidden'); overlay.setAttribute('aria-hidden', 'false');
        modal.classList.remove('hidden'); document.body.classList.add('modal-open');
        modal.focus(); modal.scrollTo(0, 0); 
    };

    window.fecharTodosModais = function() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('modal-ferramenta').classList.add('hidden');
        document.body.classList.remove('modal-open');
        if (elementoAnteriorFocado) elementoAnteriorFocado.focus();
    };

    window.fecharAoClicarFora = function(e) { if (e.target.id === 'modal-overlay') fecharTodosModais(); };
    document.addEventListener('keydown', (e) => { if (e.key === "Escape") fecharTodosModais(); });

    // --- 4. TOP BUTTON ---
    const btnTopo = document.getElementById('btn-voltar-topo');
    window.addEventListener('scroll', () => { window.scrollY > 500 ? btnTopo.classList.remove('hidden') : btnTopo.classList.add('hidden'); });
    btnTopo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
