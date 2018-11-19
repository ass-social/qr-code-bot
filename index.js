let fetch = require('node-fetch');

let config = require('./config');

let vk = new (require('vk-io').VK)({ token: config.TOKEN, pollingGroupId: config.POLLING_GROUP_ID });

vk.updates.startPolling();

vk.updates.on(['new_message', 'edit_message'], async (msg) => {
  if (msg.isOutbox) return;
  if (msg.text) {
    let bgcolor = '000';
    let color = 'fff';

    if (/\s*ч[еёо]рны[йи]?$/i.test(msg.text)) {
      bgcolor = 'fff';
      color = '000';
      msg.text = msg.text.replace(/\s*ч[еёо]рны[йи]?$/i, '');
    }

    let text = encodeURIComponent(msg.text);
    let buffer = await (await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${text}&margin=10&bgcolor=${bgcolor}&color=${color}&size=500x500`)).buffer();
    msg.sendPhoto(buffer);
  } else if (msg.attachments.length) {
    let url = last(msg.attachments).largePhoto;
    let [{ symbol: [{ data, error }] }] = await (await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${url}`)).json();
    
    if (error) return msg.send('Мы не смогли найти QR-код! &#128560;');
    msg.send(data);
  } else if (msg.forwards.length) {
    let url = last(last(msg.forwards.flatten).attachments).largePhoto;
    let [{ symbol: [{ data, error }] }] = await (await fetch(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${url}`)).json();
    
    if (error) return msg.send('Мы не смогли найти QR-код! &#128560;');
    msg.send(data);
  } else return;
});

function last(array) {
  return array[array.length - 1];
}
