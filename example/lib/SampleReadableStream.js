class SampleReadableStream extends eo.Streams.ReadableStream {
  constructor() {
    var count = 5;

    function start(enqueue, close, error) {
      var id = setInterval(()=>{
        enqueue({count: count});
        count--;

        if (count <= 0) {
          clearInterval(id);
          close();
        }
      }, 300);
    }

    super({start});
  }
}

window.SampleReadableStream = SampleReadableStream;
