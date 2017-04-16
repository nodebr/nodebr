# Assert

    Estabilide: 5 - Travado
Este módulo é usado para escrever testes unitários para suas aplicações, 
você pode acessá-lo com `require('assert')` 

## assert.fail(actual, expected, message, operator)

Lança uma exceção que exibe os valores para `actual` e `expected` separados pelo operador fornecido.

## assert(value[, message]), assert.ok(value[, message])

Testa se o valor é verdadeiro, equivalente a `assert.equal(true, !!value, message);`

## assert.equal(actual, expected[, message])

Testes superficiais, de igualdade coerciva com o operador de comparação ( `==` ).

## assert.notEqual(actual, expected[, message])

Testes superficiais de igualdade coeriva com operador de comparação diferente ( `!=` ).

## assert.deepEqual(actual, expected[, message])

Testa a igualdade profunda.

## assert.notDeepEqual(actual, expected[, message])

Testa qualquer desigualdade profunda.

## assert.strictEqual(actual, expected[, message])

Testa a igualdade restrita, como determinado pelo operador de igualdade restrita ( `===` )

## assert.notStrictEqual(actual, expected[, message])

Testa estritamente não equalitário, como determinado pelo operador de diferença restrita ( `!==` )

## assert.throws(block[, error][, message])

Espera um `block` para lançar um erro. `error` pode ser um construtor, `RegExp` ou função de validação.

Valida instanceof usando construtor:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      Error
    );

Valida mensagem de erro usando RegExp:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      /value/
    );

Validação de erro customizada:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      function(err) {
        if ( (err instanceof Error) && /value/.test(err) ) {
          return true;
        }
      },
      "unexpected error"
    );

## assert.doesNotThrow(block[, message])

Espera `bloco` para não lançar um erro , veja `assert.throws` para maior detalhes.

## assert.ifError(value)

Testa se um valor não é um valor falso, lança erro se é verdadeiro. Útil quando
estiver testando o primeiro argumento, `error` em callbacks.
