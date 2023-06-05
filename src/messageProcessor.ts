import * as dotenv from 'dotenv';
import axios, { AxiosResponse } from 'axios';
import * as vscode from 'vscode';

dotenv.config();

console.log(process.env);

interface Message {
    role: string;
    content: string;
}

interface RequestBody {
    model: string;
    messages: Message[];
    temperature: number;
}

function generatePrompt(input: string | undefined): string {
    let config = vscode.workspace.getConfiguration('parallelai');
    
    if (input) {
        let selectionPrompt: string | undefined = config.get('selectionPrompt');
        if (selectionPrompt){
            return selectionPrompt + "\n\n" + input;
        }else{
            return `Can you parallelize this code? Please provide the code: \n\n${input}`;
        }

    } else {
        let emptyPrompt: string | undefined = config.get('emptyPrompt');
        if (emptyPrompt){
            return emptyPrompt;
        }else{
            return "Provide some general tips for parallel programming.";
        }
    }
}

export async function processMessage(input: string | undefined, openaiApiKey: string | undefined): Promise<string> {
    let OPENAI_API_KEY: string;
    if (!openaiApiKey) {
        const message = `The API Key cannot be empty. https://platform.openai.com/account/api-keys`;

        throw new Error(message);
    }else{
        OPENAI_API_KEY =  openaiApiKey;
    }



    const data: RequestBody = {
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": generatePrompt(input)}],
        temperature: 0.7
    };

    try {
        const response: AxiosResponse = await axios({
            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            data: data
        });
        
        console.log(response.data);
        
        let output = response.data.choices[0].message.content;
        console.log(output);
        return response.data.choices[0].message.content;
    } catch (error) {
        if (axios.isAxiosError(error)){
            if (error.code === 'ERR_BAD_REQUEST') {
                return "ERROR: Bad Request. Please check your API Key. https://platform.openai.com/account/api-keys";
            }else if (error.code === 'ENOTFOUND'){
                return "ERROR: Internet connection not found.";
            }
        }
    
        

        return "UNEXPECTED ERROR";
            
    }
}
