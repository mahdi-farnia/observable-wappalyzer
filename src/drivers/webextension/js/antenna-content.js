'use strict'
/* eslint-env browser */
/* globals chrome */

function mountAntenna(url) {
  const script = document.createElement('script')

  return new Promise((resolve, reject) => {
    script.onerror = reject

    window.addEventListener('message', function onScriptReady({ data }) {
      if (!data.wappalyzerAntenna) return

      resolve()
      window.removeEventListener('message', onScriptReady)
    })

    script.setAttribute('src', chrome.runtime.getURL(url))

    document.head.appendChild(script)
  })
}

const AntennaContent = {
  async init() {
    await mountAntenna('js/antenna.js')

    const detections = await AntennaContent.driver('getDetectionsByURL', [
      location.href,
    ])

    AntennaContent.broadCast(detections)

    chrome.runtime.onMessage.addListener(AntennaContent.onMessage)
  },

  driver(func, args) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          source: 'content.js',
          func,
          args:
            args instanceof Error
              ? [args.toString()]
              : args
              ? Array.isArray(args)
                ? args
                : [args]
              : [],
        },
        (response) => {
          chrome.runtime.lastError
            ? func === 'error'
              ? resolve()
              : AntennaContent.driver(
                  'error',
                  new Error(
                    `${
                      chrome.runtime.lastError.message
                    }: Driver.${func}(${JSON.stringify(args)})`
                  )
                )
            : resolve(response)
        }
      )
    })
  },

  broadCast(detections) {
    postMessage({ event: 'wappalyzer-data', detections: detections ?? [] })
  },

  onMessage({ detections }, sender, callback) {
    AntennaContent.broadCast(detections)

    callback()
  },
}

document.addEventListener('DOMContentLoaded', AntennaContent.init, {
  once: true,
})
