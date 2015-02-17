# Zlib

    Estabilidade: 3 - Estável

Você pode acessar este módulo com:

    var zlib = require('zlib');

Este provê vinculações para as classes Gzip/Gunzip, Deflate/Inflate e
DeflateRaw/InflateRaw. Cada classe recebe as mesmas opções, e
são um Stream de leitura/escrita.

## Exemplos

Comprimir ou descomprimir um arquivo pode ser feito canalizando (piping)
um fs.ReadStream dentro de um stream zlib, depois dentro de um fs.WriteStream.

    var gzip = zlib.createGzip();
    var fs = require('fs');
    var input = fs.createReadStream('input.txt');
    var output = fs.createWriteStream('input.txt.gz');

    input.pipe(gzip).pipe(output);

Comprimir ou descomprimir dados pode ser feito usando os
convenientes métodos.

    var input = '.................................';
    zlib.deflate(input, function(err, buffer) {
      if (!err) {
        console.log(buffer.toString('base64'));
      }
    });

    var buffer = new Buffer('eJzT0yMAAGTvBe8=', 'base64');
    zlib.unzip(buffer, function(err, buffer) {
      if (!err) {
        console.log(buffer.toString());
      }
    });

Para usar este módulo em um cliente ou servidor HTTP, use o
[accept-encoding](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3)
nas requisições, e
[content-encoding](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11)
no cabeçalho das respostas.

**Nota: Estes exemplos são drasticamente simplificados para mostrar o conceito básico.** Zlib encoding pode ser custoso, e os resultados
devem ser cacheados. Veja antes [Otimização do Uso de Memória](#zlib_memory_usage_tuning)
para mais informações envolvendo o uso da zlib a respeito de
velocidade/memória/compressão.

    // exemplo de uma requisição do cliente
    var zlib = require('zlib');
    var http = require('http');
    var fs = require('fs');
    var request = http.get({ host: 'izs.me',
                             path: '/',
                             port: 80,
                             headers: { 'accept-encoding': 'gzip,deflate' } });
    request.on('response', function(response) {
      var output = fs.createWriteStream('izs.me_index.html');

      switch (response.headers['content-encoding']) {
        // ou, apenas use zlib.createUnzip() para controlar ambos os casos
        case 'gzip':
          response.pipe(zlib.createGunzip()).pipe(output);
          break;
        case 'deflate':
          response.pipe(zlib.createInflate()).pipe(output);
          break;
        default:
          response.pipe(output);
          break;
      }
    });

    // exemplo no servidor
    // rodar uma operação de gzip em cada requisição é bastante custoso.
    // seria muito mais eficiente cachear o buffer comprimido.
    var zlib = require('zlib');
    var http = require('http');
    var fs = require('fs');
    http.createServer(function(request, response) {
      var raw = fs.createReadStream('index.html');
      var acceptEncoding = request.headers['accept-encoding'];
      if (!acceptEncoding) {
        acceptEncoding = '';
      }

      // Nota: Este não é um parser accept-encoding bem estabelecido.
      // Veja http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
      if (acceptEncoding.match(/\bdeflate\b/)) {
        response.writeHead(200, { 'content-encoding': 'deflate' });
        raw.pipe(zlib.createDeflate()).pipe(response);
      } else if (acceptEncoding.match(/\bgzip\b/)) {
        response.writeHead(200, { 'content-encoding': 'gzip' });
        raw.pipe(zlib.createGzip()).pipe(response);
      } else {
        response.writeHead(200, {});
        raw.pipe(response);
      }
    }).listen(1337);

## zlib.createGzip([options])

Retorna um novo objeto [Gzip](#zlib_class_zlib_gzip) com
[opções](#zlib_options).

## zlib.createGunzip([options])

Retorna um novo objeto [Gunzip](#zlib_class_zlib_gunzip) com
[opções](#zlib_options).

## zlib.createDeflate([options])

Retorna um novo objeto [Deflate](#zlib_class_zlib_deflate) com
[opções](#zlib_options).

## zlib.createInflate([options])

Retorna um novo objeto [Inflate](#zlib_class_zlib_inflate) com
[opções](#zlib_options).

## zlib.createDeflateRaw([options])

Retorna um novo objeto [DeflateRaw](#zlib_class_zlib_deflateraw) com
[opções](#zlib_options).

## zlib.createInflateRaw([options])

Retorna um novo objeto [InflateRaw](#zlib_class_zlib_inflateraw) com
[opções](#zlib_options).

## zlib.createUnzip([options])

Retorna um novo objeto [Unzip](#zlib_class_zlib_unzip) com
[opções](#zlib_options).

## Classe: zlib.Zlib

Não é exportado pelo módulo `zlib`. Está documentado aqui porque é a classe
base das classes compressor/decompressor.

### zlib.flush([kind], callback)

`kind` é o padrão para `zlib.Z_FULL_FLUSH`.

Descarga de dados pendentes. Não chame-a frivolamente, descargas prematura tem um impacto negativo no algorítimo de compressão.

### zlib.params(level, strategy, callback)

Dinamicamente atualiza o nível de compressão e a estratégia de compressão.
Aplicável apenas para o algorítimo deflate.

### zlib.reset()

Redefine os padrões de fábrica para compressão/descompressão. Aplicável
apenas para os algorítimos inflate e deflate.

## Classe: zlib.Gzip

Comprime dados usando gzip.

## Classe: zlib.Gunzip

Descomprime um stream gzip.

## Classe: zlib.Deflate

Comprime dados usando deflate.

## Classe: zlib.Inflate

Descomprime um stream deflate.

## Classe: zlib.DeflateRaw

Comprime dados usando deflate, e não anexa o cabeçalho zlib.

## Classe: zlib.InflateRaw

Descomprime um stream deflate cru.

## Classe: zlib.Unzip

Descomprime tanto um stream Gzip quanto um stream Deflate comprimido
por auto-detecção do cabeçalho.

## Métodos convenientes

<!--type=misc-->

Todos estes pegam uma string ou buffer como o primeiro argumento, e um
segundo argumento opcional para fornecer opções para a classe zlib
e um terceiro para chamar o callback com `callback(error, result)`.

Cada método tem um `*Sync` em contra partida, no qual aceita os mesmos argumentos, mas sem um callback.

## zlib.deflate(buf[, options], callback)
## zlib.deflateSync(buf[, options])

Comprime uma string com Deflate.

## zlib.deflateRaw(buf[, options], callback)
## zlib.deflateRawSync(buf[, options])

Comprime uma string com DeflateRaw.

## zlib.gzip(buf[, options], callback)
## zlib.gzipSync(buf[, options])

Comprime uma string com Gzip.

## zlib.gunzip(buf[, options], callback)
## zlib.gunzipSync(buf[, options])

Descomprime um Buffer cru com Gunzip.

## zlib.inflate(buf[, options], callback)
## zlib.inflateSync(buf[, options])

Descomprime um Buffer cru com Inflate.

## zlib.inflateRaw(buf[, options], callback)
## zlib.inflateRawSync(buf[, options])

Descomprime um Buffer cru com InflateRaw.

## zlib.unzip(buf[, options], callback)
## zlib.unzipSync(buf[, options])

Descomprime um Buffer cru com Unzip.

## Opções

<!--type=misc-->

Cada classe recebe um objeto options. Todos os atributos deste objeto
são opcionais.

Note que algumas opções são relevantes apenas para a classe de compressão e são ignoradas para a classe de descompressão.

* flush (padrão: `zlib.Z_NO_FLUSH`)
* chunkSize (padrão: 16*1024)
* windowBits
* level (apenas compressão)
* memLevel (apenas compressão)
* strategy (apenas compressão)
* dictionary (apenas deflate/inflate, dicionário vazio por padrão)

Veja a descrição de `deflateInit2` e `inflateInit2` em
<http://zlib.net/manual.html#Advanced> para mais informações sobre isto.

## Otimização do Uso de Memória

<!--type=misc-->

De `zlib/zconf.h`, modificada para uso no node:

Os requisitos de memória para deflate são (em bytes):

    (1 << (windowBits+2)) +  (1 << (memLevel+9))

que é: 128K para windowBits=15  +  128K para memLevel = 8
(valores padrões) mais alguns kilobytes para pequenos objetos.

Por exemplo, se você quer reduzir
o requerimento padrão de memória de 256K para 128K, defina as opções para:

    { windowBits: 14, memLevel: 7 }

É claro que isto vai degradar a compressão genericamente
(não há almoço grátis).

Os requisitos de memória para inflate são (em bytes)

    1 << windowBits

que é, 32K para windowBits=15 (valor padrão) mais alguns kilobytes
para pequenos objetos.

Isto é em adição para uma única saída interna teto do tamanho do buffer
`chunkSize`, no qual o padrão é 16K.

A velocidade de compressão da zlib é mais drasticamente afetada pela configuração de `level`. Um alto `level` vai resultar em uma compressão
melhor, mas vai demorar mais para ser completada.
Um baixo `level` vai resultar em uma menor compressão, mas será mais rápida.

No geral, mais opções de uso de memória significará que o node terá que
fazer menos chamadas para zlib, uma vez que ele vai ser capaz de processar
mais dados em uma unica operação de `escrita`. Assim, este é outro fator que
afeta a velocidade no custo do uso de memória.

## Constantes

<!--type=misc-->

Todas essas constantes definidas em zlib.h também são definidas em
`require('zlib')`.
Em um curso normal de operação, você não precisará definir qualquer
uma delas. Elas estão documentadas aqui então a sua presença não são
surpreendente. Esta seção foi tirada quase diretamente de
[zlib documentation](http://zlib.net/manual.html#Constants). Veja
<http://zlib.net/manual.html#Constants> para mais detalhes.

Permite valores para flush.

* `zlib.Z_NO_FLUSH`
* `zlib.Z_PARTIAL_FLUSH`
* `zlib.Z_SYNC_FLUSH`
* `zlib.Z_FULL_FLUSH`
* `zlib.Z_FINISH`
* `zlib.Z_BLOCK`
* `zlib.Z_TREES`

Retorna códigos para funções de compressão/descompressão. Valores negativos
são erros, valores positivos são usados para eventos normais e também
especiais.

* `zlib.Z_OK`
* `zlib.Z_STREAM_END`
* `zlib.Z_NEED_DICT`
* `zlib.Z_ERRNO`
* `zlib.Z_STREAM_ERROR`
* `zlib.Z_DATA_ERROR`
* `zlib.Z_MEM_ERROR`
* `zlib.Z_BUF_ERROR`
* `zlib.Z_VERSION_ERROR`

Níveis de compressão.

* `zlib.Z_NO_COMPRESSION`
* `zlib.Z_BEST_SPEED`
* `zlib.Z_BEST_COMPRESSION`
* `zlib.Z_DEFAULT_COMPRESSION`

Estrategia de compressão.

* `zlib.Z_FILTERED`
* `zlib.Z_HUFFMAN_ONLY`
* `zlib.Z_RLE`
* `zlib.Z_FIXED`
* `zlib.Z_DEFAULT_STRATEGY`

Valores possíveis do campo data_type.

* `zlib.Z_BINARY`
* `zlib.Z_TEXT`
* `zlib.Z_ASCII`
* `zlib.Z_UNKNOWN`

O método de compressão deflate (o único suportado nessa versão).

* `zlib.Z_DEFLATED`

Para inicialização de zalloc, zfree e opaque.

* `zlib.Z_NULL`
