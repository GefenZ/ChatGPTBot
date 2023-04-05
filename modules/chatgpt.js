import { ChatGPTAPI } from 'chatgpt'

const api = new ChatGPTAPI({
    apiKey: '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'
  })

export async function getChatGPTResponse(message){
    let response = await api.sendMessage(message);
    return response.text;
}
