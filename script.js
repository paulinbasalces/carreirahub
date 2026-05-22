document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];

    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarCategorias(baseDeDados);
        });

    function renderizarCategorias(ferramentas) {
        const container = document.getElementById('container-categorias');
        container.innerHTML = '';

        // Agrupar ferramentas por categoria
        const categorias = ferramentas.reduce((acc, ferramenta) => {
            if (!acc[ferramenta.categoria]) acc[ferramenta.categoria] = [];
            acc[ferramenta.categoria].push(ferramenta);
            return acc;
        }, {});

        // Renderizar cada bloco de categoria
        Object.keys(categorias).forEach((nomeCategoria, index) => {
            const itens = categorias[nomeCategoria];
            const emojiCat = itens[0].emoji; // Pega o emoji do primeiro item

            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            section.innerHTML = `
                <h2 class="sessao-titulo">${emojiCat} ${nomeCategoria}</h2>
                <div class="grid-cards">
                    ${itens.map(item => `
                        <article class="card" onclick="abrirArtigo('${item.id}')">
                            <div class="card-header">
                                <span class="card-emoji">${item.emoji}</span>
                                <h3>${item.nome}</h3>
                            </div>
                            <p>${item.descricao}</p>
                            <span class="btn-secundario">Ler análise completa →</span>
                        </article>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);

            // Injetar Bloco de AdSense a cada 2 categorias (para não poluir demais)
            if ((index + 1) % 2 === 0 && index !== Object.keys(categorias).length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.className = 'area-adsense';
                adsHTML.innerHTML = '<p class="ads-label">Publicidade (AdSense)</p>';
                container.appendChild(adsHTML);
            }
        });
    }

    // Função para simular a subpágina (SPA)
    window.abrirArtigo = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;

        // Preenche os dados
        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        document.getElementById('artigo-link').href = ferramenta.url;

        // Alterna as visões
        document.getElementById('home-view').classList.add('hidden');
        document.getElementById('detalhes-view').classList.remove('hidden');
        window.scrollTo(0, 0);
    };

    window.voltarParaHome = function() {
        document.getElementById('detalhes-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
        window.scrollTo(0, 0);
    };
});
