import say from 'say'
import fs from 'fs'
import { delay } from './common.js';

export async function getMp3FromText(text, filePath){
    say.export(text , "Cellos", 1, filePath, async (err) => {
        // make sure the file is indeed created:
        let isFileCreated = fs.existsSync(filePath)
        while(!isFileCreated){
            console.log("waiting for file to be created...")
            await delay(2000)
            isFileCreated = fs.existsSync(filePath)
        }
        
        console.log(`created mp3 at ${filePath}`);
    });
}