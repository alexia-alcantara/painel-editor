describe('Fluxo de Edição de Cenários', () => {
  beforeEach(() => {
    cy.visit('/editor');
    // Limpa o storage antes de cada teste
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('deve permitir que um usuário salve um cenário através do prompt', () => {
    const nomeDoCenario = `Cenário Salvo em ${Date.now()}`;

    // Aqui, dizemos damos a instrução ao Cypress para substituir a função 'prompt' do navegador.
    // Em vez de abrir a caixa de diálogo, ela vai automaticamente retornar o texto que definimos.
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(nomeDoCenario);
    });

    // Clicar no botão Salvar
    // Usamos o atributo 'title' do seu botão para encontrá-lo de forma segura.
    cy.get('button[title="Salvar Cenário"]').click();

  
    // Garante que a função prompt foi realmente chamada pelo seu código.
    cy.window().its('prompt').should('be.called');

    // Recarregamos a página para ver se o dado foi salvo corretamente no localStorage.
    cy.reload();

    // 5. Verificamos diretamente no localStorage se o cenário foi salvo
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'cenarios_editor_salvos')
      .should('exist') // Garante que o item não é nulo
      .should('include', nomeDoCenario); // Garante que o nome do nosso cenário está dentro do texto salvo
  });

  it('deve carregar um cenário existente e navegar para a página do display', () => {
    //cria um cenário de testee salva direto no localstorage
    const slugDoCenario = 'cenario-teste-display';
    const nomeDoCenario = 'Cenario de Carga';
    const cenarioMock = [
      {
        id: 'mock-id-123',
        nome: nomeDoCenario,
        slug: slugDoCenario,
        componentes: [
          {
            id: ' titulo',
            tipo: 'titulo',
            dados: { texto: 'Cenario Teste Carga' },
          },
        ],
      },
    ];

    //act: visita a página, abre o modal via menu de contexto
    cy.visit('/editor');

    cy.window().then((win) => {
      win.localStorage.setItem(
        'cenarios_editor_salvos',
        JSON.stringify(cenarioMock)
      );
    });
    cy.reload();
    cy.get('.componente-box').first().rightclick();

    //espera o menu aparecere clica em configurar tela
    cy.get('.context-menu')
      .should('be.visible')
      .contains('Configurar Tela')
      .click();

    cy.window().then((win) => {
  // Substituímos a função 'open' real por um 'dublê' (stub)
  // e damos um apelido de '@windowOpen' para poder checá-lo depois
    cy.stub(win, 'open').as('windowOpen');
  });

    //encontra o cenario na lista e clica em carregar
    cy.contains(nomeDoCenario)
      .parent() //pega o elemento pai, a linha toda da lista
      .within(() => {
        cy.contains('Carregar').click();
      });

    cy.get('@windowOpen').should('be.calledWith', `/display/${slugDoCenario}`);

  });
});
