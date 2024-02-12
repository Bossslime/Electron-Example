const { contextBridge, ipcRenderer } = require('electron/renderer')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld('electronAPI', {
    /* Send data over a given channel. Made this function like this to emulate */
    /* the syntax of socket.io because I like it */
    emit: (channel, data) => {
        ipcRenderer.send(channel, data)
    },

    /* Listen for data on a given channel. Made this function like this to emulate */
    /* the syntax of socket.io because I like it */
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
})