describe('Fluxo de Edição de Cenários', () => {
  beforeEach(() => {
    cy.visit('/editor');
    // limpa o storage antes de cada teste
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('deve permitir que um usuário salve um cenário através do prompt', () => {
    const nomeDoCenario = `Cenário Salvo em ${Date.now()}`;

    // cypress substitui a função 'prompt' do navegador
    // retorna o texto que foi definido
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(nomeDoCenario);
    });

    // clica no botão salvar
    cy.get('button[title="Salvar Cenário"]').click();

  
    // Garante que a função prompt foi realmente chamada
    cy.window().its('prompt').should('be.called');

    // recarrega a página para ver se o dado foi salvo corretamente no localStorage.
    cy.reload();

    // verifica diretamente no localStorage se o cenário foi salvo
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'cenarios_editor_salvos')
      .should('exist') 
      .should('include', nomeDoCenario); // Garante que o nome do cenário está dentro do texto salvo
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
    
    //simula o que o usuário faria
    cy.get('.componente-box').first().rightclick();

    cy.get('.context-menu')
      .should('be.visible')
      .contains('Configurar Tela')
      .click();

    cy.window().then((win) => {
  // substitui a função 'open' real por um 'dublê' (stub)
  // apelida de '@windowOpen' para poder checá-lo depois
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
