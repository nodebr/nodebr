# Child Process

    Estabilidade: 3 - Estável

Node fornece uma facilidade tri-direcional `popen(3)` através do
módulo `child_process`.

É possível fazer `stream` de dados através de subprocessos `stdin`, `stdout`, e
`stderr` de uma forma completamente não blocante.  (Observe que alguns programas usam
`line-buffered` I/O internamente.  Isto não afeta o node.js mas significa
que os dados que você envia aos subprocessos podem não ser consumidos imediatamente).

Para criar um subprocesso utilize `require('child_process').spawn()` ou
`require('child_process').fork()`.  Há pouca diferença entre a semântica
de cada um, como na explicação [abaixo](#child_process_asynchronous_process_creation).

Para fins de script você deve achar
[synchronous counterparts](#child_process_synchronous_process_creation) mais
conveniente.

## Classe: ChildProcess

`ChildProcess` é um [EventEmitter][].

Subprocessos sempre têm três `streams` associados com eles. `child.stdin`,
`child.stdout`, e `child.stderr`.  Estes podem ser compartilhados com a `stream` `stdio`
do processo a que pertence, ou eles podem ser objetos `stream` separados
e podem ser transformados de um pro outro.

A classe `ChildProcess` não é destinada a ser usada diretamente.  Use os métodos
`spawn()`, `exec()`, `execFile()`, ou `fork()` para criar uma instância de
`ChildProcess`.

### Evento:  'error'

* `err` {Objeto de erro} o erro.

Emitido quando:

1. O processo não pode ser gerado, ou
2. O processo não pode ser finalizado, ou
3. Envia uma mensagem de falha para o subprocesso por qualquer razão.

Observe que o evento `exit` pode ou não ser executado depois de um erro ter acontecido. Se
você está ouvindo ambos os eventos para executar uma função, lembre-se de garantir que
a função não será chamada duas vezes.

Veja também [`ChildProcess#kill()`](#child_process_child_kill_signal) e
[`ChildProcess#send()`](#child_process_child_send_message_sendhandle).

### Evento:  'exit'

* `code` {Número} o código de saída, Se saiu normalmente.
* `signal` {String} o sinal é passado para finalizar o subprocesso, Se ele
  foi finalizado pelo processo principal.

Este evento é emitido quando o subprocesso termina. Se o processo termina
normalmente, `code` é o código de saída final do processo, caso contrário `null`. Se
o processo terminar devido a recepção de um sinal, `signal` será o nome da string
do sinal, caso contrário `null`.

Observe que os `streams` `stdio` ainda devem estar abertos.

Também, observe que o node estabelece manipuladores de sinal para `'SIGINT'` e `'SIGTERM`',
então ele não terminará devido a recepção de um daqueles sinais, ele sairá.

Veja `waitpid(2)`.

### Evento: 'close'

* `code` {Número} o número de saída, se sair normalmente.
* `signal` {String} o sinal é passado para finalizar o subprocesso, Se ele
  for finalizado pelo processo principal.

Este evento é emitido quando as `streams` `stdio` de um subprocesso tem tudo
terminado. Isto é diferente de 'exit', desde que os processo múltiplos
compartilhem os mesmos `streams` `stdio`.

### Evento: 'disconnect'

Este evento é emitido após chamar o método `.disconnect()` no processo principal
ou no subprocesso. Após desconectar não será mais possível enviar mensagens,
e a propriedade `.connected` será false.

### Evento: 'message'

* `message` {Objeto} Um objeto JSON analisado ou um valor primitivo
* `sendHandle` {Objeto Handle} um Socket ou um objeto Server

Mensagens enviadas por `.send(message, [sendHandle])` são obtidas utilizando
o evento `message`.

### child.stdin

* {Objeto Stream}

Uma `Stream gravável` que representa `stdin` pertencente ao subprocesso.
Se o subprocesso está esperando ler todos os `input`, Ele não continuará até que este
`stream` não seja fechado `end()`.

Se o subprocesso não for gerado com `stdio[0]` defina como `'pipe'`, então este não será
configurado.

`child.stdin` é a abreviação de `child.stdio[0]`. Ambas propriedades se referem
a mesma propriedade , ou nulo.

### child.stdout

* {Objeto stream}

Um `Stream` legível que representa `stdout` do subprocesso.

Se o processo não foi gerado com `stdio[1]` defina como `'pipe'`, então este não será
configurado.

`child.stdout` é a abreviação de `child.stdio[1]`. Ambas propriedade se referem
ao mesmo objeto, ou nulo.

### child.stderr

* {Objeto Stream}

Um `Stream` legível que representa `stderr` do subprocesso.

Se o processo não foi gerado com `stdio[2]` defina como `'pipe'`, então este não será
configurado.

`child.stderr` é a abreviação de `child.stdio[2]`. Ambas propriedade se referem
ao mesmo objeto, ou nulo.

### child.stdio

* {Vetor}

Um vetor de `pipes` para os subprocessos, correspondentes com as posições do
[stdio](#child_process_options_stdio) opção para
[spawn](#child_process_child_process_spawn_command_args_options) que tem sido
definido como `'pipe'`.
Observe que `streams` 0-2 também estão disponíveis como ChildProcess.stdin,
ChildProcess.stdout, e ChildProcess.stderr, respectivamente.

No seguinte exemplo, somente o fd `1` do subprocesso está configurado como um `pipe`, então somente
`child.stdio[1]` do processo principal é um `stream`, todos os outros valores do vetor são
`null`.

    child = child_process.spawn("ls", {
        stdio: [
          0, // utiliza o stdin do processo principal para o subprocesso
          'pipe', // conecta o stdout do subprocesso ao processo principal
          fs.openSync("err.out", "w") // direciona o stderr do subprocesso para um arquivo
        ]
    });

    assert.equal(child.stdio[0], null);
    assert.equal(child.stdio[0], child.stdin);

    assert(child.stdout);
    assert.equal(child.stdio[1], child.stdout);

    assert.equal(child.stdio[2], null);
    assert.equal(child.stdio[2], child.stderr);

### child.pid

* {Inteiro}

O PID do subprocesso.

Exemplo:

    var spawn = require('child_process').spawn,
        grep  = spawn('grep', ['ssh']);

    console.log('Spawned child pid: ' + grep.pid);
    grep.stdin.end();

### child.connected

* {Booleano} Define como falso depois que `.disconnect' é chamado.

Se `.connected` for igual a false, Não será mais possível enviar mensagens.

### child.kill([signal])

* `signal` {String}

Envia um sinal para o subprocesso. Se nenhum argumento é passado, o processo
enviará `'SIGTERM'`. Veja `signal(7)` para uma lista de sinais disponíveis.

    var spawn = require('child_process').spawn,
        grep  = spawn('grep', ['ssh']);

    grep.on('close', function (code, signal) {
      console.log('child process terminated due to receipt of signal '+signal);
    });

    // Envia SIGHUP para processar
    grep.kill('SIGHUP');

Pode emitir um evento `'error'` quando o sinal não pode ser entregue. Enviar um
sinal para um subprocesso que já terminou não é um erro mas pode
gerar consequências imprevistas: Se o PID (ID do Processo) foi reatribuído
a outro processo, o sinal será entregue para este mesmo no lugar do pretendido.
O que acontece depois ninguém sabe.

Observe que enquanto a função `kill` é chamada, o sinal enviado ao
subprocesso pode não necessariamente finalizá-lo. `kill` apenas envia um sinal
para o processo principal.

Veja `kill(2)`

### child.send(message[, sendHandle])

* `message` {Objeto}
* `sendHandle` {Objeto Handle}

Quando utilizado `child_process.fork()` você pode escrever no subprocesso usando
`child.send(message, [sendHandle])` e as mensagens são recebidas pelo evento
`'message'` no subprocesso.

Por exemplo:

    var cp = require('child_process');

    var n = cp.fork(__dirname + '/sub.js');

    n.on('message', function(m) {
      console.log('PARENT got message:', m);
    });

    n.send({ hello: 'world' });

E então o script do subprocesso, `'sub.js'` deve se parecer com isto:

    process.on('message', function(m) {
      console.log('CHILD got message:', m);
    });

    process.send({ foo: 'bar' });

No subprocesso o objeto `process` terá um método `send()`, e `process`
emitirá objetos cada vez que receber uma mensagem de seu canal.

Observe que o método `send()` em ambos processos são
síncronos - enviando grandes partes de dados sem avisar (`pipes` pode ser usado
no lugar, veja
[`child_process.spawn`](#child_process_child_process_spawn_command_args_options)).

Há um caso especial quando enviado uma mensagem `{cmd: 'NODE_foo'}`. Todas as mensagens
contendo um prefixo `NODE_` em sua propriedade `cmd` não serão emitidas no evento
`message`, devido ao fato de serem mensagens internas utilizadas pelo core do node.
As mensagens que contém o prefixo são emitidas no evento `internalMessage`, você
deve evitar a utilização deste recurso, pois está sujeito a mudança sem aviso prévio.

A opção `sendHandle` para `child.send()` é para enviar um servidor TCP ou
um objeto `socket` para outro processo. O subprocesso receberá o objeto como
segundo argumento para o evento `message`.

Emite um evento `'error'` se a mensagem não puder ser enviada, por exemplo,
caso o subprocesso já tenha terminado.

#### Exemplo: Enviando um objeto server

Aqui está um exemplo de envio de server:

    var child = require('child_process').fork('child.js');

    // Open up the server object and send the handle.
    var server = require('net').createServer();
    server.on('connection', function (socket) {
      socket.end('handled by parent');
    });
    server.listen(1337, function() {
      child.send('server', server);
    });

E o subprocesso receberia o objeto server como:

    process.on('message', function(m, server) {
      if (m === 'server') {
        server.on('connection', function (socket) {
          socket.end('handled by child');
        });
      }
    });

Observe que o servidor agora está compartilhado entre o processo principal e o subprocesso, isto significa
que algumas conexões serão gerenciadas pelo processo principal e outras pelo subprocesso.

Para servidores `dgram` o fluxo é exatamente o mesmo. Aqui você ouve um evento
`message` ao invés de `connection` e utiliza `server.bind` em vez de
`server.listen`.  (Atualmente suportado apenas em plataformas UNIX)

#### Exemplo: enviando objetos socket

Aqui está um exemplo de envio de socket. Será gerado dois subprocessos e gerenciadores
de conexão com endereços remotos `74.125.127.100` como VIP ao enviar o
socket para um subprocesso "especial". Outros sockets irão para um processo "normal".

    var normal = require('child_process').fork('child.js', ['normal']);
    var special = require('child_process').fork('child.js', ['special']);

    // Abre o servidor e envia o socket para o subprocesso
    var server = require('net').createServer();
    server.on('connection', function (socket) {

      // Se for um VIP
      if (socket.remoteAddress === '74.125.127.100') {
        special.send('socket', socket);
        return;
      }
      // apenas a forma de enviar de sempre
      normal.send('socket', socket);
    });
    server.listen(1337);

O `child.js` poderá se parecer com isto:

    process.on('message', function(m, socket) {
      if (m === 'socket') {
        socket.end('You were handled as a ' + process.argv[2] + ' person');
      }
    });

Observe que uma vez enviado um simples socket para o subprocesso, o processo principal não poderá mais
manter o controlede quando o socket será destruído. Para indicar esta condição
a propriedade `.connections` se torna `null`.
Também não é recomendado a utilização de `.maxConnections` nesta condição.

### child.disconnect()

Fecha o canal IPC entre o processo e o subprocesso, permitindo o término correto do subprocesso
uma vez que não há outra conexão para mantê-lo vivo. Após chamar este método
a flag `.connected` será definida como `false` em ambos processo e
subprocesso, e assim não será possível enviar mais mensagens.

O evento 'disconnect' será emitido quando não houver mensagens no processo
a ser recebida de imediato.

Observe que você pode chamar `process.disconnect()` no subprocesso quando ele
tiver algum canal IPC aberto com o processo principal (i.e `fork()`).

## Criação de um processo assíncrono

Os seguintes métodos seguem os padrões de programação assíncrono (aceitando um
callback ou retornando um EventEmitter).

### child_process.spawn(command[, args][, options])

* `command` {String} O comando a ser executado
* `args` {Array} Lista de argumentos
* `options` {Object}
  * `cwd` {String} Diretorio de trabalho atual do subprocesso
  * `env` {Object} Ambiente de pares chave-valor
  * `stdio` {Array|String} configuração stdio do subprocesso. (Veja
    [abaixo](#child_process_options_stdio))
  * `customFds` {Array} **Descontinuado** Descritor de arquivos para o subprocesso utilizar
     stdio.  (Veja [abaixo](#child_process_options_customFds))
  * `detached` {Boolean} O subprocesso se tornará um processo líder de grupo.  (Veja
    [abaixo](#child_process_options_detached))
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
* retorna: {ChildProcess object}

Começa um novo processo com o dado comando, com argumentos da linha de comandos em `args`.
Se omitido, `args` é definido por padrão com um vetor vazio.

O terceiro argumento é usado para opções adicionais, com estes padrões:

    { cwd: undefined,
      env: process.env
    }

Utilize `cwd` para especificar o diretório de trabalho do qual o processo é gerado.
Se não passado, o padrão é utilizar o diretório de trabalho atual.

Use `env` para especificar as variáveis de ambiente que serão visíveis para o novo
processo,o padrão é `process.env`.

Exemplo de execução `ls -lh /usr`, capturando `stdout`, `stderr`, e o código de saída:

    var spawn = require('child_process').spawn,
        ls    = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    ls.on('close', function (code) {
      console.log('child process exited with code ' + code);
    });


Exemplo: Um modo elaborado de executar 'ps ax | grep ssh'

    var spawn = require('child_process').spawn,
        ps    = spawn('ps', ['ax']),
        grep  = spawn('grep', ['ssh']);

    ps.stdout.on('data', function (data) {
      grep.stdin.write(data);
    });

    ps.stderr.on('data', function (data) {
      console.log('ps stderr: ' + data);
    });

    ps.on('close', function (code) {
      if (code !== 0) {
        console.log('ps process exited with code ' + code);
      }
      grep.stdin.end();
    });

    grep.stdout.on('data', function (data) {
      console.log('' + data);
    });

    grep.stderr.on('data', function (data) {
      console.log('grep stderr: ' + data);
    });

    grep.on('close', function (code) {
      if (code !== 0) {
        console.log('grep process exited with code ' + code);
      }
    });


### options.stdio

Como uma abreviação, o argumento `stdio` pode também ser uma das seguintes
strings:

* `'pipe'` - `['pipe', 'pipe', 'pipe']`, este é o valor padrão
* `'ignore'` - `['ignore', 'ignore', 'ignore']`
* `'inherit'` - `[process.stdin, process.stdout, process.stderr]` ou `[0,1,2]`

Por outro lado, a opção 'stdio' para `child_process.spawn()` é um vetor onde cada
index corresponde ao fd no subprocesso.  O valor é um dos seguintes:

1. `'pipe'` - Cria um pipe entre o subprocesso e o processo principal.
   O final do pipe do processo principal está disponível para o mesmo como uma propriedade no
    objeto `child_process` como `ChildProcess.stdio[fd]`. Pipes criados para
   fds 0 - 2 também estão disponíveis como ChildProcess.stdin, ChildProcess.stdout
   e ChildProcess.stderr, respectivamente.
2. `'ipc'` - Cria um canal IPC para passar mensagens/descritores de arquivos
   entre o subprocesso e o processo. Um ChildProcess pode ter no máximo *um* descritor de arquivo 
   IPC stdio. Definir esta opção habilita o método ChildProcess.send().
   Se o subprocesso escreve mensagens JSON neste descritor de arquivo, então este irá
   engatilhar ChildProcess.on('message').  Se osubprocesso é um programa Node.js, então
   a presença do canal IPC habilitará process.send() e
   process.on('message').
3. `'ignore'` - Não Defina este descritor de arquivos no subprocesso. Observe que o Node
   sempre abrirá fd 0 - 2 para os processos girados. Quando algum destes é
   ignorado o node abrirá `/dev/null` e irá anexar ao fd do subprocesso.
4. Objeto `Stream` - Compartilha uma stream legível ou gravável referente ao tty,
   arquivo, socket, ou um pipe com subprocesso. Os descritores de arquivo subjacentes das streams
   é duplicada no subprocesso para o fd que
   corresponde ao índice no vetor `stdio`. Observe que o stream deve
   ter um descritor subjacente (Nada é feito até que o evento `'open'`
   ocorra).
5. Inteiro positivo - O valor inteiro é interpretado como um descritor de arquivo
   que é constantemente aberto no processo principal. É compartilhado com o subprocesso, 
   similar a forma que objetos `Stream` podem ser compartilhados.
6. `null`, `undefined` - Utiliza valor padrão. Para stdio fds 0, 1 e 2 (em outras
   palavras, stdin, stdout, e stderr) um pipe é criado. Para o fd 3 e acima, o
   padrão é `'ignore'`.

Exemplo:

    var spawn = require('child_process').spawn;

    // subprocesso utilizará stdio do processo principal
    spawn('prg', [], { stdio: 'inherit' });

    // Gera um subprocesso compartilhando somente stderr
    spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

    // Abre um extra fd=4, para interagir com programas que apresentam uma
    // interface startd-style.
    spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });

### options.detached

Se a opção `detached` é definida, o subprocesso se tornará o líder de um
novo grupo de processos.  Isto torna possível o subprocesso continuar executando
após o processo principal finalizar.

Por padrão, o processo principal aguardará o subprocesso desanexado finalizar. Para previnir
o processo principal de aguardar um dado subprocesso, de utilizar o método `child.unref()`,
e os eventos loop do processo principal não incluirá o subprocesso em seu contador de referências.

Exemplo de desanexo de um processo longo e redirecionamento da sua saída para um
arquivo:

     var fs = require('fs'),
         spawn = require('child_process').spawn,
         out = fs.openSync('./out.log', 'a'),
         err = fs.openSync('./out.log', 'a');

     var child = spawn('prg', [], {
       detached: true,
       stdio: [ 'ignore', out, err ]
     });

     child.unref();

Quando se utiliza a opção `detached` para começar um processo de duração longa, o processo
não ficará rodando em background a menos que seja fornecido com uma configuração `stdio`
que não está conectada ao processo principal. Se o `stdio` do processo principal for
herdado, o subprocesso permanecerá anexado ao terminal de controle.

### options.customFds

Há uma opção descontinuada chamada `customFds` que permite especificar
arquivos descritores para o stdio do subprocesso. Esta API não era
portável para todas as plataformas e por isso foi removida.
Com `customFds` é possível atrelar a um novo processo' `[stdin, stdout,
stderr]` para existência de streams; `-1` significa que uma nova stream deverá ser criada.
Use por sua conta e risco.

Veja também: `child_process.exec()` e `child_process.fork()`

### child_process.exec(command[, options], callback)

* `command` {String} O comando para executar, com argumentos separados por espaços
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `env` {Object} Ambiente de pares chave-valor
  * `encoding` {String} (Default: 'utf8')
  * `shell` {String} Shell para executar o comando com
    (Padrão: '/bin/sh' no UNIX, 'cmd.exe' no Windows,  O shell deverá
     entender o `-c` troca no UNIX ou `/s /c` por Windows. No Windows,
     o interpretador da linha de comando deverá ser compatível com `cmd.exe`.)
  * `timeout` {Number} (Default: 0)
  * `maxBuffer` {Number} (Default: `200*1024`)
  * `killSignal` {String} (Default: 'SIGTERM')
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (See setgid(2).)
* `callback` {Function} Chamado com a saída quando o processo termina
  * `error` {Error}
  * `stdout` {Buffer}
  * `stderr` {Buffer}
* Return: Objeto ChildProcess

Roda um comando em um shell e coloca a saída em buffers.

    var exec = require('child_process').exec,
        child;

    child = exec('cat *.js bad_file | wc -l',
      function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });

O callback pega os argumentos `(error, stdout, stderr)`. Quando for sucesso, `error`
será `null`.  Quando for erro, `error` será uma instância de `Error` e `error.code`
será o código de saída do subprocesso, e `error.signal` será definido para o 
sinal que terminará o processo.

Há um segundo argumento opcional para especificar muitas opções. As
opções padrão são

    { encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200*1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null }

Se `timeout` é maior que 0, então finalizará o subprocesso
Se a execução for maior que os milisegundos do `timeout`. O subprocesso é finalizado com
`killSignal` (padrão: `'SIGTERM'`). `maxBuffer` especifica a maior
quantidade de dados permitidos em stdout ou stderr - Se este valor for excedido então
o subprocesso é finalizado.


### child_process.execFile(file[, args][, options][, callback])

* `file` {String} O nome do arquivo do programa a executar
* `args` {Array} Lista de argumentos string
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `env` {Object} Ambiente de pares chave-valor
  * `encoding` {String} (Padrão: 'utf8')
  * `timeout` {Number} (Padrão: 0)
  * `maxBuffer` {Number} (Padrão: 200\*1024)
  * `killSignal` {String} (Padrão: 'SIGTERM')
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
* `callback` {Function} chamada com a saída quando o processo termina
  * `error` {Error}
  * `stdout` {Buffer}
  * `stderr` {Buffer}
* Return: Objeto ChildProcess

Isto é similar ao `child_process.exec()` só que que não executa um
subshell, especifica um arquivo diretamente. Isto torna um pouco mais 
leve que `child_process.exec`. Tem as mesmas opções.


### child_process.fork(modulePath[, args][, options])

* `modulePath` {String} O módulo a ser executado no subprocesso
* `args` {Array} Lista deargumentos string
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `env` {Object} Ambiente de pares chave-valor
  * `execPath` {String} Executável utilizado para criar o subprocesso
  * `execArgv` {Array} Lista de argumentos string passado para o executável
    (Padrão: `process.execArgv`)
  * `silent` {Boolean} Se verdadeiro, stdin, stdout, e stderr do subprocesso serão
    ligados ao processo principal, caso contrário o subprocesso herdará do processo principal, Veja
    o "pipe" e "inherit" opções para `spawn()`'s `stdio` para mais detalhes
    (o padrão é falso)
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
* Return: Objeto ChildProcess

Este é um caso especial de `spawn()` funcionalidade para gerar processos
Node. Além de ter todos os métodos em uma instância de um subprocesso
normal, o objeto retornado tem um canal de comunicaçãothe returned object has a communication channel embutido. Veja
`child.send(message, [sendHandle])` para detalhes.

Estes subnós ainda são novas instâncias do v8. Assuma no mínimo 30ms
para começar e 10mb de memória para cada novo nó. Isto é, vocÊ não pode criar milhares
deles.

A propriedade `execPath` no objeto `options` permite um processo ser
criado por um subprocesso ao invés do nó executável atual. Isto deve ser
feito com cuidado e por padrão se comunicarão com o fd representando uma
variável de ambiente `NODE_CHANNEL_FD` no subprocesso. A entrada e
saída deste fd é esperado que seja uma linha delimitadora de objetos JSON.

## Processos de criação síncrona

Estes métodos são síncrono **synchronous**, significa que eles bloquearão o evento loop,
pausa a execução do sue código até o processo gerado terminar.

Bloquear chamadas como estas são muito úteis para simplificar o propósito geral 
do script das tarefas e para simplificar o carregamento/processamento da configuração
da aplicação ao começar.

### child_process.spawnSync(command[, args][, options])

* `command` {String} O comando para executar
* `args` {Array} Lista de string de argumentos
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `input` {String|Buffer} O valor que será passado como stdin para o processo gerado
    - fornecer este valor sobrescreverá `stdio[0]`
  * `stdio` {Array} configuração stdio do subprocesso.
  * `env` {Object} Ambiente em pares chave-valor
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
  * `timeout` {Number} A quantia máxima em milisegundos em que é permitido ao processo ser executado. (Padrão: undefined)
  * `killSignal` {String} O valor do sinal a ser usado quando o processo gerado será terminado. (Padrão: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} A codificação utilizada por todas as entradas e saídas do stdio. (Padrão: 'buffer')
* return: {Object}
  * `pid` {Number} Pid do subprocesso
  * `output` {Array} Vetor de resultados da saída stdio 
  * `stdout` {Buffer|String} O conteúdo de `output[1]`
  * `stderr` {Buffer|String} O conteúdo de `output[2]`
  * `status` {Number} O código de saída do subprocesso
  * `signal` {String} O sinal utilizado para terminar o subprocesso
  * `error` {Error} O objeto error caso o subprocesso falhe ou dê time out

`spawnSync` não retornará até o subprocesso finalizar completamente. Quando um
timeout é encontrado e `killSignal` é enviado, o método não retornará
até que o processo tenha terminado completamente. ISto é para dizer, Se o processo manipula 
o sinal `SIGTERM` e não termina, seu processo irá esperar até o subprocesso
finalizar.

### child_process.execFileSync(command[, args][, options])

* `command` {String} O comando a ser executável
* `args` {Array} Lista de string de argumentos
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `input` {String|Buffer} O valor que será passado como stdin para o processo gerado
    - fornece este valor sobrescreverá `stdio[0]`
  * `stdio` {Array} Configuração stdio do subprocesso. (Padrão: 'pipe')
    - `stderr` por padrão sairá para o stderr do processo principal a menos
      que `stdio` seja especificado
  * `env` {Object} Ambiente de pares chave-valor
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
  * `timeout` {Number} A quantidade máxima em milisegundos que permitirá o processo ser executado. (Padrão: undefined)
  * `killSignal` {String} O valor do sinal a ser usado quando o processo gerado será finalizado. (Padrão: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} A codificação utilizada por todas as entradas e saídas do stdio. (Padrão: 'buffer')
* retorna: {Buffer|String} O stdout do comando

`execFileSync` não retornará até que o subprocesso seja completamente finalizado. Quando um
timeout é encontrado e `killSignal` é enviado, o método não retornará
até o processo seja completamente finalizado. Isto é, Se o processo manipular
o sinal `SIGTERM` e não finaliza, seu processo irá esperar o subprocesso
terminar.

Se o processo der timeout, ou tiver um código de saída diferente de zero, este método irá
disparar um erro.  O objeto `Error` irá conter todo o resultado de
[`child_process.spawnSync`](#child_process_child_process_spawnsync_command_args_options)


### child_process.execSync(command[, options])

* `command` {String} O comando para executar
* `options` {Object}
  * `cwd` {String} Diretório de trabalho atual do subprocesso
  * `input` {String|Buffer} O valor que será passado como stdin para o processo gerado
    - fornecer este valor sobrescreverá `stdio[0]`
  * `stdio` {Array} Configuração stdio do subprocesso. (Padrão: 'pipe')
    - `stderr` por padrão a saída será para o stderr do processo principal a menos que
      `stdio` seja especificado
  * `env` {Object} Ambiente de pares chave-valor
  * `uid` {Number} Define a identidade do usuário do processo. (Veja setuid(2).)
  * `gid` {Number} Define a identidade do grupo do processo. (Veja setgid(2).)
  * `timeout` {Number} A quantia máxima em milisegundos em que é permitido ao processo ser executado. (Padrão: undefined)
  * `killSignal` {String} O valor do sinal a ser utilizado quando o processo gerado será terminado. (Padrão: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} A codificação utilizada por todas as entradas e saídas stdio. (Padrão: 'buffer')
* retorno: {Buffer|String} O stdout do comando

`execSync` não retornará até que o subprocesso termine completamente. Quando um
timeout for encontrado e `killSignal` é enviado, o método não retornará
até que o processo tenha terminado completamente. Isto é, Se o processo manipular
o sinal `SIGTERM` e não terminar, seu processo irá esperar até o subprocesso
finalizar.

Se o processo der timeout, ou tiver um código de saída diferente de zero, este método irá
disparar um erro. O objeto `Error` irá conter todo o resultado de
[`child_process.spawnSync`](#child_process_child_process_spawnsync_command_args_options)

[EventEmitter]: events.html#events_class_events_eventemitter
