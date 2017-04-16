# Buffer

    Estabilidade: 3 - Estável

Javascript puro é compatível com Unicode, mas o mesmo não acontece com dados binários. Quando
lida com `streams` TCP ou arquivos de sistema, é necessário lidar com octetos de `streams`.
Node tem muitas estratégias para manipulação, criação e consumo de octetos de `streams`.

Dados puros são armazenados em instâncias de classes de `Buffer`. Um `Buffer` é similar 
a um vetor de inteiros, mas correspondem a um espaço de memória alocada fora da pilha do V8. 
Um `Buffer` não pode ser redimensionado.

A classe `Buffer` é global, o que torna muito raro a necessidade 
de usar `require('buffer')`.

A conversão entre `Buffers` e objetos `string` do JavaScript requer 
um método de codificação explicita. Aqui está as diferentes codificações de `strings` 

* `'ascii'` - somente para dados ASCII de 7 bit.  Este método de codificação é muito rápido e
  irá excluir o bit mais alto caso exista.

* `'utf8'` - Codificação de caracteres Unicode Multibyte. Muitas páginas web e outros
  formatos de documento usam UTF-8.

* `'utf16le'` - 2 ou 4 bytes, `little endian` codificado para caracteres Unicode.
  Substituição de pares (U+10000 para U+10FFFF) são suportados.

* `'ucs2'` - Apelido de `'utf16le'`.

* `'base64'` - codificação de `string` para Base64.

* `'binary'` - Uma forma diferente de codificar dado binário para `strings` usando somente
  os 8 primeiros bits de cada caratere. Esta codificação está defasada e  
  deverá ser evitada quando possível em favor dos objetos `Buffer`. Esta codificação
  será removida em futuras versões do Node.

* `'hex'` - Codifica cada byte como dois carateres hexadecimal.

Criar um vetor tipado a partir de um `Buffer` funciona da seguinte forma:

1. A memória alocada do `buffer` é copiada, não compartilhada.

2. A memória alocada do `buffer` é interpretada como um vetor, não como um vetor de bytes.  Isto é,
   `new Uint32Array(new Buffer([1,2,3,4]))` cria um vetor `Uint32Array` de tamanho 4
   com os elementos `[1,2,3,4]`, e não um vetor `Uint32Array` com um simples elemento
   `[0x1020304]` ou `[0x4030201]`.

NOTA: Node.js v0.8 simplesmente retém uma referência de `buffer` em `array.buffer`
ao invés de cloná-la.

Ao invés de ser eficiente, introduz incompatibilidades sutís com os tipos
de vetor especificados.  `ArrayBuffer#slice()` faz uma cópia das partes enquanto
`Buffer#slice()` cria uma visualização.

## Class: Buffer

A classe Buffer é um tipo global para lidar com dados binários diretamente.
Pode ser construída de várias maneiras.

### new Buffer(size)

* `size` Número

Aloca um novo buffer de `size` octeto. Nota, `size` não deve ser mais do que
[kMaxLength](smalloc.html#smalloc_smalloc_kmaxlength). Caso contrário, um `RangeError`
será disparado aqui.

### new Buffer(array)

* `array` Vetor

Aloca um novo buffer usando um `array` de octetos.

### new Buffer(buffer)

* `buffer` {Buffer}

Copia os dados do `buffer` passado em uma nova instância de `Buffer`.

### new Buffer(str[, encoding])

* `str` String - string para codificar.
* `encoding` String - codificação para usar, Opcional.

Aloca um novo buffer contendo a `str` fornecida.
`encoding` padrão de `'utf8'`.

### Class Method: Buffer.isEncoding(encoding)

* `encoding` {String} A codificação da string para testar

Retorna verdadeiro se o `encoding` é uma codificação válida, ou falso
caso contrário.

### Class Method: Buffer.isBuffer(obj)

* `obj` Objeto
* Return: Boleano

Testa se `obj` é um `Buffer`.

### Class Method: Buffer.byteLength(string[, encoding])

* `string` String
* `encoding` String, Opcional, Padrão: 'utf8'
* Return: Número

Dado um tamanho de byte atual de uma string. `encoding` padrão é `'utf8'`.
Isso não é o mesmo que `String.prototype.length` desde que retorne o 
número de *characters* em uma string.

Exemplo:

    str = '\u00bd + \u00bc = \u00be';

    console.log(str + ": " + str.length + " characters, " +
      Buffer.byteLength(str, 'utf8') + " bytes");

    // ½ + ¼ = ¾: 9 characters, 12 bytes

### Class Method: Buffer.concat(list[, totalLength])

* `list` {Vetor} Lista de objetos Buffer para concatenar
* `totalLength` {Número} Tamanho total de buffers concatenados

Retorna um buffer que é um resultado da concatenação de todos os buffers da
lista junta.

Se a lista não tem itens, ou se totalLength é 0, então retorna um
buffer vazio.

Se a lista tem exatamente um item, então o primeiro item da lista é
retornado.

Se a lista tem mais de um item, então um novo Buffer é criado.

Se totalLength não é fornecido, é lido do buffer para a uma lista.
Contudo, isso adiciona um loop adicional na função, então isso é mais rápido
para fornecer o tamanho explicitamente.

### Class Method: Buffer.compare(buf1, buf2)

* `buf1` {Buffer}
* `buf2` {Buffer}

O mesmo que [`buf1.compare(buf2)`](#buffer_buf_compare_otherbuffer). Útil
para ordernação de um Array de Buffers:

    var arr = [Buffer('1234'), Buffer('0123')];
    arr.sort(Buffer.compare);


### buf.length

* Número

O tamanho do buffer em bytes. Note que isso não é necessariamente o tamanho
do conteúdo. `length` se refere ao montante de memória alocada para o
objeto buffer. Se não for feita nenhuma mudança quando o conteúdo do buffer for modificado.

    buf = new Buffer(1234);

    console.log(buf.length);
    buf.write("some string", 0, "ascii");
    console.log(buf.length);

    // 1234
    // 1234

Enquanto a propriedade tamanho (`length`) não é imutável, alterando o valor do tamanho
pode resultar em comportamento não definido e inconsistente. Aplicações que desejam 
modificar o tamanho do buffer deveriam portanto tratar o tamanho como somente leitura
e utilizar a função `buf.slice` para criar um novo buffer.

    buf = new Buffer(10);
    buf.write("abcdefghj", 0, "ascii");
    console.log(buf.length); // 10
    buf = buf.slice(0,5);
    console.log(buf.length); // 5

### buf.write(string[, offset][, length][, encoding])

* `string` String - dados para serem escritos no buffer
* `offset` Number, Opcional, Padrão: 0
* `length` Number, Opcional, Padrão: `buffer.length - offset`
* `encoding` String, Opcional, Padrão: 'utf8'

Escreve um texto (`string`) para o buffer na posição (`offset`) usando a codificação fornecida.
A posição (`offset`) por padrão é `0`, codificação (`encoding`) por padrão é 'utf8'. 
Tamanho (`length`) é o número de bytes a escrever. Retorna o número de octetos escritos. Se `buffer` 
não contém espaço suficiente para suportar o texto inteiro, será escrito somente uma parte do texto.
O valor padrão do tamanho (`length`) é o tamanho do buffer menos a posição fornecida (`buffer.length - offset`).
O método não escreverá caracteres parcialmente.

    buf = new Buffer(256);
    len = buf.write('\u00bd + \u00bc = \u00be', 0);
    console.log(len + " bytes: " + buf.toString('utf8', 0, len));

### buf.writeUIntLE(value, offset, byteLength[, noAssert])
### buf.writeUIntBE(value, offset, byteLength[, noAssert])
### buf.writeIntLE(value, offset, byteLength[, noAssert])
### buf.writeIntBE(value, offset, byteLength[, noAssert])

* `value` {Number} Bytes para serem escritos no buffer
* `offset` {Number} `0 <= offset <= buf.length`
* `byteLength` {Number} `0 < byteLength <= 6`
* `noAssert` {Boolean} Padrão: false
* Return: {Number}

Escreve o valor (`value`) para o buffer na posição (`offset`) e `byteLength` específicos.
Aceita até 48 bits de precisão. Por exemplo:

    var b = new Buffer(6);
    b.writeUIntBE(0x1234567890ab, 0, 6);
    // <Buffer 12 34 56 78 90 ab>

Atribua o valor 'true' para `noAssert` para pular a validação de valor (`value`) e posição (`offset`). O padrão 
é falso (`false`).

### buf.readUIntLE(offset, byteLength[, noAssert])
### buf.readUIntBE(offset, byteLength[, noAssert])
### buf.readIntLE(offset, byteLength[, noAssert])
### buf.readIntBE(offset, byteLength[, noAssert])

* `offset` {Number} `0 <= offset <= buf.length`
* `byteLength` {Number} `0 < byteLength <= 6`
* `noAssert` {Boolean} Padrão: false
* Return: {Number}

Uma versão generalizada de todos os métodos de leitura numérica. Suporta até 48 bits de
precisão. Por exemplo:

    var b = new Buffer(6);
    b.writeUint16LE(0x90ab, 0);
    b.writeUInt32LE(0x12345678, 2);
    b.readUIntLE(0, 6).toString(16);  // Especifica 6 bytes (48 bits)
    // output: '1234567890ab'

Atribua o valor 'true' para `noAssert` para pular a validação de posição (`offset`). Isto indica que a posição (`offset`)
pode estar além do final do buffer. Padrão é falso (`false`).

### buf.toString([encoding][, start][, end])

* `encoding` String, Opcional, Padrão: 'utf8'
* `start` Number, Opcional, Padrão: 0
* `end` Number, Opcional, Padrão : `buffer.length`

Decodifica e retorna um texto a partir dos dados codificados do buffer usando o conjunto de codificação de caracteres especificado.
Se a codificação (`encoding`) não está definido (`undefined`) ou nulo (`null`), então a codificação padrão será 'utf8'.
Os parâmetros início (`start`) e fim (`end`) serão por padrão `0` e o tamanho do buffer (`buffer.length`) 
quando não definido (`undefined`).

    buf = new Buffer(26);
    for (var i = 0 ; i < 26 ; i++) {
      buf[i] = i + 97; // 97 is ASCII a
    }
    buf.toString('ascii'); // outputs: abcdefghijklmnopqrstuvwxyz
    buf.toString('ascii',0,5); // outputs: abcde
    buf.toString('utf8',0,5); // outputs: abcde
    buf.toString(undefined,0,5); // encoding defaults to 'utf8', outputs abcde

Veja o exemplo de escrita acima, utilizando `buffer.write()`.


### buf.toJSON()

Retorna uma representação JSON da instância do Buffer. A função `JSON.stringify`
implicitamente chama esta função quando converte para texto ('stringifying') uma instância de Buffer.

Exemplo:

    var buf = new Buffer('test');
    var json = JSON.stringify(buf);

    console.log(json);
    // '{"type":"Buffer","data":[116,101,115,116]}'

    var copy = JSON.parse(json, function(key, value) {
        return value && value.type === 'Buffer'
          ? new Buffer(value.data)
          : value;
      });

    console.log(copy);
    // <Buffer 74 65 73 74>

### buf[index]

<!--type=property-->
<!--name=[index]-->

Recuperar e atribuir o octeto no índice (`index`). O valor se refere a bytes individuais,
portanto o domínio correto está entre `0x00` e `0xFF` hexadecimal ou `0` e `255`.

Exemplo: copiar um texto ASCII em um buffer, um byte por vez:

    str = "node.js";
    buf = new Buffer(str.length);

    for (var i = 0; i < str.length ; i++) {
      buf[i] = str.charCodeAt(i);
    }

    console.log(buf);

    // node.js

### buf.equals(otherBuffer)

* `otherBuffer` {Buffer}

Retorna um valor booleano indicando se o objeto atual ('this') é igual 
ao outro objeto (`otherBuffer`).

### buf.compare(otherBuffer)

* `otherBuffer` {Buffer}

Retorna um número indicando se o objeto atual (`this`) vem antes ou depois ou 
está na mesma ordem que o outro objeto (`otherBuffer`) na ordenação.

### buf.copy(targetBuffer[, targetStart][, sourceStart][, sourceEnd])

* `targetBuffer` Buffer object - Buffer no qual será copiado
* `targetStart` Number, Opcional, Padrão: 0
* `sourceStart` Number, Opcional, Padrão: 0
* `sourceEnd` Number, Opcional, Padrão: tamanho do buffer (`buffer.length`)

Copia dados de uma região do buffer para uma região no buffer destino
mesmo que a região de memória destino sobreponha a origem. Se os parâmetros não forem definidos (`undefined`), a
posição inicial do destino (`targetStart`) e a posição inicial na origem (`sourceStart`) receberão o valor padrão de '0', enquanto a posição final do destino (`sourceEnd`)
terá o valor padrão igual ao tamanho deste buffer (`buffer.length`).

Exemplo: construir dois Buffers, então copiar `buf1` do byte 16 ao byte 19
para `buf2`, começando no oitavo byte de `buf2`.

    buf1 = new Buffer(26);
    buf2 = new Buffer(26);

    for (var i = 0 ; i < 26 ; i++) {
      buf1[i] = i + 97; // 97 is ASCII a
      buf2[i] = 33; // ASCII !
    }

    buf1.copy(buf2, 8, 16, 20);
    console.log(buf2.toString('ascii', 0, 25));

    // !!!!!!!!qrst!!!!!!!!!!!!!

Exemplo: Construir um buffer e então copiar os dados de uma região para outra 
região sobreposta no mesmo buffer.

    buf = new Buffer(26);

    for (var i = 0 ; i < 26 ; i++) {
      buf[i] = i + 97; // 97 is ASCII a
    }

    buf.copy(buf, 0, 4, 10);
    console.log(buf.toString());

    // efghijghijklmnopqrstuvwxyz


### buf.slice([start][, end])

* `start` Number, Opcional, Padrão: 0
* `end` Number, Opcional, Padrão: `buffer.length`

Retona um novo Buffer que referencia a mesma memória que o antigo, mas recorta
usando a posição inicial (`start`) (padrão é `0`) e final (`end`) (padrão é o tamanho do buffer `buffer.length`).
Índices negativos começam do final do buffer.

**Modificando a nova fatia de buffer irá modificar a memória no buffer original!**

Exemplo: construir um Buffer com um alfabeto ASCII, toma uma fatia, então modifica um
byte do buffer original.

    var buf1 = new Buffer(26);

    for (var i = 0 ; i < 26 ; i++) {
      buf1[i] = i + 97; // 97 is ASCII a
    }

    var buf2 = buf1.slice(0, 3);
    console.log(buf2.toString('ascii', 0, buf2.length));
    buf1[0] = 33;
    console.log(buf2.toString('ascii', 0, buf2.length));

    // abc
    // !bc

### buf.readUInt8(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 8 bits não assinalado (unsigned) do buffer em um offset específico.

Seta `noAssert` como verdadeiro para pular a validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Exemplo:

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    for (ii = 0; ii < buf.length; ii++) {
      console.log(buf.readUInt8(ii));
    }

    // 0x3
    // 0x4
    // 0x23
    // 0x42

### buf.readUInt16LE(offset[, noAssert])
### buf.readUInt16BE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 16 bits não assinalado (unsigned) do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Exemplo:

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    console.log(buf.readUInt16BE(0));
    console.log(buf.readUInt16LE(0));
    console.log(buf.readUInt16BE(1));
    console.log(buf.readUInt16LE(1));
    console.log(buf.readUInt16BE(2));
    console.log(buf.readUInt16LE(2));

    // 0x0304
    // 0x0403
    // 0x0423
    // 0x2304
    // 0x2342
    // 0x4223

### buf.readUInt32LE(offset[, noAssert])
### buf.readUInt32BE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 32 bits não assinalado (unsigned) do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Example:

    var buf = new Buffer(4);

    buf[0] = 0x3;
    buf[1] = 0x4;
    buf[2] = 0x23;
    buf[3] = 0x42;

    console.log(buf.readUInt32BE(0));
    console.log(buf.readUInt32LE(0));

    // 0x03042342
    // 0x42230403

### buf.readInt8(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 8 bits assinalado (signed) do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Trabalha como `buffer.readUInt8`, exceto conteúdo do buffer são tratados como dois
valores complementares assinalados.

### buf.readInt16LE(offset[, noAssert])
### buf.readInt16BE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 16 bits assinalado (signed) do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Trabalha como `buffer.readUInt16*`, exceto conteúdo do buffer são tratados como dois
valores complementares assinalados.

### buf.readInt32LE(offset[, noAssert])
### buf.readInt32BE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê inteiro de 32 bits assinalado (signed) do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Trabalha como `buffer.readUInt32*`, exceto conteúdo do buffer são tratados como dois
valores complementares assinalados.

### buf.readFloatLE(offset[, noAssert])
### buf.readFloatBE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê ponto flutuante de 32 bits do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Exemplo:

    var buf = new Buffer(4);

    buf[0] = 0x00;
    buf[1] = 0x00;
    buf[2] = 0x80;
    buf[3] = 0x3f;

    console.log(buf.readFloatLE(0));

    // 0x01

### buf.readDoubleLE(offset[, noAssert])
### buf.readDoubleBE(offset[, noAssert])

* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false
* Return: Número

Lê ponto flutuante duplo de 64 bits do buffer em um offset específico com formato endian específico.

Seta `noAssert` como verdadeiro para pular validação do `offset`. Isso significa que `offset`
pode ser no final do buffer. Padrão é `false`.

Exemplo:

    var buf = new Buffer(8);

    buf[0] = 0x55;
    buf[1] = 0x55;
    buf[2] = 0x55;
    buf[3] = 0x55;
    buf[4] = 0x55;
    buf[5] = 0x55;
    buf[6] = 0xd5;
    buf[7] = 0x3f;

    console.log(buf.readDoubleLE(0));

    // 0.3333333333333333

### buf.writeUInt8(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Boleano, Opcional, Padrão: false

Escreve `value` em um buffer em um offset específico. Nota, `value` deve ser um 8 bits inteiro não assinalado válido.

Seta `noAssert` como verdadeiro para pular validação de `value` e `offset`. Isso significa
que `value` pode ser muito largo para a função especificada e `offset` pode ser
além da extremidade do fim do buffer excluindo os valores silenciosamente. Isso
não deveria ser usado a menos que você tenha certeza da exatidão. Padrão é `false`.

Exemplo:

    var buf = new Buffer(4);
    buf.writeUInt8(0x3, 0);
    buf.writeUInt8(0x4, 1);
    buf.writeUInt8(0x23, 2);
    buf.writeUInt8(0x42, 3);

    console.log(buf);

    // <Buffer 03 04 23 42>

### buf.writeUInt16LE(value, offset[, noAssert])
### buf.writeUInt16BE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian`
específico. Nota, `value` precisa ser um valor válido inteiro 16 bit não
assinalado (`unsigned 16 bit integer`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).


Exemplo:

    var buf = new Buffer(4);
    buf.writeUInt16BE(0xdead, 0);
    buf.writeUInt16BE(0xbeef, 2);

    console.log(buf);

    buf.writeUInt16LE(0xdead, 0);
    buf.writeUInt16LE(0xbeef, 2);

    console.log(buf);

    // <Buffer de ad be ef>
    // <Buffer ad de ef be>

### buf.writeUInt32LE(value, offset[, noAssert])
### buf.writeUInt32BE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian`
específico. Nota, `value` precisa ser um valor válido inteiro 32 bit não
assinalado (`unsigned 32 bit integer`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).


Exemplo:

    var buf = new Buffer(4);
    buf.writeUInt32BE(0xfeedface, 0);

    console.log(buf);

    buf.writeUInt32LE(0xfeedface, 0);

    console.log(buf);

    // <Buffer fe ed fa ce>
    // <Buffer ce fa ed fe>

### buf.writeInt8(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian`
específico. Nota, `value` precisa ser um valor válido inteiro 8 bit assinalado
(`signed 8 bit integer`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).

Funciona como `buffer.writeUInt8`, exceto que `value` é escrito como dois inteiros
assinalados complementares no `buffer`.

### buf.writeInt16LE(value, offset[, noAssert])
### buf.writeInt16BE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian`
específico. Nota, `value` precisa ser um valor válido inteiro 16 bit assinalado
(`signed 16 bit integer`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).

Funciona como `buffer.writeUInt16*`, exceto que `value` é escrito como dois inteiros
assinalados complementares no `buffer`.


### buf.writeInt32LE(value, offset[, noAssert])
### buf.writeInt32BE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian`
específico. Nota, `value` precisa ser um valor válido inteiro 32 bit assinalado
(`signed 32 bit integer`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).

Funciona como `buffer.writeUInt32*`, exceto que `value` é escrito como dois inteiros
assinalados complementares no `buffer`.

### buf.writeFloatLE(value, offset[, noAssert])
### buf.writeFloatBE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian` 
específico. Nota, comportamento não especificado se `value` não for um ponto-flutuante
de 32 bit (`32 bit float`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).

Exemplo:

    var buf = new Buffer(4);
    buf.writeFloatBE(0xcafebabe, 0);

    console.log(buf);

    buf.writeFloatLE(0xcafebabe, 0);

    console.log(buf);

    // <Buffer 4f 4a fe bb>
    // <Buffer bb fe 4a 4f>

### buf.writeDoubleLE(value, offset[, noAssert])
### buf.writeDoubleBE(value, offset[, noAssert])

* `value` Número
* `offset` Número
* `noAssert` Lógico, Opcional, Padrão: falso

Escreve `value` no buffer na posição específica (`offset`) com formato de `endian` 
específico. Nota, `value` precisa ser um valor válido ponto-flutuante duplo de 64 bit (`64 bit double`).

Atribua verdadeiro para `noAssert` para pular a validação de `value` and `offset`.
Isso significa que `value` pode ser muito grande para a função específica e a
posição (`offset`) pode estar além do final do buffer levando os valores a serem
silenciosamente descartados. Isto não deve ser usado a menos que você esteja certo
da correção. Padrão é falso (`false`).

Exemplo:

    var buf = new Buffer(8);
    buf.writeDoubleBE(0xdeadbeefcafebabe, 0);

    console.log(buf);

    buf.writeDoubleLE(0xdeadbeefcafebabe, 0);

    console.log(buf);

    // <Buffer 43 eb d5 b7 dd f9 5f d7>
    // <Buffer d7 5f f9 dd b7 d5 eb 43>

### buf.fill(value[, offset][, end])

* `value`
* `offset` Número, Opcional
* `end` Número, Opcional

Preenche o buffer com o valor passado (`value`). Se a posição (`offset`) (padrão `0`)
e final (`end`) (padrão `buffer.length`) não são passados o buffer inteiro será preenchido.

    var b = new Buffer(50);
    b.fill("h");

## buffer.INSPECT_MAX_BYTES

* Número, Padrão: 50

Quantos bytes serão retornados quando `buffer.inspect()` for executado. Isso pode
ser sobrescrito por módulos de usuários.

Note que essá é uma propriedade do módulo buffer devolvido por
`require('buffer')`, não no Buffer global ou em uma instância de buffer.

## Class: SlowBuffer

Retorna um `Buffer` não agrupado.

Para evitar a sobrecarga do `garbage collection` em ficar criando vários Buffers
alocados individualmente, por padrão alocações menores que 4KB são partes de 
um único grande objeto alocado. Essa abordagem melhora tanto a performance quanto
o uso da memória desde que o v8 não precisa rastrear e limpar tantos objetos `Persistentes`.

No caso onde o desenvolvedor precisar reter um pequeno pedaço de memória para um
pool para um montante de tempo indeterminado it may be appropriate to create an
un-pooled Buffer instance using SlowBuffer and copy out the relevant bits.

    // need to keep around a few small chunks of memory
    var store = [];

    socket.on('readable', function() {
      var data = socket.read();
      // allocate for retained data
      var sb = new SlowBuffer(10);
      // copy the data into the new allocation
      data.copy(sb, 0, 0, 10);
      store.push(sb);
    });


Embora este deva ser usado com moderação e usado somente como ultimo recurso *após* o desenvolvedor
observar ativamente a retenção de memória da sua aplicação.
