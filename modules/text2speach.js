import say from 'say'
import fs from 'fs'
import { delay, removeFile } from './common.js'
import * as constants from '../const.js'
import config from '../config.json'
import { exec } from 'child_process'

export async function getMp3FromText(text, messageId){
	let audioFilePath = `audios/${messageId}.mp3`;
    if(process.platform === constants.WINDOWS){
        say.export(text , config.say_voice, config.say_speed, filePath, async (err) => {
            // make sure the file is indeed created:
           let isFileCreated = fs.existsSync(filePath)
           while(!isFileCreated){
               console.log("waiting for file to be created...")
               await delay(config.default_delay_time)
               isFileCreated = fs.existsSync(filePath)
           }
            
           console.log(`created mp3 at ${filePath}`);
        });
    }
    else if(process.platform === constants.LINUX){
                let textFilePath = `texts/${messageId}.txt`;

        fs.writeFile(textFilePath, text, (err) => {
            let command = `espeak -v ${config.espeak_voice} -w ${audioFilePath} -f ${textFilePath}`
            console.log(command)
            exec(command, (err, out, stderr) => {})
        })
        
        await delay(config.default_delay_time / 2)
        removeFile(textFilePath)
    }
}
