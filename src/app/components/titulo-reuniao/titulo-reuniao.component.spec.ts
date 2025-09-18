import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TituloReuniaoComponent } from './titulo-reuniao.component';
import { FonteService } from '../../services/fonte.service';

//mock para o font service
const mockFonteService = {
  getFonteByTipo: (tipo: string) =>[]
}

describe('TituloReuniaoComponent', () => {
  let component: TituloReuniaoComponent;
  let fixture: ComponentFixture<TituloReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TituloReuniaoComponent],
      providers: [
        {provide: FonteService, useValue: mockFonteService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TituloReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //teste 2: exibe o titulo que é passado?
  it('should display the title passed via @input', () =>{
    const dadosParaTeste = { texto: 'Reunião de Alinhamento Semanal' };
    component.dados = dadosParaTeste;

    //pede ao angular para atualizar o html com o novo valor
    fixture.detectChanges();

    //verifica se o html renderizado está correto
    const elementoH3 = fixture.nativeElement.querySelector('h3');
    expect(elementoH3).not.toBeNull(); //garante que a tag h3 existe
    expect(elementoH3.textContent.trim()).toBe(dadosParaTeste.texto); //garante que o conteudo da tag h3 é o esperado
  });


  //teste 3: o visual continua o mesmo?
  it('should match the snapshot', () => {
    component.dados = { texto: 'um título qualquer para o snapshot' };

    fixture.detectChanges();
    expect(fixture.nativeElement).toMatchSnapshot();
  })
});
