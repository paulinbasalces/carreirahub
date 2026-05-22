document.addEventListener('DOMContentLoaded', () => {
    let baseDeDados = [];
    let categoriaAtual = ''; // Guarda o estado para o botão "Voltar"

    // 1. Carrega os Dados do JSON
    fetch('dados.json')
        .then(response => response.json())
        .then(data => {
            baseDeDados = data.ferramentas;
            renderizarHome(baseDeDados);
        })
        .catch(erro => console.error('Erro ao carregar o JSON:', erro));

    // 2. Renderiza apenas os Grandes Cards de Categoria na Home
    function renderizarHome(ferramentas) {
        const gridHome = document.getElementById('grid-categorias-home');
        gridHome.innerHTML = ''; // Limpa antes de renderizar
        
        // Extrai categorias únicas e conta os itens
        const categoriasInfo = ferramentas.reduce((acc, f) => {
            if (!acc[f.categoria]) acc[f.categoria] = { emoji: f.emoji, count: 0 };
            acc[f.categoria].count++;
            return acc;
        }, {});

        let delayCount = 0;
        Object.keys(categoriasInfo).forEach(cat => {
            const delay = (delayCount * 0.1) + 's';
            delayCount++;

            const card = document.createElement('article');
            card.className = 'card';
            card.style.animationDelay = delay;
            card.innerHTML = `
                <div class="card-header" style="flex-direction: column; align-items: flex-start;">
                    <span class="card-emoji">${categoriasInfo[cat].emoji}</span>
                    <h3 style="font-size: 1.5rem; margin-top:16px;">${cat}</h3>
                </div>
                <p style="margin-top: 8px;">Explore ${categoriasInfo[cat].count} recursos curados.</p>
            `;
            // Clicar abre o Modal de Categoria
            card.onclick = () => abrirModalCategoria(cat);
            gridHome.appendChild(card);
        });
    }

    // 3. Abre o Modal da Categoria (Listagem de Ferramentas)
    window.abrirModalCategoria = function(nomeCategoria) {
        categoriaAtual = nomeCategoria;
        const itensCategoria = baseDeDados.filter(f => f.categoria === nomeCategoria);
        
        document.getElementById('cat-emoji').textContent = itensCategoria[0].emoji;
        document.getElementById('cat-titulo').textContent = nomeCategoria;

        const gridModal = document.getElementById('grid-ferramentas-modal');
        gridModal.innerHTML = itensCategoria.map(item => `
            <article class="card" onclick="abrirModalFerramenta('${item.id}')" style="box-shadow: none; border-color: rgba(0,0,0,0.1); animation: none; transform: none; opacity: 1;">
                <div class="card-header">
                    <h3>${item.nome}</h3>
                </div>
                <p>${item.dor_resolvida}</p>
                <span style="color: var(--accent-primary); font-size: 0.9rem; font-weight: 600; margin-top: auto;">Ver detalhes →</span>
            </article>
        `).join('');

        mostrarOverlay();
        document.getElementById('modal-ferramenta').classList.add('hidden');
        document.getElementById('modal-categoria').classList.remove('hidden');
        document.getElementById('modal-categoria').scrollTo(0, 0); // Rola o modal pro topo
    };

    // 4. Abre o Modal da Ferramenta (Micro-artigo e Ad final)
    window.abrirModalFerramenta = function(id) {
        const ferramenta = baseDeDados.find(f => f.id === id);
        if (!ferramenta) return;
        
        document.getElementById('artigo-emoji').textContent = ferramenta.emoji;
        document.getElementById('artigo-categoria').textContent = ferramenta.categoria;
        document.getElementById('artigo-titulo').textContent = ferramenta.nome;
        document.getElementById('artigo-dor').textContent = ferramenta.dor_resolvida;
        document.getElementById('artigo-descricao').textContent = ferramenta.descricao;
        document.getElementById('artigo-link').href = ferramenta.url;

        mostrarOverlay();
        document.getElementById('modal-categoria').classList.add('hidden');
        document.getElementById('modal-ferramenta').classList.remove('hidden');
        document.getElementById('modal-ferramenta').scrollTo(0, 0); // Rola o modal pro topo
    };

    // 5. Funções de Controle dos Modais
    window.mostrarOverlay = function() {
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.body.classList.add('modal-open'); // Remove rolagem do fundo
    };

    window.voltarParaCategoria = function() {
        abrirModalCategoria(categoriaAtual);
    };

    window.fecharTodosModais = function() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.body.classList.remove('modal-open');
    };

    window.fecharAoClicarFora = function(event) {
        // Se clicar no fundo escuro (fora da caixa branca), fecha tudo
        if (event.target.id === 'modal-overlay') {
            fecharTodosModais();
        }
    };
});
