import {ReadableStream} from 'eo.whatwg-streams';

/**
 * @classdesc
 * DOMEventStream is class.
 *
 * @class
 * @desc
 * Creates DOMEventStream object.
 * @param {HTMLElement | string} element HTMLElement or selector.
 * @param {string} eventName event name.
 */
export default class DOMEventStream extends ReadableStream {
  constructor(element, eventName) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    this._element = element;
    this._eventName = eventName;
    this._onEvent = (event)=>{
      this._enqueue(event);
      this._element.removeEventListener(this._eventName, this._onEvent, false);
    };

    var start = (enqueue, close, error)=>{
      this._enqueue = enqueue;
      this._close = close;
      this._error = error;
    };
    super({start});
  }

  get ready() {
    if (this.state === 'waiting') {
      this._element.addEventListener(this._eventName, this._onEvent, false);
    }

    return super.ready;
  }
}
