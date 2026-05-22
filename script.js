document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid-ferramentas');

  // Busca os dados centralizados no JSON
  fetch('dados.json')
    .then(response => response.json())
    .then(data => {
      renderizarCards(data.ferramentas);
      injetarSchemaSEO(data.ferramentas); // Injeta o SEO dinâmico
    })
    .catch(erro => {
      console.error('Erro ao carregar ferramentas:', erro);
      grid.innerHTML = '<p>Erro ao carregar os dados. Tente atualizar a página.</p>';
    });

  function renderizarCards(ferramentas) {
    grid.innerHTML = ferramentas.map(ferramenta => `
      <article class="card">
        <div class="card-header">
          <span class="card-emoji" aria-hidden="true">${ferramenta.emoji}</span>
          <h3>${ferramenta.nome}</h3>
        </div>
        <span class="dor-badge">💡 Resolve: ${ferramenta.dor_resolvida}</span>
        <p>${ferramenta.descricao}</p>
        <a href="${ferramenta.url}" target="_blank" rel="noopener noreferrer">Acessar Ferramenta</a>
      </article>
    `).join('');
  }

  // Essa função garante que o Google leia os dados antes mesmo de renderizar a tela
  function injetarSchemaSEO(ferramentas) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": ferramentas.map((f, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "WebApplication",
          "name": f.nome,
          "description": f.descricao,
          "applicationCategory": "BusinessApplication"
        }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }
});