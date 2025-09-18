import { TestBed } from '@angular/core/testing';

import { PainelService } from './painel.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('PainelService', () => {
  let service: PainelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PainelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
