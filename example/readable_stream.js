// simple
eo(function*(){
  var rs = new SampleReadableStream();
  var data;
  while((data = yield rs) !== eo.EOF) {
    console.log('data', data);
  }
  console.log('finish');
});

// global error handling
eo(function*(){
  return;
  var rs = new SampleReadableStream();
  var data;
  while((data = yield rs) !== eo.EOF) {
    console.log('data', data);
  }
  console.log('finish');
}).catch((e)=>{
  console.log('error', e);
});

// individual error handling
eo(function*(){
  return;
  var rs = new SampleReadableStream();
  var data;
  try {
    while((data = yield rs) !== eo.EOF) {
      console.log('data', data);
    }
  } catch(e) {
    console.log('error', e);
  }
  console.log('finish');
});
