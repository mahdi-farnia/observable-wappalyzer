/* eslint-env browser */
;(function () {
  try {
    /** ReplaySubject */
    class Antenna {
      _handlers
      _cache

      constructor() {
        this._handlers = new Set()
        this._cache = []

        postMessage({ wappalyzerAntenna: true })

        this._registerListener()
      }

      _registerListener() {
        window.addEventListener('message', ({ data }) => {
          if (
            !data ||
            typeof data !== 'object' ||
            data.event !== 'wappalyzer-data'
          )
            return

          this._next(data.detections)
        })
      }

      _next(detections = []) {
        if (!detections.length) return

        this._cache = detections

        for (const fn of this._handlers)
          fn.call(this, structuredClone(detections))
      }

      subscribe(fn) {
        fn.call(this, structuredClone(this._cache))
        this._handlers.add(fn)

        return () => this._handlers.delete(fn)
      }
    }

    window.wappalyzerAntenna = new Antenna()
  } catch (e) {}
})()
