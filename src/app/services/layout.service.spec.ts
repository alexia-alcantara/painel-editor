import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';
import { Cenario } from '../models/cenario.model';

const criarCenarioMock = (dadosParciais: Partial<Cenario>): Cenario => {
  return {
    id: 'default-id',
    nome: 'Cenário Padrão',
    slug: 'cenario-padrao',
    targetWidth: 1920,
    targetHeight: 1080,
    backgroundImage: '',
    componentes: [],
    idPainel: '',
    ...dadosParciais,
  };
};

describe('LayoutService - Integration Test', () => {
  let service: LayoutService; 

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save a new scenario', () => {
    // Arrange
    const novoCenario = criarCenarioMock({ id: '1', nome: 'Cenário 1' });

    // Act
    service.salvarCenario(novoCenario);

    // Assert
    const cenariosSalvos = service.listarCenarios();
    expect(cenariosSalvos.length).toBe(1);
    expect(cenariosSalvos[0].nome).toBe('Cenário 1');
  });

  it('should update an existing scenario', () => {
   const cenarioInicial = criarCenarioMock({ id: '1', nome: 'Cenário Original' });
        service.salvarCenario(cenarioInicial);

   const cenarioModificado = criarCenarioMock({ id: '1', nome: 'Cenário Modificado' });
        service.salvarCenario(cenarioModificado);

    const cenariosSalvos = service.listarCenarios();
        expect(cenariosSalvos.length).toBe(1);
        expect(cenariosSalvos[0].nome).toBe('Cenário Modificado');
  });

  it('should remove a scenario by its ID', () => {
    const cenario1 = criarCenarioMock({ id: '1', nome: 'Cenário 1' });
    const cenario2 = criarCenarioMock({ id: '2', nome: 'Cenário 2' });
    service.salvarCenario(cenario1);
    service.salvarCenario(cenario2);

    service.removerCenario('1');

    const cenariosRestantes = service.listarCenarios();
    expect(cenariosRestantes.length).toBe(1);
    expect(cenariosRestantes[0].id).toBe('2');
  });

  it('should notify subscribers when a scenario is saved', (done) => {
    const novoCenario = criarCenarioMock({
      id: '1',
      nome: 'Cenário Notificação',
    });

    service.cenarios$.subscribe((cenarios) => {
      expect(cenarios.length).toBe(1);
      expect(cenarios[0].nome).toBe('Cenário Notificação');
      done(); 
    });

    // A ação que dispara a notificação
    service.salvarCenario(novoCenario);
  });
});
