const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const { app } = require('electron');
const unusedFilename = require('unused-filename');
const { download } = require('electron-dl');
const path = require('path');
const mailboxWindow = require('../windows/mailbox');
const { installUpdate, checkForUpdates } = require('./../updater');
const { showNotification } = require('./../notificationManager');
const myAccount = require('./../Account');
const socketClient = require('./../socketClient');
const { printEmailOrThread } = require('./../utils/PrintUtils');
const { buildEmailSource } = require('../utils/SourceUtils');
const {
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists
} = require('../utils/FileUtils');
const { getUsername, genUUID } = require('./../utils/stringUtils');
const { showWindows } = require('./../windows/windowUtils');
const { checkAlive } = require('./../reachabilityTask');
const { restartAlice, closeAlice } = require('./../aliceManager');

ipc.answerRenderer('close-mailbox', () => {
  mailboxWindow.close();
});

ipc.answerRenderer('install-update', () => {
  installUpdate();
});

ipc.answerRenderer('logout-app', () => {
  closeAlice();
  app.relaunch();
  app.exit(0);
});

ipc.answerRenderer('maximize-mailbox', () => {
  mailboxWindow.toggleMaximize();
});

ipc.answerRenderer('minimize-mailbox', () => {
  mailboxWindow.minimize();
});

ipc.answerRenderer('open-file-explorer', filename => {
  mailboxWindow.showFileExplorer(filename);
});

ipc.answerRenderer('open-mailbox', ({ firstOpenApp }) => {
  socketClient.add(myAccount.getDataForSocket());
  mailboxWindow.show({ firstOpenApp });
});

ipc.answerRenderer('swap-account', ({ accountId, recipientId }) => {
  socketClient.add(myAccount.getDataForSocket());
  mailboxWindow.send('swap-account', { accountId, recipientId });
  mailboxWindow.show({});
});

ipc.answerRenderer('print-to-pdf', async ({ emailId, threadId }) => {
  await printEmailOrThread({ emailId, threadId });
});

ipc.answerRenderer('open-email-source', async ({ key, accountId }) => {
  await buildEmailSource({ key, accountId });
});

ipc.answerRenderer(
  'fs-download-file',
  async ({ url, filename, downloadType, metadataKey }) => {
    const isInlineImage = downloadType === 'inline';
    try {
      const directory = await defineDownloadDirectory({
        downloadType,
        metadataKey
      });
      const filePath = path.join(directory, filename);
      if (!isInlineImage) {
        filename = path.basename(unusedFilename.sync(filePath));
      }
      const downloadedItem = await download(mailboxWindow.getWindow(), url, {
        directory,
        filename
      });
      const newFilePath = downloadedItem.getSavePath();
      return { filePath: newFilePath, filename };
    } catch (e) {
      if (!isInlineImage) {
        mailboxWindow.send('display-message-error-download');
        return {};
      }
    }
    if (!isInlineImage) mailboxWindow.showFileExplorer(filename);
  }
);

const defineDownloadDirectory = async ({ downloadType, metadataKey }) => {
  if (downloadType === 'inline') {
    const username = getUsername();
    const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
    const emailPath = `${myPath}/${metadataKey}`;
    await createIfNotExist(emailPath);
    return emailPath;
  }
  return app.getPath('downloads');
};

ipc.answerRenderer(
  'fs-check-file-downloaded',
  async ({ filename, metadataKey, type }) => {
    const directory = await defineDownloadDirectory({
      downloadType: type,
      metadataKey
    });
    const filePath = path.join(directory, filename);
    return checkIfExists(filePath) ? filePath : null;
  }
);

ipc.answerRenderer(
  'show-notification',
  ({ title, message, threadId, accountId, accountRecipientId }) => {
    const onClickNotification = () => {
      showWindows();
      if (threadId) {
        if (accountRecipientId === myAccount.recipientId) {
          mailboxWindow.send('open-thread-by-notification', { threadId });
        } else {
          mailboxWindow.send('swap-account', {
            accountId,
            recipientId: accountRecipientId,
            threadId
          });
        }
      }
    };
    showNotification({ title, message, clickHandler: onClickNotification });
  }
);

ipc.answerRenderer('check-for-updates', showDialog => {
  checkForUpdates(showDialog);
});

ipc.answerRenderer('generate-label-uuid', genUUID);

ipc.answerRenderer('restart-connection', () => {
  socketClient.restartSocket();
  checkAlive(true);
});

ipc.answerRenderer('restart-alice', restartAlice);
