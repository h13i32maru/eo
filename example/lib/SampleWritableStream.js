class SampleWritableStream extends eo.Streams.WritableStream {
  constructor() {
    function write(chunk){
      return new Promise((resolve, reject)=>{
        setTimeout(()=>{
          if (chunk === null) {
            reject(new Error('oh!'));
            return;
          }
          console.log('chunk', chunk);
          resolve();
        }, 300)
      });
    }

    super({write});
  }
}

window.SampleWritableStream = SampleWritableStream;
