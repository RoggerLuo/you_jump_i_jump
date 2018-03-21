
export default {
  bindEvents(events) {
    events.forEach((e) => {
      if(!e.element)
        return;
      let element = document.querySelector(e.element);
      if(!element)
        return;
      element.addEventListener(e.event, e.handler);
    })
  },
  _checkUserAgent() {
    var userAgent = navigator.userAgent;
    if (userAgent.match(/Android/i) || userAgent.match(/webOS/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPad/i) || userAgent.match(/iPod/i) || userAgent.match(/BlackBerry/i))
      return true;
    return false;
  },
};
