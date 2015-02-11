# Assert1

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

Tests shallow, coercive non-equality with the not equal comparison operator ( `!=` ).

## assert.deepEqual(actual, expected[, message])

Tests for deep equality.

## assert.notDeepEqual(actual, expected[, message])

Tests for any deep inequality.

## assert.strictEqual(actual, expected[, message])

Tests strict equality, as determined by the strict equality operator ( `===` )

## assert.notStrictEqual(actual, expected[, message])

Tests strict non-equality, as determined by the strict not equal operator ( `!==` )

## assert.throws(block[, error][, message])

Expects `block` to throw an error. `error` can be constructor, `RegExp` or
validation function.

Validate instanceof using constructor:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      Error
    );

Validate error message using RegExp:

    assert.throws(
      function() {
        throw new Error("Wrong value");
      },
      /value/
    );

Custom error validation:

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

Expects `block` not to throw an error, see `assert.throws` for details.

## assert.ifError(value)

Tests if value is not a false value, throws if it is a true value. Useful when
testing the first argument, `error` in callbacks.
