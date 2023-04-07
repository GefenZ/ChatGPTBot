import fs from 'fs'

export const delay = ms => new Promise(res => setTimeout(res, ms));

export function removeFile(filePath){
  if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)
  }
}
