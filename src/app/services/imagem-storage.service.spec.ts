import { TestBed } from '@angular/core/testing';

import { ImagemStorageService } from './imagem-storage.service';

describe('ImagemStorageService', () => {
  let service: ImagemStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagemStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
