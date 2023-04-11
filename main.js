import venom from 'venom-bot'
import fs from 'fs'
import getMP3Duration from 'get-mp3-duration'
import { getChatGPTResponse } from './modules/chatgpt.js'
import { getTextFromMp3 } from './modules/speach2text.js'
import { getMp3FromText } from './modules/text2speach.js'
import { removeFile, delay } from './modules/common.js';
import config from './config.json' assert { type: "json" };
import * as constants from './const.js'

var messagesToIgnore = [];

// function base64_encode(file) {
//   return "data:audio/mpeg;base64,"+fs.readFileSync(file, 'base64');
// }

venom.create({
    session: config.session_name, //name of session 
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then(async (client) => await start(client))
  .catch((erro) => {
    console.log(erro);
  });

async function start(client) {
  await client.onAnyMessage(async (message) => {
    let result;
    let shouldQuit = false;
    if(message.chatId == config.chatGPT_chat_id){
      console.log(message)

      let messageText;
      if(messagesToIgnore.includes(message.id)){
        let index = messagesToIgnore.indexOf(message.id);
        messagesToIgnore.splice(index, 1);
        return;
      }

      if(message.type === constants.VOICE_MESSAGE_TYPE){
        let media = await client.decryptFile(message);
      
        messageText = await getTextFromMp3(media).catch(err => {
		shouldQuit = true;
	});
  	if(shouldQuit) return;
        console.log(messageText)
  
        result = await client.sendText(config.chatGPT_chat_id, `${config.transcripton_message_header}: ${messageText}`).catch(err => {
	console.error(`unable to send message - ${messageText} to ${config.chatGPT_chat_id}`);
	console.error(err);
	shouldQuit = true;
	})
	if(shouldQuit) return;
        messagesToIgnore.push(result.to._serialized)
      }
      else if(message.type === constants.TEXT_MESSAGE_TYPE){
        messageText = message.content
      }
      else return;

      let api_res = await getChatGPTResponse(messageText).catch(err => {
      	shouldQuit = true;
      });
      if(shouldQuit) return;
      result = await client.sendText(config.chatGPT_chat_id, `${config.chatGPT_message_header}: ${api_res}`).catch(err => {
        console.error(`unable to send message - ${api_res} to ${config.chatGPT_chat_id}`);
	console.error(err)
	shouldQuit = true;
        })
	if(shouldQuit) return;
      messagesToIgnore.push(result.to._serialized);

      const filePath = `./audios/${message.id}.mp3`;
      
      await getMp3FromText(api_res, message.id).catch(err => {
      	console.error("could not get mp3 from text");
	shouldQuit = true;
      });
      if(shouldQuit) return;

      // make sure the file is indeed created:
      let isFileCreated = fs.existsSync(filePath)
      while(!isFileCreated){
          console.log("waiting for file to be created...")
          await delay(config.default_delay_time)
          isFileCreated = fs.existsSync(filePath)
      }

      const buffer = fs.readFileSync(filePath);
      const duration = getMP3Duration(buffer);
      console.log(`file duration ${duration}`);

      if(duration > config.limit_voice_message_answer) {
        result = await client.sendVoice(config.chatGPT_chat_id, config.default_voice_answer_path);
        messagesToIgnore.push(result.to._serialized)
        return;
      }
      // making sure the voice message is sent.
      let isVoiceSent = false;
      while(!isVoiceSent){
        isVoiceSent = true;
        // let base64str = base64_encode('test.mp3')
        await delay(config.default_delay_time);
        result = await client.sendVoice(config.chatGPT_chat_id, filePath).catch(error => {
          console.error("could not send voice message:")
          console.error(error)
          isVoiceSent = false
        });
      }
      
      messagesToIgnore.push(result.to._serialized)

      removeFile(filePath);
    }
  });
}
