# Addons

O termo addon se refere à algo que esta sendo adicionado ao `node`.

Addons são objetos compartilhados dinamicamente referenciados. Eles fornecem 
uma cola entre bibliotecas escritas em linguagem C e C++. A API (até o
 momento) é bastante complexa, envolvendo conhecimento de diversas bibliotecas:

 - JavaScript V8, uma biblioteca C++. Usado para fazer interface com Javascript:
   criando objetos, chamando funções etc. Documentado principalmente no arquivo 
   header `v8.h` (`deps/v8/include/v8.h` na árvore de código fonte Node), 
   que também esta disponível [online](http://izs.me/v8-docs/main.html).

 - [libuv](https://github.com/joyent/libuv), biblioteca C de loop de eventos C.
   A qualquer que for preciso aguardar que um descritor de arquivo seja 
   disponibilizado para leitura, um timer seja aguardado ou um sinal é
   aguardado será necessário fazer interface com libuv. Isto é, se
   você fizer uma operação de E/S, será necessário usar libuv.

 - Bibliotecas internas do Node. O mais importante é a clasee 
   `node::ObjectWrap` à qual você vai provavelmente querer derivar.

 - Outras. Veja em `deps/` para saber o que mais esta disponível.

Node estaticamente compila todas as suas dependências dentro do executável.
Quando for compilar seu módulo, você não precisa se preocupar em referenciar
qualquer uma dessas bibliotecas.

Todos os exemplos a seguir estão disponíveis para 
[download](https://github.com/rvagg/node-addon-examples) e podem ser usadas
como ponto de partida para seu próprio Addon.

## Hello world

Para começar vamos fazer um pequeno Addon que é um equivalente C++ do seguinte
código Javascript:

    module.exports.hello = function() { return 'world'; };

Primeiro nós criamos um arquivo `hello.cc`:

    // hello.cc
    #include <node.h>

    using namespace v8;

    void Method(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);
      args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
    }

    void init(Handle<Object> exports) {
      NODE_SET_METHOD(exports, "hello", Method);
    }

    NODE_MODULE(addon, init)

Note que todos os addons de Node devem exportar uma função de inicialização:

    void Initialize (Handle<Object> exports);
    NODE_MODULE(nome_modulo, Initialize)

Não há o caracter ponto-e-vírgula(;) depois de `NODE_MODULE` porque este trecho
 não é uma função (veja `node.h`).

O `nome_modulo` precisa ser o mesmo do nome do arquivo do binário final (menos
o sufixo .node).

O código fonte precisa ser compilado para `addon.node`, o binário do Addon.
Para fazer isso nós criamos um arquivo chamado `binding.gyp` que descreve a 
configuração para compilar seu módulo em um formato JSON. Este arquivo é 
por [node-gyp](https://github.com/TooTallNate/node-gyp).

    {
      "targets": [
        {
          "target_name": "addon",
          "sources": [ "hello.cc" ]
        }
      ]
    }

O próximo passo é gerar os arquivos apropriados para a construção do projeto
na plataforma em uso. Use `node-gyp configure` para isso.

Agora, você terá ou um arquivo `Makefile` (em plataformas Unix) ou um arquivo 
`vcxproj` (no Windows) no diretório `build/`. Agora execute o comando 
`node-gyp build`.

Agora você tem seu arquivo de vínculos `.node`! Os vínculos estarão em
`build/Release/`.

Agora você pode usar o arquivo binário compilado do addon em um projeto Node
`hello.js` fazendo apontamento com `require` ao módulo `hello.node` 
recentemente construído:

    // hello.js
    var addon = require('./build/Release/addon');

    console.log(addon.hello()); // 'world'

Por favor, veja padrões abaixo para mais informações ou
Please see patterns below for further information or
<https://github.com/arturadib/node-qt> para um exemplo em produção.


## Addon patterns

Abaixo alguns padrões de addons para ajuda-lo a iniciar. Consulte a [documentação online](http://izs.me/v8-docs/main.html) para obter ajuda com diversas chamadas do V8, e o [Guia de Embedder](http://code.google.com/apis/v8/embed.html) para explicação de vários conceitos usados como handles, scopes, function templates, etc.

Para utilizar esses exemplos você precisa compila-los usando `node-gyp`. Crie o seguinte arquivo `binding.gyp`:

    {
      "targets": [
        {
          "target_name": "addon",
          "sources": [ "addon.cc" ]
        }
      ]
    }

Em casos onde há mais de um arquivo `.cc` simplesmente adicione o nome do arquivo para o array `sources`. Exemplo:

    "sources": ["addon.cc", "myexample.cc"]

Agora que você tem o seu `binding.gyp` pronto, você pode configurar e compilar o addon:

    $ node-gyp configure build


### Argumentos de Função

O seguinte padrão ilustra como faz a leitura dos argumentos de chamada de função JavaScript (JavaScript function calls) e retornar um resultado. Essa é a principal fonte do `addon.cc`e também a unica necessária:

    // addon.cc
    #include <node.h>

    using namespace v8;

    void Add(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      if (args.Length() < 2) {
        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong number of arguments")));
        return;
      }

      if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong arguments")));
        return;
      }

      double value = args[0]->NumberValue() + args[1]->NumberValue();
      Local<Number> num = Number::New(isolate, value);

      args.GetReturnValue().Set(num);
    }

    void Init(Handle<Object> exports) {
      NODE_SET_METHOD(exports, "add", Add);
    }

    NODE_MODULE(addon, Init)

Você pode testa-lo com o seguinte trecho JavaScript:

    // test.js
    var addon = require('./build/Release/addon');

    console.log( 'This should be eight:', addon.add(3,5) );


### Callbacks

Você pode passar funções JavaScript para funções C++ e executa-lás a partir daqui. Aqui está `addon.cc`:

<!-- You can pass JavaScript functions to a C++ function and execute them from
there. Here's `addon.cc`:-->

    // addon.cc
    #include <node.h>

    using namespace v8;

    void RunCallback(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      Local<Function> cb = Local<Function>::Cast(args[0]);
      const unsigned argc = 1;
      Local<Value> argv[argc] = { String::NewFromUtf8(isolate, "hello world") };
      cb->Call(isolate->GetCurrentContext()->Global(), argc, argv);
    }

    void Init(Handle<Object> exports, Handle<Object> module) {
      NODE_SET_METHOD(module, "exports", RunCallback);
    }

    NODE_MODULE(addon, Init)

Note que este exemplo utiliza o `Init()` com dois argumentos, sendo o segundo um objeto `module`. Isto permite que o addon sobrescreva completamente o `exports` com uma única função ao invés de adicionar a função como uma propriedade de `exports`.

<!--Note that this example uses a two-argument form of `Init()` that receives
the full `module` object as the second argument. This allows the addon
to completely overwrite `exports` with a single function instead of
adding the function as a property of `exports`.-->

Para testar isto, execute o trecho de JavaScript seguinte:

<!--To test it run the following JavaScript snippet:-->

    // test.js
    var addon = require('./build/Release/addon');

    addon(function(msg){
      console.log(msg); // 'Olá Mundo :D'
    });


### Fábrica de objeto (Object factory)

Você pode criar e retornar novos objetos de dentro de uma função C++ com este padrão `addon.cc`, que retorna um objeto com a propriedade `msg`, que ecoa a string passada para `createObject()`:

<!--You can create and return new objects from within a C++ function with this
`addon.cc` pattern, which returns an object with property `msg` that echoes
the string passed to `createObject()`:
-->

    // addon.cc
    #include <node.h>

    using namespace v8;

    void CreateObject(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      Local<Object> obj = Object::New(isolate);
      obj->Set(String::NewFromUtf8(isolate, "msg"), args[0]->ToString());

      args.GetReturnValue().Set(obj);
    }

    void Init(Handle<Object> exports, Handle<Object> module) {
      NODE_SET_METHOD(module, "exports", CreateObject);
    }

    NODE_MODULE(addon, Init)

Para testar isto em JavaScript:

<!--To test it in JavaScript:-->

    // test.js
    var addon = require('./build/Release/addon');

    var obj1 = addon('hello');
    var obj2 = addon('world');
    console.log(obj1.msg+' '+obj2.msg); // 'Ola mundo :D'


### Function factory

Esse padrão ilustra como criar e retornar uma função Javascript que envelopa  uma função C++:

    // addon.cc
    #include <node.h>

    using namespace v8;

    void MyFunction(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);
      args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello world"));
    }

    void CreateFunction(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction);
      Local<Function> fn = tpl->GetFunction();

      // omit this to make it anonymous
      fn->SetName(String::NewFromUtf8(isolate, "theFunction"));

      args.GetReturnValue().Set(fn);
    }

    void Init(Handle<Object> exports, Handle<Object> module) {
      NODE_SET_METHOD(module, "exports", CreateFunction);
    }

    NODE_MODULE(addon, Init)

Para testar:

    // test.js
    var addon = require('./build/Release/addon');

    var fn = addon();
    console.log(fn()); // 'hello world'


### Envelopando objetos  C++


Aqui criaremos um envelope (*wrapper*)  para um objeto/classe `MyObject` que pode ser instanciado no Javascript utilizando o operador `new`. Primeiro prepare  o modulo principal `addon.cc`:

  

    // addon.cc
    #include <node.h>
    #include "myobject.h"

    using namespace v8;

    void InitAll(Handle<Object> exports) {
      MyObject::Init(exports);
    }

    NODE_MODULE(addon, InitAll)

Then in `myobject.h` make your wrapper inherit from `node::ObjectWrap`:
Em seguida em `myobject.h` torne o seu envelope herdeiro classe  `node::ObjectWrap`:

    // myobject.h
    #ifndef MYOBJECT_H
    #define MYOBJECT_H

    #include <node.h>
    #include <node_object_wrap.h>

    class MyObject : public node::ObjectWrap {
     public:
      static void Init(v8::Handle<v8::Object> exports);

     private:
      explicit MyObject(double value = 0);
      ~MyObject();

      static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
      static void PlusOne(const v8::FunctionCallbackInfo<v8::Value>& args);
      static v8::Persistent<v8::Function> constructor;
      double value_;
    };

    #endif

Em `myobject.cc` implemente os métodos que deseja expor.
No exemplo abaixo estamos expondo o método `plusOne` adicionando esse método ao protótipo do construtor: 

    // myobject.cc
    #include "myobject.h"

    using namespace v8;

    Persistent<Function> MyObject::constructor;

    MyObject::MyObject(double value) : value_(value) {
    }

    MyObject::~MyObject() {
    }

    void MyObject::Init(Handle<Object> exports) {
      Isolate* isolate = Isolate::GetCurrent();

      // Preparando o template do construtor
      Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
      tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
      tpl->InstanceTemplate()->SetInternalFieldCount(1);

      // Protótipo
      NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

      constructor.Reset(isolate, tpl->GetFunction());
      exports->Set(String::NewFromUtf8(isolate, "MyObject"),
                   tpl->GetFunction());
    }

    void MyObject::New(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      if (args.IsConstructCall()) {
        // Invocado como construtor: `new MyObject(...)`
        double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
        MyObject* obj = new MyObject(value);
        obj->Wrap(args.This());
        args.GetReturnValue().Set(args.This());
      } else {
        // Invocado como função simples `MyObject(...)`, se transforma em uma chamada de construtor.
        const int argc = 1;
        Local<Value> argv[argc] = { args[0] };
        Local<Function> cons = Local<Function>::New(isolate, constructor);
        args.GetReturnValue().Set(cons->NewInstance(argc, argv));
      }
    }

    void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
      Isolate* isolate = Isolate::GetCurrent();
      HandleScope scope(isolate);

      MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
      obj->value_ += 1;

      args.GetReturnValue().Set(Number::New(isolate, obj->value_));
    }

Teste com:

    // test.js
    var addon = require('./build/Release/addon');

    var obj = new addon.MyObject(10);
    console.log( obj.plusOne() ); // 11
    console.log( obj.plusOne() ); // 12
    console.log( obj.plusOne() ); // 13
