import { ChatGPTAPI } from 'chatgpt'
import { chat_gpt_key } from '../secret.js';

const api = new ChatGPTAPI({
    apiKey: chat_gpt_key
  })

export async function getChatGPTResponse(message){
    let response = await api.sendMessage(message).catch(err => {
    	console.error(`unable to get chatGPT response for messsage - ${message}`);
	console.error(err);
	throw new Error();
    })
    return response.text;
}
