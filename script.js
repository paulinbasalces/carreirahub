document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];

    // 1. Carrega os Dados do JSON
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarHome(baseDeDados);
        })
        .catch(erro => console.error('Erro ao carregar o JSON:', erro));

    // 2. Renderiza a Home Completa com Anúncios Separando as Categorias
    function renderizarHome(ferramentas) {
        const container = document.getElementById('container-categorias-home');
        container.innerHTML = ''; 
        
        // Agrupa as ferramentas por categoria
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = [];
            acc[f.categoria].push(f);
            return acc;
        }, {});

        const nomesCategorias = Object.keys(categoriasInfo);

        nomesCategorias.forEach((cat, index) => {
            const itens = categoriasInfo[cat];
            const emojiCat = itens[0].emoji;

            // Cria a Seção da Categoria
            const section = document.createElement('section');
            section.className = 'sessao-categoria';
            
            section.innerHTML = `
                <h2 class="sessao-titulo">${emojiCat} ${cat}</h2>
                <div class="grid-cards">
                    ${itens.map((item, itemIndex) => {
                        const delay = (itemIndex * 0.05) + 's'; // Animação em cascata mais rápida
                        return `
                        <article class="card" style="animation-delay: ${delay};" onclick="abrirModalFerramenta('${item.id}')">
                            <div class="card-header">
                                <span class="card-emoji">${item.emoji}</span>
                                <h3>${item.nome}</h3>
                            </div>
                            <p>${item.dor_resolvida}</p>
                            <span style="color: var(--accent-primary); font-weight: 600; margin-top: auto;">Ver análise completa →</span>
                        </article>
                        `;
                    }).join('')}
                </div>
            `;
            container.appendChild(section);

            // INJETA O ANÚNCIO ENTRE AS CATEGORIAS (exceto após a última)
            if (index < nomesCategorias.length - 1) {
                const adsHTML = document.createElement('div');
                adsHTML.className = 'area-adsense ads-home';
                adsHTML.innerHTML = '<p class="ads-label">Espaço Publicitário (AdSense Divisória)</p>';
                container.appendChild(adsHTML);
            }
        });
    }

    // 3. Abre o Modal Detalhado da Ferramenta e Injeta o Rastreio (Referral)
    window.abrirModalFerramenta = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        
        // LÓGICA DE REFERRAL (RASTREIO)
        try {
            const urlFormatada = new URL(ferramenta.url);
            urlFormatada.searchParams.append('ref', 'portalcuradoria');
            urlFormatada.searchParams.append('utm_source', 'portalcuradoria');
            document.getElementById('artigo-link').href = urlFormatada.toString();
        } catch (e) {
            // Fallback de segurança caso a URL esteja mal formatada no JSON
            document.getElementById('artigo-link').href = ferramenta.url;
        }

        mostrarOverlay();
        document.getElementById('modal-ferramenta').classList.remove('hidden');
        document.getElementById('modal-ferramenta').scrollTo(0, 0); 
    };

    // 4. Funções de Controle do Modal
    window.mostrarOverlay = function() {
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.body.classList.add('modal-open'); 
    };

    window.fecharTodosModais = function() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('modal-ferramenta').classList.add('hidden');
        document.body.classList.remove('modal-open');
    };

    window.fecharAoClicarFora = function(event) {
        if (event.target.id === 'modal-overlay') {
            fecharTodosModais();
        }
    };
});
