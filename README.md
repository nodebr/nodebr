# Backend NodeBR

![](https://circleci.com/gh/nodebr/nodebr/tree/backend.svg?style=shield&circle-token=b074cef2067115bcb93a37b1645cdedf7db96938)
[![codecov](https://codecov.io/gh/nodebr/nodebr/branch/backend/graph/badge.svg)](https://codecov.io/gh/nodebr/nodebr/branch/backend)

Este repositório refere-se ao backend da comunidade NodeBR hospedada no website
https://nodebr.org.

### Setup

1. Instale `mysql` e crie o database / user.

```mysql
$ mysql -uroot
mysql> create database nodebr;
mysql> create user 'nodebr'@'localhost' identified by 'nodebr';
mysql> grant all privileges on nodebr.* to 'nodebr'@'localhost';
```

2. Rode as migrations

```sh
$ npm run knex migrate:latest
```

### Canais de ajuda

Antes de iniciar sua contribuição é recomendável que você acesse nosso canal no
Slack, nossa lista de e-mails ou até mesmo as issues desde repositório para
saber melhor por onde começar e evitar trabalhar na mesma coisa que outra pessoa
já está trabalhando.

* [Canal no Slack](https://slack.nodebr.org)
* [Lista de E-mails](https://groups.google.com/d/forum/nodebr)
* [Issues](https://github.com/nodebr/nodebr/issues)

### Licença

Todo o código produzido neste repositório é livre para a utilização por qualquer
pessoa ou empresa dentro das normas da [Licença ISC](LICENSE)
