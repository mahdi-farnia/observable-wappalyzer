/* eslint-env browser */
;(function () {
  try {
    class Antenna {
      constructor() {
        postMessage({ wappalyzerAntenna: true })
      }
    }

    window.wappalyzerAntenna = new Antenna()
  } catch (e) {}
})()
