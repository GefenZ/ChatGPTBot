import say from 'say'
import fs from 'fs'
import { delay, removeFile } from './common.js';
import { exec } from 'child_process'

export async function getMp3FromText(text, messageId){
	let audioFilePath = `audios/${messageId}.mp3`;
	let textFilePath = `texts/${messageId}.txt`;

	fs.writeFile(textFilePath, text, (err) => {
		let command = `espeak -v english -w ${audioFilePath} -f ${textFilePath}`
		console.log(command)
		exec(command, (err, out, stderr) => {})
	})
	
	await delay(1000)
	removeFile(textFilePath)
    //say.export(text , "Cellos", 1, filePath, async (err) => {
        // make sure the file is indeed created:
    //    let isFileCreated = fs.existsSync(filePath)
    //    while(!isFileCreated){
    //        console.log("waiting for file to be created...")
    //        await delay(2000)
    //        isFileCreated = fs.existsSync(filePath)
    //    }
        
    //    console.log(`created mp3 at ${filePath}`);
    //});
}
