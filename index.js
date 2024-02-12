const { app, BrowserWindow, ipcMain, Notification }   = require('electron');
const path                                            = require('node:path');
let win;

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('--no-sandbox');
app.disableHardwareAcceleration();

const createWindow = () => {
    win = new BrowserWindow({
        // width: 800, //Width of initial window
        // height: 600, //Height of initial window
        //frame: false, //Disable the toolbar
        //kiosk: true, //Fullscreen no toolbar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // spellcheck: true, //Enable spellcheck
            //nodeIntegration: false //Lets you use node.js in the renderer (On the UI)
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    //The packet can be changed to anything like in Socket.IO
    //e is some event information and msg is your packet
    ipcMain.on('packet', (e, msg) => {
        switch(msg.type) {
            case 'heartbeat':
                e.reply('packet', { type: 'heartbeat' });
                break;

            case 'notification':
                sendNotification(msg.data.title, msg.data.body);
                break;

            case 'progress_test':
                progressTest();
                break;
        }
    });


    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('Creating window');
        createWindow();
    }
});


//Close windows if user is not on MacOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//Example Functions
function sendNotification(title, body) {
    new Notification({ title: title, body: body }).show();
}


//Sends a progress bar to the taskbar
let interval;
let timeout;
function progressTest() {
    let progress = 0;

    clearTimeout(timeout);
    clearInterval(interval);
    interval = setInterval(() => {
        progress += 0.01;
        if(progress >= 1) {
            clearInterval(interval);

            //Clear the progress bar after 2.5 seconds
            timeout = setTimeout(() => {
                win.setProgressBar(0);
            }, 2500);
        }
        win.setProgressBar(progress);
    }, 10);
}