# Timers

    Estabilidade: 5 - Fechado

Todas as funções do timer são globais. Você não necessita requisitar (`require()`)
este módulo para usá-lo.

## setTimeout(callback, delay[, arg][, ...])

Para agendar a execução somente uma vez de uma função ('callback') depois de um atraso (`delay`) em milisegundos. Retorna um
objeto `timeoutObject` para possível uso com a função `clearTimeout()`. Opcionalmente você pode
também passar argumentos para o callback.

É importante notar que o seu callback provavelmente não será chamado em exatamente
`delay` milisegundos - Node.js não garante o tempo exato quando o
callback será disparado, nem a ordenação das coisas disparadas dentro dele.
O callback será chamado o mais próximo possível do tempo indicado.

## clearTimeout(timeoutObject)

Previne o disparo de um timeout.

## setInterval(callback, delay[, arg][, ...])

Para agendar a execução repetida de um callback a cada atraso (`delay`) em milisegundos.
Retorna um objeto (`intervalObject`) para possível uso com a função (`clearInterval()`).
Opcionalmente você pode passar argumentos para o callback.

## clearInterval(intervalObject)

Interrompe o disparo de um intervalo. 

## unref()

O valor retornado por 'setTimeout' e 'setInterval' também tem o método 'timer.unref()'
o qual possibilita a criação de um timer ativo mas que se for o único item restante no
evento de loop não irá manter o programa executando.
Se o timer já está como 'unref', chamar 'unref' novamente não terá efeito.

No caso de 'setTimeout', quando você chama 'unref' é criado um timer separado que
irá despertar o evento de loop. Criar muitos destes pode gerar um efeito não desejado
no desempenho do evento de loop -- use com sabedoria.

## ref()

Se você já chamou 'unref()' para um timer, você pode chamar 'ref()' para explicitamente
requisitar que o timer mantenha o programa aberto. Se o timer já está como 'ref', chamar 'ref'
novamente não terá efeito.

## setImmediate(callback[, arg][, ...])

Para agendar um execução imediata do callback depois de callbacks de I/O
e antes das funções 'setTimeout' e 'setInterval'. Retorna um objeto
'immediateObject' para possível uso com a função 'clearImmediate()'.
Opcionalmente você pode passar argumentos para o callback.

Callbacks para execuções imediatas são enfileirados na ordem em que foram criados.
A fila inteira de callbacks é processada em cada iteração do loop de eventos.
Se você enfileirar uma execução imediata de dentro de um callback que está executando, aquela execução
não irá disparar até a próxima iteração do loop de eventos.

## clearImmediate(immediateObject)

Interrompe o disparo de uma execução imediata.
