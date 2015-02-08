[![Build Status](https://travis-ci.org/h13i32maru/eo.svg?branch=master)](https://travis-ci.org/h13i32maru/eo)

# eo
eo is generator based flow control (like [tj/co](https://github.com/tj/co)) and DOM event loop.

eo supports Promise, WHATWG Streams(Readable/Writable) and DOM event(click, touch, etc).

# Install
TODO: publish to npmjs.com

# Example

basic control flow.

```js
eo(function*(){
  console.log('sleep...');
  var result = yield sleep(200);
  console.log('wake!', result);

  return 'finish!';
}).then((val)=>{
  console.log(val); // finish!
});
```

with ReadableStream.

```js
eo(function*(){
  var rs = new SampleReadableStream();
  var data;
  while((data = yield rs) !== eo.EOF) {
    console.log('data', data);
  }
  console.log('finish');
});
```

with WritableStream.

```js
eo(function*(){
  var ws = new SampleWritableStream();
  var data = [1, 2, 3, 4, eo.EOF];
  for (var chunk of data) {
    yield [ws, chunk];
  }

  console.log('finish');
});
```

with DOM event.

```js
  var click = new eo.DOMEventStream('#box', 'click');
  eo.loop(function*(){
    var event = yield click;
    console.log('event', event);
  });
```

see [example](tree/master/example)

# Document
TODO: write document.

# LICENSE
MIT
