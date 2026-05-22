document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];

    // Busca os dados centralizados
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarCategorias(baseDeDados);
        })
        .catch(erro => console.error('Falha na orquestração dos dados:', erro));

    function renderizarCategorias(ferramentas) {
        const container = document.getElementById('container-categorias');
        container.innerHTML = '';

        const categorias = ferramentas.reduce((acc, ferramenta) => {
            if (!acc[ferramenta.categoria]) acc[ferramenta.categoria] = [];
            acc[ferramenta.categoria].push(ferramenta);
            return acc;
        }, {});

        Object.keys(categorias).forEach((nomeCategoria, catIndex) => {
            const itens = categorias[nomeCategoria];
            const emojiCat = itens[0].emoji;

            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            
            // Injeta o HTML com um atraso matemático na animação de cada card
            section.innerHTML = `
                <h2 class="sessao-titulo">${emojiCat} ${nomeCategoria}</h2>
                <div class="grid-cards">
                    ${itens.map((item, itemIndex) => {
                        // Calcula um atraso progressivo (Stagger Effect)
                        const delay = (itemIndex * 0.1) + 's';
                        return `
                        <article class="card" style="animation-delay: ${delay};" onclick="abrirArtigo('${item.id}')">
                            <div class="card-header">
                                <span class="card-emoji">${item.emoji}</span>
                                <h3>${item.nome}</h3>
                            </div>
                            <p>${item.descricao}</p>
                            <span style="color: var(--accent-primary); font-weight: 600; margin-top: auto;">
                                Explorar recurso →
                            </span>
                        </article>
                        `;
                    }).join('')}
                </div>
            `;
            container.appendChild(section);

            // Injeção elegante do bloco de anúncios
            if ((catIndex + 1) % 2 === 0 && catIndex !== Object.keys(categorias).length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.style.cssText = "background: rgba(15,23,42,0.02); border: 1px dashed rgba(15,23,42,0.1); border-radius: 16px; padding: 40px; margin: 60px 0; text-align: center;";
                adsHTML.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:2px;">Espaço Publicitário Reservado</span>';
                container.appendChild(adsHTML);
            }
        });
    }

    // Transição de Estado da SPA
    window.abrirArtigo = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;

        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        document.getElementById('artigo-link').href = ferramenta.url;

        document.getElementById('home-view').classList.add('hidden');
        document.getElementById('detalhes-view').classList.remove('hidden');
        
        // Rola suavemente para o topo da subpágina
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.voltarParaHome = function() {
        document.getElementById('detalhes-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});
