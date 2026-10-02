# PainelAngular
## _This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.12._

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Tested with Jest](https://img.shields.io/badge/tested%20with-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/) [![Tested with Playwright](https://img.shields.io/badge/Playwright-20A74F?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

---

## Tecnologias Utilizadas

- [Angular](https://angular.io/) - (v18.2.12)
- [Node.js](https://nodejs.org/) (versão 18.x ou superior)
- [TypeScript](https://www.typescriptlang.org/)
- **[Playwright](https://playwright.dev/)**
- [Karma](https://karma-runner.github.io/)

---

## Roda a aplicação e Execute os Testes

* **Angular:** `ng serve`
* **Testes Unitários (Karma)**: `ng test`
* **Testes End-to-End (Playwright - UI)**: `npx playwright test --ui`
* **Testes End-to-End (Playwright - Modo Headed)**: `npx playwright test --headed`
* **Testes End-to-End (Playwright - CI/CD)**: `npx playwright test`

---

## Instalação

É necessário ter o **[Node.js](https://nodejs.org/) v18.x** ou superior instalado.

1.  Clone o repositório e instale as dependências:
    ```sh
    git clone [URL_DO_REPOSITORIO]
    cd painel-editor
    npm install
    ```
2.  Instale os *browsers* necessários para o Playwright:
    ```sh
    npx playwright install
    ```
3.  Inicie o servidor de desenvolvimento:
    ```sh
    ng serve
    ```

---

## Ambientes de Produção

```sh
# Ambiente de Desenvolvimento (Dev)
npm run build 

# Ambiente de Produção (Prod)
ng build --configuration production
