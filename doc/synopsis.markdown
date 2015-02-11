# Sinopse

<!--type=misc-->

Um exemplo de um [servidor web](http.html) escrito com Node que responde com 'Hello World':

    var http = require('http');

    http.createServer(function (request, response) {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('Hello World\n');
    }).listen(8124);

    console.log('Server running at http://127.0.0.1:8124/');

Para executar o servidor, coloque o código em um arquivo com nome example.js e executá-lo junto com o node

    > node example.js
    Server running at http://127.0.0.1:8124/

Todos os exemplos na documentação podem ser executados de forma similar.
