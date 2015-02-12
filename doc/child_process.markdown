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

## Class: ChildProcess

`ChildProcess` é um [EventEmitter][].

Subprocessos sempre têm três `streams` associados com eles. `child.stdin`,
`child.stdout`, e `child.stderr`.  Estes podem ser compartilhados com a `stream` `stdio`
do processo a que pertence, ou eles podem ser objetos `stream` separados
e podem ser transformados de um pro outro.

A classe `ChildProcess` não é destinada a ser usada diretamente.  Use os métodos
`spawn()`, `exec()`, `execFile()`, ou `fork()` para criar uma instância de
`ChildProcess`.

### Event:  'error'

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

### Event:  'exit'

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

### Event: 'close'

* `code` {Número} o número de saída, se sair normalmente.
* `signal` {String} o sinal é passado para finalizar o subprocesso, Se ele
  for finalizado pelo processo principal.

Este evento é emitido quando as `streams` `stdio` de um subprocesso tem tudo
terminado. Isto é diferente de 'exit', desde que os processo múltiplos
compartilhem os mesmos `streams` `stdio`.

### Event: 'disconnect'

Este evento é emitido após chamar o método `.disconnect()` no processo principal
ou no subprocesso. Após desconectar não será mais possível enviar mensagens,
e a propriedade `.connected` será false.

### Event: 'message'

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

* `command` {String} The command to run
* `args` {Array} List of string arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `env` {Object} Environment key-value pairs
  * `stdio` {Array|String} Child's stdio configuration. (See
    [below](#child_process_options_stdio))
  * `customFds` {Array} **Deprecated** File descriptors for the child to use
    for stdio.  (See [below](#child_process_options_customFds))
  * `detached` {Boolean} The child will be a process group leader.  (See
    [below](#child_process_options_detached))
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
* return: {ChildProcess object}

Launches a new process with the given `command`, with  command line arguments in `args`.
If omitted, `args` defaults to an empty Array.

The third argument is used to specify additional options, with these defaults:

    { cwd: undefined,
      env: process.env
    }

Use `cwd` to specify the working directory from which the process is spawned.
If not given, the default is to inherit the current working directory.

Use `env` to specify environment variables that will be visible to the new
process, the default is `process.env`.

Example of running `ls -lh /usr`, capturing `stdout`, `stderr`, and the exit code:

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


Example: A very elaborate way to run 'ps ax | grep ssh'

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

As a shorthand, the `stdio` argument may also be one of the following
strings:

* `'pipe'` - `['pipe', 'pipe', 'pipe']`, this is the default value
* `'ignore'` - `['ignore', 'ignore', 'ignore']`
* `'inherit'` - `[process.stdin, process.stdout, process.stderr]` or `[0,1,2]`

Otherwise, the 'stdio' option to `child_process.spawn()` is an array where each
index corresponds to a fd in the child.  The value is one of the following:

1. `'pipe'` - Create a pipe between the child process and the parent process.
   The parent end of the pipe is exposed to the parent as a property on the
   `child_process` object as `ChildProcess.stdio[fd]`. Pipes created for
   fds 0 - 2 are also available as ChildProcess.stdin, ChildProcess.stdout
   and ChildProcess.stderr, respectively.
2. `'ipc'` - Create an IPC channel for passing messages/file descriptors
   between parent and child. A ChildProcess may have at most *one* IPC stdio
   file descriptor. Setting this option enables the ChildProcess.send() method.
   If the child writes JSON messages to this file descriptor, then this will
   trigger ChildProcess.on('message').  If the child is a Node.js program, then
   the presence of an IPC channel will enable process.send() and
   process.on('message').
3. `'ignore'` - Do not set this file descriptor in the child. Note that Node
   will always open fd 0 - 2 for the processes it spawns. When any of these is
   ignored node will open `/dev/null` and attach it to the child's fd.
4. `Stream` object - Share a readable or writable stream that refers to a tty,
   file, socket, or a pipe with the child process. The stream's underlying
   file descriptor is duplicated in the child process to the fd that
   corresponds to the index in the `stdio` array. Note that the stream must
   have an underlying descriptor (file streams do not until the `'open'`
   event has occurred).
5. Positive integer - The integer value is interpreted as a file descriptor
   that is is currently open in the parent process. It is shared with the child
   process, similar to how `Stream` objects can be shared.
6. `null`, `undefined` - Use default value. For stdio fds 0, 1 and 2 (in other
   words, stdin, stdout, and stderr) a pipe is created. For fd 3 and up, the
   default is `'ignore'`.

Example:

    var spawn = require('child_process').spawn;

    // Child will use parent's stdios
    spawn('prg', [], { stdio: 'inherit' });

    // Spawn child sharing only stderr
    spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

    // Open an extra fd=4, to interact with programs present a
    // startd-style interface.
    spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });

### options.detached

If the `detached` option is set, the child process will be made the leader of a
new process group.  This makes it possible for the child to continue running
after the parent exits.

By default, the parent will wait for the detached child to exit.  To prevent
the parent from waiting for a given `child`, use the `child.unref()` method,
and the parent's event loop will not include the child in its reference count.

Example of detaching a long-running process and redirecting its output to a
file:

     var fs = require('fs'),
         spawn = require('child_process').spawn,
         out = fs.openSync('./out.log', 'a'),
         err = fs.openSync('./out.log', 'a');

     var child = spawn('prg', [], {
       detached: true,
       stdio: [ 'ignore', out, err ]
     });

     child.unref();

When using the `detached` option to start a long-running process, the process
will not stay running in the background unless it is provided with a `stdio`
configuration that is not connected to the parent.  If the parent's `stdio` is
inherited, the child will remain attached to the controlling terminal.

### options.customFds

There is a deprecated option called `customFds` which allows one to specify
specific file descriptors for the stdio of the child process. This API was
not portable to all platforms and therefore removed.
With `customFds` it was possible to hook up the new process' `[stdin, stdout,
stderr]` to existing streams; `-1` meant that a new stream should be created.
Use at your own risk.

See also: `child_process.exec()` and `child_process.fork()`

### child_process.exec(command[, options], callback)

* `command` {String} The command to run, with space-separated arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `env` {Object} Environment key-value pairs
  * `encoding` {String} (Default: 'utf8')
  * `shell` {String} Shell to execute the command with
    (Default: '/bin/sh' on UNIX, 'cmd.exe' on Windows,  The shell should
     understand the `-c` switch on UNIX or `/s /c` on Windows. On Windows,
     command line parsing should be compatible with `cmd.exe`.)
  * `timeout` {Number} (Default: 0)
  * `maxBuffer` {Number} (Default: `200*1024`)
  * `killSignal` {String} (Default: 'SIGTERM')
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
* `callback` {Function} called with the output when process terminates
  * `error` {Error}
  * `stdout` {Buffer}
  * `stderr` {Buffer}
* Return: ChildProcess object

Runs a command in a shell and buffers the output.

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

The callback gets the arguments `(error, stdout, stderr)`. On success, `error`
will be `null`.  On error, `error` will be an instance of `Error` and `error.code`
will be the exit code of the child process, and `error.signal` will be set to the
signal that terminated the process.

There is a second optional argument to specify several options. The
default options are

    { encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200*1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null }

If `timeout` is greater than 0, then it will kill the child process
if it runs longer than `timeout` milliseconds. The child process is killed with
`killSignal` (default: `'SIGTERM'`). `maxBuffer` specifies the largest
amount of data allowed on stdout or stderr - if this value is exceeded then
the child process is killed.


### child_process.execFile(file[, args][, options][, callback])

* `file` {String} The filename of the program to run
* `args` {Array} List of string arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `env` {Object} Environment key-value pairs
  * `encoding` {String} (Default: 'utf8')
  * `timeout` {Number} (Default: 0)
  * `maxBuffer` {Number} (Default: 200\*1024)
  * `killSignal` {String} (Default: 'SIGTERM')
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
* `callback` {Function} called with the output when process terminates
  * `error` {Error}
  * `stdout` {Buffer}
  * `stderr` {Buffer}
* Return: ChildProcess object

This is similar to `child_process.exec()` except it does not execute a
subshell but rather the specified file directly. This makes it slightly
leaner than `child_process.exec`. It has the same options.


### child_process.fork(modulePath[, args][, options])

* `modulePath` {String} The module to run in the child
* `args` {Array} List of string arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `env` {Object} Environment key-value pairs
  * `execPath` {String} Executable used to create the child process
  * `execArgv` {Array} List of string arguments passed to the executable
    (Default: `process.execArgv`)
  * `silent` {Boolean} If true, stdin, stdout, and stderr of the child will be
    piped to the parent, otherwise they will be inherited from the parent, see
    the "pipe" and "inherit" options for `spawn()`'s `stdio` for more details
    (default is false)
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
* Return: ChildProcess object

This is a special case of the `spawn()` functionality for spawning Node
processes. In addition to having all the methods in a normal ChildProcess
instance, the returned object has a communication channel built-in. See
`child.send(message, [sendHandle])` for details.

These child Nodes are still whole new instances of V8. Assume at least 30ms
startup and 10mb memory for each new Node. That is, you cannot create many
thousands of them.

The `execPath` property in the `options` object allows for a process to be
created for the child rather than the current `node` executable. This should be
done with care and by default will talk over the fd represented an
environmental variable `NODE_CHANNEL_FD` on the child process. The input and
output on this fd is expected to be line delimited JSON objects.

## Synchronous Process Creation

These methods are **synchronous**, meaning they **WILL** block the event loop,
pausing execution of your code until the spawned process exits.

Blocking calls like these are mostly useful for simplifying general purpose
scripting tasks and for simplifying the loading/processing of application
configuration at startup.

### child_process.spawnSync(command[, args][, options])

* `command` {String} The command to run
* `args` {Array} List of string arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `input` {String|Buffer} The value which will be passed as stdin to the spawned process
    - supplying this value will override `stdio[0]`
  * `stdio` {Array} Child's stdio configuration.
  * `env` {Object} Environment key-value pairs
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
  * `timeout` {Number} In milliseconds the maximum amount of time the process is allowed to run. (Default: undefined)
  * `killSignal` {String} The signal value to be used when the spawned process will be killed. (Default: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} The encoding used for all stdio inputs and outputs. (Default: 'buffer')
* return: {Object}
  * `pid` {Number} Pid of the child process
  * `output` {Array} Array of results from stdio output
  * `stdout` {Buffer|String} The contents of `output[1]`
  * `stderr` {Buffer|String} The contents of `output[2]`
  * `status` {Number} The exit code of the child process
  * `signal` {String} The signal used to kill the child process
  * `error` {Error} The error object if the child process failed or timed out

`spawnSync` will not return until the child process has fully closed. When a
timeout has been encountered and `killSignal` is sent, the method won't return
until the process has completely exited. That is to say, if the process handles
the `SIGTERM` signal and doesn't exit, your process will wait until the child
process has exited.

### child_process.execFileSync(command[, args][, options])

* `command` {String} The command to run
* `args` {Array} List of string arguments
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `input` {String|Buffer} The value which will be passed as stdin to the spawned process
    - supplying this value will override `stdio[0]`
  * `stdio` {Array} Child's stdio configuration. (Default: 'pipe')
    - `stderr` by default will be output to the parent process' stderr unless
      `stdio` is specified
  * `env` {Object} Environment key-value pairs
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
  * `timeout` {Number} In milliseconds the maximum amount of time the process is allowed to run. (Default: undefined)
  * `killSignal` {String} The signal value to be used when the spawned process will be killed. (Default: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} The encoding used for all stdio inputs and outputs. (Default: 'buffer')
* return: {Buffer|String} The stdout from the command

`execFileSync` will not return until the child process has fully closed. When a
timeout has been encountered and `killSignal` is sent, the method won't return
until the process has completely exited. That is to say, if the process handles
the `SIGTERM` signal and doesn't exit, your process will wait until the child
process has exited.

If the process times out, or has a non-zero exit code, this method ***will***
throw.  The `Error` object will contain the entire result from
[`child_process.spawnSync`](#child_process_child_process_spawnsync_command_args_options)


### child_process.execSync(command[, options])

* `command` {String} The command to run
* `options` {Object}
  * `cwd` {String} Current working directory of the child process
  * `input` {String|Buffer} The value which will be passed as stdin to the spawned process
    - supplying this value will override `stdio[0]`
  * `stdio` {Array} Child's stdio configuration. (Default: 'pipe')
    - `stderr` by default will be output to the parent process' stderr unless
      `stdio` is specified
  * `env` {Object} Environment key-value pairs
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)
  * `timeout` {Number} In milliseconds the maximum amount of time the process is allowed to run. (Default: undefined)
  * `killSignal` {String} The signal value to be used when the spawned process will be killed. (Default: 'SIGTERM')
  * `maxBuffer` {Number}
  * `encoding` {String} The encoding used for all stdio inputs and outputs. (Default: 'buffer')
* return: {Buffer|String} The stdout from the command

`execSync` will not return until the child process has fully closed. When a
timeout has been encountered and `killSignal` is sent, the method won't return
until the process has completely exited. That is to say, if the process handles
the `SIGTERM` signal and doesn't exit, your process will wait until the child
process has exited.

If the process times out, or has a non-zero exit code, this method ***will***
throw.  The `Error` object will contain the entire result from
[`child_process.spawnSync`](#child_process_child_process_spawnsync_command_args_options)

[EventEmitter]: events.html#events_class_events_eventemitter
