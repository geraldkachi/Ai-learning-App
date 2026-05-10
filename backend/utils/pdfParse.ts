import fs from "fs/promises"
import { PDFParse } from 'pdf-parse'

/**
 *  Extract text from PDF file
 *  @param {string} filePath - Path to PDF file
 *  @returns {Promise<{text: string, numPages: number}>}
 * 
*/

export const extractTextFromPDF = async (filePath: any) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // pdf-parse expects a Vint8Array
        // const parse = new PDFParse(new Uint8Array(dataBuffer))
        const parse = new PDFParse(new Uint8Array(dataBuffer))
        const data = await parse.getText();
        
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info
        }
    } catch (error) {
        console.error("PDF parsing errors: ", error)
        throw new Error("Failed to extract text from PDF")
    }
} 