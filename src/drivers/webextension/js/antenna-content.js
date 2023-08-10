'use strict'
/* eslint-env browser */
/* globals chrome */

function injectScript(url) {
  const script = document.createElement('script')

  return new Promise((resolve, reject) => {
    script.onerror = reject

    window.addEventListener(
      'message',
      ({ data }) => {
        if (!data.wappalyzerAntenna) return

        resolve()
      },
      { once: true }
    )

    script.setAttribute('src', chrome.runtime.getURL(url))

    document.head.appendChild(script)
  })
}

const AntennaContent = {
  async init() {
    await injectScript('js/antenna.js')
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
}

document.addEventListener('DOMContentLoaded', AntennaContent.init, {
  once: true,
})
