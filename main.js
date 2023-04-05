import venom from 'venom-bot'
import fs from 'fs'
import getMP3Duration from 'get-mp3-duration'
import { getChatGPTResponse } from './modules/chatgpt.js'
import { getTextFromMp3 } from './modules/speach2text.js'
import { getMp3FromText } from './modules/text2speach.js'
import { removeFile, delay } from './modules/common.js';

var messagesToIgnore = [];

// import fs from 'fs'
// import getMP3Duration from 'get-mp3-duration'

// function base64_encode(file) {
//   return "data:audio/mpeg;base64,"+fs.readFileSync(file, 'base64');
// }

venom.create({
    session: 'chatGptSession', //name of session 
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then(async (client) => await start(client))
  .catch((erro) => {
    console.log(erro);
  });

async function start(client) {
  await client.onAnyMessage(async (message) => {
    let result;
    if(message.chatId == '120363099429046214@g.us'){
      console.log(message)

      let messageText;
      if(messagesToIgnore.includes(message.id)){
        let index = messagesToIgnore.indexOf(message.id);
        messagesToIgnore.splice(index, 1);
        return;
      }

      if(message.type === 'ptt'){
        let media = await client.decryptFile(message);
      
        messageText = await getTextFromMp3(media);
  
        console.log(messageText)
  
        result = await client.sendText('120363099429046214@g.us', `You asked: ${messageText}`);
        messagesToIgnore.push(result.to._serialized)
      }
      else if(message.type === 'chat'){
        messageText = message.content
      }
      else return;

      let api_res = await getChatGPTResponse(messageText);
      
      result = await client.sendText('120363099429046214@g.us', `ChatGPT Says: ${api_res}`);
      messagesToIgnore.push(result.to._serialized)

      const filePath = `./audios/${message.id}.mp3`;
      
      await getMp3FromText(api_res, filePath);
      
      // make sure the file is indeed created:
      let isFileCreated = fs.existsSync(filePath)
      while(!isFileCreated){
          console.log("waiting for file to be created...")
          await delay(2000)
          isFileCreated = fs.existsSync(filePath)
      }

      const buffer = fs.readFileSync(filePath);
      const duration = getMP3Duration(buffer);
      console.log(`file duration ${duration}`);

      if(duration > 60000) {
        result = await client.sendVoice('120363099429046214@g.us', "./audios/default.mp3");
        messagesToIgnore.push(result.to._serialized)
        return;
      }
      // making sure the voice message is sent.
      let isVoiceSent = false;
      while(!isVoiceSent){
        isVoiceSent = true;
        // let base64str = base64_encode('test.mp3')
        await delay(2000);
        result = await client.sendVoice('120363099429046214@g.us', filePath).catch(error => {
          console.log("could not send voice message:")
          console.log(error)
          isVoiceSent = false
        });
      }
      //result.to._serialized
      messagesToIgnore.push(result.to._serialized)

      removeFile(filePath);
    }
  });
}
