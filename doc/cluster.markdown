# Cluster

    Estabilidade: 2 - Instável
Uma única instancia de Node roda em uma única thread. Para tirar vantagem dos
sistemas multi-core o usuário as vezes vai querer inicar um cluster de processos
Node para controlar a carga.

O módulo cluster permite você criar facilmente processos filhos que
compartilham as portas do servidor.

    var cluster = require('cluster');
    var http = require('http');
    var numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
      });
    } else {
      // Workers podem compartilhar qualquer conexão TCP
      // Neste caso é um servidor HTTP
      http.createServer(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");
      }).listen(8000);
    }

O nó que esta executando vai compartilhar a porta 8000 entre os workers:

    % NODE_DEBUG=cluster node server.js
    23521,Master Worker 23524 online
    23521,Master Worker 23526 online
    23521,Master Worker 23523 online
    23521,Master Worker 23528 online

Essa caracteristica foi introduzida recentemente, e pode mudar nas versões futuras.
Por favor esperimente essa característica e dê-nos um feedback.

No Windows, observe que ainda não é possivel montar um
servidor de named pipe em um worker.

## Como Funciona

<!--type=misc-->

Os processos workers são criados usando o método `child_process.fork`,
para que eles possam se comunicar com o pai via IPC o servidor anterior
controla o fluxo.

O módulo cluster suporta dois métodos de distribuir conecções de entrada.

O primeiro (e o padrão em todas as plataformas exeto Windows),
é o abordagem round-robin onde o processo master escuta uma porta,
aceita novas conecções e distribui-los entre os workers de um modo
round-robin, com algums truques inteligentes para evitar
sobrecarga de um processo worker.

A segunda abordagem é onde o processo master cria o listen socket e
envia aos workers interessados. Os workers em seguida aceitam as
conecções de entrada diretamente.

A segunda abordagem deveria, na teoria, dá a melhor performance.
No entanto na pratica, a distribuição tende a ser muito desbalanceada
por causa dos imprevisíveis scheduler do sistema operacional.
Cargas foram observadas onde mais de 70% das conecções são terminadas em apenas dois processos,
de um total de oito.

Porque `server.listen()` ele deixa a maioria dos trabalhos para o processo master,
existem três casos onde o comportamento entre um processo normal
Node.js e um cluster worker difere:

1. `server.listen({fd: 7})` Porque a mensagem é passada para o master,
   o file descriptor 7 **no pai** será escutado, e o controle passado pelo
   worker; em vez de ouvir a idéia do worker sobre a referência do
   número 7 do file descriptor.
1. `server.listen({fd: 7})` Because the message is passed to the master,
   file descriptor 7 **in the parent** will be listened on, and the
   handle passed to the worker, rather than listening to the worker's
   idea of what the number 7 file descriptor references.
2. `server.listen(handle)` Listening on handles explicitly will cause
   the worker to use the supplied handle, rather than talk to the master
   process.  If the worker already has the handle, then it's presumed
   that you know what you are doing.
3. `server.listen(0)` Normally, this will cause servers to listen on a
   random port.  However, in a cluster, each worker will receive the
   same "random" port each time they do `listen(0)`.  In essence, the
   port is random the first time, but predictable thereafter.  If you
   want to listen on a unique port, generate a port number based on the
   cluster worker ID.

There is no routing logic in Node.js, or in your program, and no shared
state between the workers.  Therefore, it is important to design your
program such that it does not rely too heavily on in-memory data objects
for things like sessions and login.

Because workers are all separate processes, they can be killed or
re-spawned depending on your program's needs, without affecting other
workers.  As long as there are some workers still alive, the server will
continue to accept connections.  Node does not automatically manage the
number of workers for you, however.  It is your responsibility to manage
the worker pool for your application's needs.

## cluster.schedulingPolicy

The scheduling policy, either `cluster.SCHED_RR` for round-robin or
`cluster.SCHED_NONE` to leave it to the operating system. This is a
global setting and effectively frozen once you spawn the first worker
or call `cluster.setupMaster()`, whatever comes first.

`SCHED_RR` is the default on all operating systems except Windows.
Windows will change to `SCHED_RR` once libuv is able to effectively
distribute IOCP handles without incurring a large performance hit.

`cluster.schedulingPolicy` can also be set through the
`NODE_CLUSTER_SCHED_POLICY` environment variable. Valid
values are `"rr"` and `"none"`.

## cluster.settings

* {Object}
  * `execArgv` {Array} list of string arguments passed to the node executable.
    (Default=`process.execArgv`)
  * `exec` {String} file path to worker file.  (Default=`process.argv[1]`)
  * `args` {Array} string arguments passed to worker.
    (Default=`process.argv.slice(2)`)
  * `silent` {Boolean} whether or not to send output to parent's stdio.
    (Default=`false`)
  * `uid` {Number} Sets the user identity of the process. (See setuid(2).)
  * `gid` {Number} Sets the group identity of the process. (See setgid(2).)

After calling `.setupMaster()` (or `.fork()`) this settings object will contain
the settings, including the default values.

It is effectively frozen after being set, because `.setupMaster()` can
only be called once.

This object is not supposed to be changed or set manually, by you.

## cluster.isMaster

* {Boolean}

True if the process is a master. This is determined
by the `process.env.NODE_UNIQUE_ID`. If `process.env.NODE_UNIQUE_ID` is
undefined, then `isMaster` is `true`.

## cluster.isWorker

* {Boolean}

True if the process is not a master (it is the negation of `cluster.isMaster`).

## Event: 'fork'

* `worker` {Worker object}

When a new worker is forked the cluster module will emit a 'fork' event.
This can be used to log worker activity, and create your own timeout.

    var timeouts = [];
    function errorMsg() {
      console.error("Something must be wrong with the connection ...");
    }

    cluster.on('fork', function(worker) {
      timeouts[worker.id] = setTimeout(errorMsg, 2000);
    });
    cluster.on('listening', function(worker, address) {
      clearTimeout(timeouts[worker.id]);
    });
    cluster.on('exit', function(worker, code, signal) {
      clearTimeout(timeouts[worker.id]);
      errorMsg();
    });

## Event: 'online'

* `worker` {Worker object}

After forking a new worker, the worker should respond with an online message.
When the master receives an online message it will emit this event.
The difference between 'fork' and 'online' is that fork is emitted when the
master forks a worker, and 'online' is emitted when the worker is running.

    cluster.on('online', function(worker) {
      console.log("Yay, the worker responded after it was forked");
    });

## Event: 'listening'

* `worker` {Worker object}
* `address` {Object}

After calling `listen()` from a worker, when the 'listening' event is emitted on
the server, a listening event will also be emitted on `cluster` in the master.

The event handler is executed with two arguments, the `worker` contains the worker
object and the `address` object contains the following connection properties:
`address`, `port` and `addressType`. This is very useful if the worker is listening
on more than one address.

    cluster.on('listening', function(worker, address) {
      console.log("A worker is now connected to " + address.address + ":" + address.port);
    });

The `addressType` is one of:

* `4` (TCPv4)
* `6` (TCPv6)
* `-1` (unix domain socket)
* `"udp4"` or `"udp6"` (UDP v4 or v6)

## Event: 'disconnect'

* `worker` {Worker object}

Emitted after the worker IPC channel has disconnected. This can occur when a
worker exits gracefully, is killed, or is disconnected manually (such as with
worker.disconnect()).

There may be a delay between the `disconnect` and `exit` events.  These events
can be used to detect if the process is stuck in a cleanup or if there are
long-living connections.

    cluster.on('disconnect', function(worker) {
      console.log('The worker #' + worker.id + ' has disconnected');
    });

## Event: 'exit'

* `worker` {Worker object}
* `code` {Number} the exit code, if it exited normally.
* `signal` {String} the name of the signal (eg. `'SIGHUP'`) that caused
  the process to be killed.

When any of the workers die the cluster module will emit the 'exit' event.

This can be used to restart the worker by calling `.fork()` again.

    cluster.on('exit', function(worker, code, signal) {
      console.log('worker %d died (%s). restarting...',
        worker.process.pid, signal || code);
      cluster.fork();
    });

See [child_process event: 'exit'](child_process.html#child_process_event_exit).

## Event: 'setup'

* `settings` {Object}

Emitted every time `.setupMaster()` is called.

The `settings` object is the `cluster.settings` object at the time
`.setupMaster()` was called and is advisory only, since multiple calls to
`.setupMaster()` can be made in a single tick.

If accuracy is important, use `cluster.settings`.

## cluster.setupMaster([settings])

* `settings` {Object}
  * `exec` {String} file path to worker file.  (Default=`process.argv[1]`)
  * `args` {Array} string arguments passed to worker.
    (Default=`process.argv.slice(2)`)
  * `silent` {Boolean} whether or not to send output to parent's stdio.
    (Default=`false`)

`setupMaster` is used to change the default 'fork' behavior. Once called,
the settings will be present in `cluster.settings`.

Note that:

* any settings changes only affect future calls to `.fork()` and have no
  effect on workers that are already running
* The *only* attribute of a worker that cannot be set via `.setupMaster()` is
  the `env` passed to `.fork()`
* the defaults above apply to the first call only, the defaults for later
  calls is the current value at the time of `cluster.setupMaster()` is called

Example:

    var cluster = require('cluster');
    cluster.setupMaster({
      exec: 'worker.js',
      args: ['--use', 'https'],
      silent: true
    });
    cluster.fork(); // https worker
    cluster.setupMaster({
      args: ['--use', 'http']
    });
    cluster.fork(); // http worker

This can only be called from the master process.

## cluster.fork([env])

* `env` {Object} Key/value pairs to add to worker process environment.
* return {Worker object}

Spawn a new worker process.

This can only be called from the master process.

## cluster.disconnect([callback])

* `callback` {Function} called when all workers are disconnected and handles are
  closed

Calls `.disconnect()` on each worker in `cluster.workers`.

When they are disconnected all internal handles will be closed, allowing the
master process to die gracefully if no other event is waiting.

The method takes an optional callback argument which will be called when finished.

This can only be called from the master process.

## cluster.worker

* {Object}

Uma referência para o objeto atual do worker. Não disponível no processo mestre.

    var cluster = require('cluster');

    if (cluster.isMaster) {
      console.log('Eu sou o mestre');
      cluster.fork();
      cluster.fork();
    } else if (cluster.isWorker) {
      console.log('Eu sou o worker #' + cluster.worker.id);
    }

## cluster.workers

* {Object}

Uma hash que armazena os objetos de workers ativos, chaveados pelo campo `id`.
Facilita percorrer todos os workers. Está apenas disponível no processo
mestre.

Uma worker é removido do cluster.workers depois que o worker foi desconectado _e_
terminado. A ordem entre esses dois eventos não pode ser determinado previamente.
Contudo, é garantido que a remoção do cluster.workers listado acontece antes do
último evento `'disconnect'` ou `'exit'` emitido.

    // Percorrer todos workers
    function eachWorker(callback) {
      for (var id in cluster.workers) {
        callback(cluster.workers[id]);
      }
    }
    eachWorker(function(worker) {
      worker.send('grande anúncio para todos os workers');
    });

Caso queira referenciar um worker através de um canal de comunicação,
o uso do id único do worker é a maneira mais fácil de encontrá-lo.
Should you wish to reference a worker over a communication channel, using
the worker's unique id is the easiest way to find the worker.

    socket.on('data', function(id) {
      var worker = cluster.workers[id];
    });

## Class: Worker
Um objeto Worker contêm toda informação pública e métodos sobre um worker.
No mestre é possível obtê-lo usando o `cluster.workers`. No worker é possível
obtê-lo usando o `cluster.worker`

### worker.id

* {String}

Um id único é atribuído para cada worker novo. Este id é armazenado em `id` e é
a chave que o indéxa no cluster.workers enquanto o worker estiver vivo.

### worker.process

* {ChildProcess object}

Todos workers são criados usando `child_process.fork()`, o objeto retornado
desta função é armazenado como `.process`. Em um worker, o `process` global é
armazenado.

Veja: [Child Process module](
child_process.html#child_process_child_process_fork_modulepath_args_options)

Note que um worker invocará o `process.exit(0)` se o evento `'disconnect'`
ocorrer no `process` e `.suicide` não for verdadeira (`true`). Isto protege
contra desconexões acidentais.

### worker.suicide

* {Boolean}

Definido pela chamada de `.kill()` ou `.disconnect()`, até que seja indefinido
(`undefined`).  

O boleano `worker.suicide` permite você distiguir entre saída voluntária e
acidental, o mestre pode escolher não recriar o worker baseado neste valor.

The boolean `worker.suicide` lets you distinguish between voluntary and accidental
exit, the master may choose not to respawn a worker based on this value.

    cluster.on('exit', function(worker, code, signal) {
      if (worker.suicide === true) {
        console.log('Opa, foi apenas um suicídio.\' – relaxe').
      }
    });

    // Mate o worker
    worker.kill();

### worker.send(message[, sendHandle])

* `message` {Object}
* `sendHandle` {Handle object}

Esta função é igual aos métodos de envio disponiveis no
`child_process.fork()`. Você pode usar esta função no mestre para enviar
uma mensagem para um worker específico.

No worker você pode também pode usar `process.send(message)`, é a mesma função.  

Este exemplo retornará todas as mensagens oriundas do master:

    if (cluster.isMaster) {
      var worker = cluster.fork();
      worker.send('e ai');

    } else if (cluster.isWorker) {
      process.on('message', function(msg) {
        process.send(msg);
      });
    }

### worker.kill([signal='SIGTERM'])

* `signal` {String} Name of the kill signal to send to the worker
  process.

Esta função irá matar o worker. No master, ele faz isso desconectando o
`worker.process`, e uma vez desconectado, matando com `signal`.

This function will kill the worker. In the master, it does this by disconnecting
the `worker.process`, and once disconnected, killing with `signal`. In the
worker, it does it by disconnecting the channel, and then exiting with code `0`.

Causes `.suicide` to be set.

This method is aliased as `worker.destroy()` for backwards compatibility.

Note that in a worker, `process.kill()` exists, but it is not this function,
it is [kill](process.html#process_process_kill_pid_signal).

### worker.disconnect()

In a worker, this function will close all servers, wait for the 'close' event on
those servers, and then disconnect the IPC channel.

In the master, an internal message is sent to the worker causing it to call
`.disconnect()` on itself.

Causes `.suicide` to be set.

Note that after a server is closed, it will no longer accept new connections,
but connections may be accepted by any other listening worker. Existing
connections will be allowed to close as usual. When no more connections exist,
see [server.close()](net.html#net_event_close), the IPC channel to the worker
will close allowing it to die gracefully.

The above applies *only* to server connections, client connections are not
automatically closed by workers, and disconnect does not wait for them to close
before exiting.

Note that in a worker, `process.disconnect` exists, but it is not this function,
it is [disconnect](child_process.html#child_process_child_disconnect).

Because long living server connections may block workers from disconnecting, it
may be useful to send a message, so application specific actions may be taken to
close them. It also may be useful to implement a timeout, killing a worker if
the `disconnect` event has not been emitted after some time.

    if (cluster.isMaster) {
      var worker = cluster.fork();
      var timeout;

      worker.on('listening', function(address) {
        worker.send('shutdown');
        worker.disconnect();
        timeout = setTimeout(function() {
          worker.kill();
        }, 2000);
      });

      worker.on('disconnect', function() {
        clearTimeout(timeout);
      });

    } else if (cluster.isWorker) {
      var net = require('net');
      var server = net.createServer(function(socket) {
        // connections never end
      });

      server.listen(8000);

      process.on('message', function(msg) {
        if(msg === 'shutdown') {
          // initiate graceful close of any connections to server
        }
      });
    }

### worker.isDead()

This function returns `true` if the worker's process has terminated (either
because of exiting or being signaled). Otherwise, it returns `false`.

### worker.isConnected()

This function returns `true` if the worker is connected to its master via its IPC
channel, `false` otherwise. A worker is connected to its master after it's been
created. It is disconnected after the `disconnect` event is emitted.

### Event: 'message'

* `message` {Object}

This event is the same as the one provided by `child_process.fork()`.

In a worker you can also use `process.on('message')`.

As an example, here is a cluster that keeps count of the number of requests
in the master process using the message system:

    var cluster = require('cluster');
    var http = require('http');

    if (cluster.isMaster) {

      // Keep track of http requests
      var numReqs = 0;
      setInterval(function() {
        console.log("numReqs =", numReqs);
      }, 1000);

      // Count requestes
      function messageHandler(msg) {
        if (msg.cmd && msg.cmd == 'notifyRequest') {
          numReqs += 1;
        }
      }

      // Start workers and listen for messages containing notifyRequest
      var numCPUs = require('os').cpus().length;
      for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].on('message', messageHandler);
      });

    } else {

      // Worker processes have a http server.
      http.Server(function(req, res) {
        res.writeHead(200);
        res.end("hello world\n");

        // notify master about the request
        process.send({ cmd: 'notifyRequest' });
      }).listen(8000);
    }

### Event: 'online'

Similar to the `cluster.on('online')` event, but specific to this worker.

    cluster.fork().on('online', function() {
      // Worker is online
    });

It is not emitted in the worker.

### Event: 'listening'

* `address` {Object}

Similar to the `cluster.on('listening')` event, but specific to this worker.

    cluster.fork().on('listening', function(address) {
      // Worker is listening
    });

It is not emitted in the worker.

### Event: 'disconnect'

Similar to the `cluster.on('disconnect')` event, but specfic to this worker.

    cluster.fork().on('disconnect', function() {
      // Worker has disconnected
    });

### Event: 'exit'

* `code` {Number} the exit code, if it exited normally.
* `signal` {String} the name of the signal (eg. `'SIGHUP'`) that caused
  the process to be killed.

Similar to the `cluster.on('exit')` event, but specific to this worker.

    var worker = cluster.fork();
    worker.on('exit', function(code, signal) {
      if( signal ) {
        console.log("worker was killed by signal: "+signal);
      } else if( code !== 0 ) {
        console.log("worker exited with error code: "+code);
      } else {
        console.log("worker success!");
      }
    });

### Event: 'error'

This event is the same as the one provided by `child_process.fork()`.

In a worker you can also use `process.on('error')`.
