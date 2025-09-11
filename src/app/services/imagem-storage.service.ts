import { Injectable } from '@angular/core';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PainelDB extends DBSchema {
  imagensDeFundo: {
    key: string; 
    value: {
      id: string;
      arquivo: File;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ImagemStorageService {
  private readonly dbName = 'PainelDb';
  private readonly storeName = 'imagensDeFundo';
  private dbPromise: Promise<IDBPDatabase<PainelDB>>;

  constructor() {
      // Inicia a conexão com o banco de dados IndexedDB
    this.dbPromise = openDB<PainelDB>(this.dbName, 1, {
      upgrade(db) {
        // Cria a "tabela" (object store) se ela não existir
        db.createObjectStore('imagensDeFundo', { keyPath: 'id' });
      },
    });
   }

    async salvarImagem(id: string, arquivo: File): Promise<void> {
    const db = await this.dbPromise;
    await db.put(this.storeName, { id, arquivo });
  }

  async carregarImagem(id: string): Promise<File | undefined> {
    const db = await this.dbPromise;
    const resultado = await db.get(this.storeName, id);
    return resultado?.arquivo;
  }

  async removerImagem(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.storeName, id);
  }
}
