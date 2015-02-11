# Assert

    Stability: 5 - Locked

This module is used for writing unit tests for your applications, you can
access it with `require('assert')`.

## assert.fail(actual, expected, message, operator)

Throws an exception that displays the values for `actual` and `expected` separated by the provided operator.

## assert(value[, message]), assert.ok(value[, message])

Tests if value is truthy, it is equivalent to `assert.equal(true, !!value, message);`

## assert.equal(actual, expected[, message])

Tests shallow, coercive equality with the equal comparison operator ( `==` ).

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
