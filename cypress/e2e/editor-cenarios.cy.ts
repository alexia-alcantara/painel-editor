describe('Fluxo de Edição de Cenários', () => {
  beforeEach(() => {
    cy.visit('/editor');
    // Limpa o storage antes de cada teste para garantir um estado limpo
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('deve permitir que um usuário salve um cenário através do prompt', () => {
    const nomeDoCenario = `Cenário Salvo em ${Date.now()}`;

    // 1. Interceptando o 'prompt'
    // Aqui, dizemos ao Cypress para substituir a função 'prompt' do navegador.
    // Em vez de abrir a caixa de diálogo, ela vai automaticamente retornar o texto que definimos.
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns(nomeDoCenario);
    });

    // 2.Clicar no botão Salvar
    // Usamos o atributo 'title' do seu botão para encontrá-lo de forma segura.
    cy.get('button[title="Salvar Cenário"]').click();

    // 3.
    // Garante que a função prompt foi realmente chamada pelo seu código.
    cy.window().its('prompt').should('be.called');

    // 4.  Testando a persistência
    // Recarregamos a página para ver se o dado foi salvo corretamente no localStorage.
    cy.reload();

    // 5. Verificamos diretamente no localStorage se o cenário foi salvo
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'cenarios_editor_salvos')
      .should('exist') // Garante que o item não é nulo
      .should('include', nomeDoCenario); // Garante que o nome do nosso cenário está dentro do texto salvo
  });
});
