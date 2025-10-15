# PainelAngular
## _This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.12._

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Tested with Jest](https://img.shields.io/badge/tested%20with-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/) [![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)](https://www.cypress.io/)

## Tecnologias Utilizadas

- [Angular](https://angular.io/) - (v18.2.12)
- [Node.js](https://nodejs.org/) (versão 18.x ou superior)
- [TypeScript](https://www.typescriptlang.org/)
- [Cypress](https://www.cypress.io/)
- [Karma](https://karma-runner.github.io/)

## Roda a aplicação e Execute os Testes
- **Angular:** ng serve
- **Testes Unitários (Karma)**: ng test
- **Testes End-to-End (Cypress)**: npx cypress open
- **Modo(CI/CD)**: npx cypress run

## Instalação

É necessário ter o  [Node.js](https://nodejs.org/) v18.x ou superior instalado.

```sh
git clone [URL_DO_REPOSITORIO]
cd painel-editor
npm i
ng serve
```

Para ambientes de produção - Dev e Prod

```sh
Dev: npm run build
Prod: ng build --configuration production
```