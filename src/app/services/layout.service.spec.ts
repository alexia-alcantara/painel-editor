import { TestBed } from "@angular/core/testing";
import { LayoutService } from "./layout.service"
import { Cenario } from "../models/cenario.model";

const criarCenarioMock = (dadosParciais: Partial<Cenario>): Cenario =>{
    return{
        id: 'default-id',
        nome: 'Cenário Padrão',
        slug: 'cenario-padrao',
        targetWidth: 1920,
        targetHeight: 1080,
        backgroundImage: '',
        componentes: [],
        idPainel: '',
        ...dadosParciais
        
    }
}

describe('LayoutService', () =>{
    let service: LayoutService;
    let store: { [key: string]: string} = {};

    beforeEach(() =>{
        TestBed.configureTestingModule({});
        service = TestBed.inject(LayoutService);

        //mock do localStorage
        const mockLocalStorage = {
            getItem: (key: string): string | null =>{
                return key in store ? store[key] : null;
            },
            setItem: (key: string, value: string) =>{
                store[key] = value;
            },
            removeItem: (key: string) =>{
                delete store[key];
            },
            clear: () =>{
                store = {};
            }
        };

        //usa spyOn para interceptar chamadas ao localStorage
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(mockLocalStorage.getItem);
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(mockLocalStorage.setItem);
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(mockLocalStorage.removeItem);
        jest.spyOn(Storage.prototype, 'clear').mockImplementation(mockLocalStorage.clear);

        store = {};
    });

    it('should be created', () =>{
        expect(service).toBeTruthy();
    });

    it('should save a new scenario if it does not exist', () => {
  // Arrange
  const novoCenario = criarCenarioMock({ id: '1', nome: 'Cenário 1', slug: 'cenario-1' });

  // Act
  service.salvarCenario(novoCenario);

  // Assert
  const cenariosSalvos = service.listarCenarios();
  expect(cenariosSalvos.length).toBe(1);
  expect(cenariosSalvos[0].nome).toBe('Cenário 1');
});

it('should update an existing scenario if the ID matches', () => {
  // Arrange: Primeiro, salvamos um cenário inicial
  const cenarioInicial = criarCenarioMock({ id: '1', nome: 'Cenário Original', slug: 'cenario-original' });
  service.salvarCenario(cenarioInicial);

  // Act: Agora, salvamos uma versão modificada com o mesmo ID
  const cenarioModificado = criarCenarioMock({ id: '1', nome: 'Cenário Modificado', slug: 'cenario-original' });
  service.salvarCenario(cenarioModificado);

  // Assert
  const cenariosSalvos = service.listarCenarios();
  expect(cenariosSalvos.length).toBe(1); // Não deve adicionar um novo, apenas atualizar
  expect(cenariosSalvos[0].nome).toBe('Cenário Modificado');
});

it('should remove a scenario by its ID', () => {
  // Arrange
  const cenario1 = criarCenarioMock({ id: '1', nome: 'Cenário 1' });
  const cenario2 = criarCenarioMock({ id: '2', nome: 'Cenário 2' });
  service.salvarCenario(cenario1);
  service.salvarCenario(cenario2);

  // Act
  service.removerCenario('1');

  // Assert
  const cenariosRestantes = service.listarCenarios();
  expect(cenariosRestantes.length).toBe(1);
  expect(cenariosRestantes[0].id).toBe('2');
});

it('should notify subscribers when a scenario is saved', (done) => {
  const novoCenario = criarCenarioMock({ id: '1', nome: 'Cenário Notificação' });

  service.cenarios$.subscribe(cenarios => {
    expect(cenarios.length).toBe(1);
    expect(cenarios[0].nome).toBe('Cenário Notificação');
    done(); // 'done' é do Jasmine e diz que o teste assíncrono terminou
  });

  // A ação que dispara a notificação
  service.salvarCenario(novoCenario);
});

})