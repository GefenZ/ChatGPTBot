import axios from 'axios'
import { delay } from './common.js';
import { assembly_token } from '../secret.js';

const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: assembly_token,
    },
});

export async function getTextFromMp3(media){
    let upload_res = await assembly.post("/upload", media);
    console.log(`upload url - ${upload_res.data.upload_url}`);
    let transcript_res = await assembly.post("/transcript", {
        audio_url: upload_res.data.upload_url
    });
    console.log(`trnascript id - ${transcript_res.data.id}`);
    let status = '';
    while(status != 'completed'){
        var resp = await assembly.get(`/transcript/${transcript_res.data.id}`);
        status = resp.data.status;
        console.log(status);
        await delay(2000);
    }
    return resp.data.text;
}