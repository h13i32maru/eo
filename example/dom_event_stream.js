window.addEventListener('DOMContentLoaded', ()=>{
  // simple
  var click = new eo.DOMEventStream('#box', 'click');
  eo.loop(function*(){
    var event = yield click;
    console.log('event', event);
  });

  //composite
  var start = new eo.DOMEventStream('#start', 'click');
  var stop = new eo.DOMEventStream('#stop', 'click');
  var elTime = document.querySelector('#time');
  eo.loop(function*(){
    var startEvent = yield start;
    elTime.textContent = '';

    while(1) {
      var [stopEvent, sleep] = yield eo.race([stop, sleep(100)]);
      if (stopEvent) break;
      elTime.textContent += '.';
    }

    elTime.textContent = (stopEvent.timeStamp - startEvent.timeStamp);
  });
});
