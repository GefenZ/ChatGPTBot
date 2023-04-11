import axios from 'axios'
import { delay } from './common.js';
import { assembly_token } from '../secret.js';
import config from '../config.json' assert { type: "json" };

const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: assembly_token,
    },
});

export async function getTextFromMp3(media){
    let upload_res = await assembly.post("/upload", media).catch(err => {
    	console.error("unable to post media");
	console.error(err);
	throw new Error();
    });
    console.log(`upload url - ${upload_res.data.upload_url}`);
    let transcript_res = await assembly.post("/transcript", {
        audio_url: upload_res.data.upload_url
    }).catch(err => {
    	console.error("unable to get transcription");
	console.error(err)
	throw new Error();
    });
    console.log(`trnascript id - ${transcript_res.data.id}`);
    let status = '';
    while(status != 'completed'){
        var resp = await assembly.get(`/transcript/${transcript_res.data.id}`).catch(err => {
		console.error("error while trying to get transcription result");
		console.error(err);
		throw new Error();
	});
        status = resp.data.status;
        console.log(status);
        await delay(config.default_delay_time);
    }
    return resp.data.text;
}
