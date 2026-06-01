API documentation
EmmasonMutsaka/BreastCancer-Ai-Screening

API Recorder

1 API endpoint


Choose a language to see the code snippets for interacting with the API.

1. Install the javascript client (docs) if you don't already have it installed.

copy
$ npm i -D @gradio/client
2. Find the API endpoint below corresponding to your desired function in the app. Copy the code snippet, replacing the placeholder values with your own input data. If this is a private Space, you may need to pass your Hugging Face token as well (read more). Or use the 
API Recorder

 to automatically generate your API requests.

api_name: /run_inference
copy
import { Client } from "@gradio/client";

const response_0 = await fetch("https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png");
const exampleImage = await response_0.blob();
						
const client = await Client.connect("EmmasonMutsaka/BreastCancer-Ai-Screening");
const result = await client.predict("/run_inference", { 
				image: exampleImage, 		
		age: 18, 		
		symptom_dur: 0, 		
		fam_hist: "No", 		
		repro_hist: "Normal", 		
		query: "Hello!!", 
});

console.log(result.data);
Accepts 6 parameters:
image Blob | File | Buffer Required

The input value that is provided in the "Upload Histopathology Image (PNG/JPG)" Image component. For input, either path or url must be provided. For output, path is always provided.

age number Default: 45

The input value that is provided in the "Patient Age (years)" Slider component.

symptom_dur number Default: 4

The input value that is provided in the "Symptom Duration (weeks)" Slider component.

fam_hist string Default: "No"

The input value that is provided in the "Family History of Breast Cancer?" Dropdown component.

repro_hist string Default: "Normal"

The input value that is provided in the "Reproductive History" Dropdown component.

query string Default: "What are the recommended next steps for this patient?"

The input value that is provided in the "Clinical Query for Guideline Retrieval" Textbox component.

Returns list of 2 elements
[0] string

The output value that appears in the "Guideline-Grounded Clinical Decision Support Report" Textbox component.

[1] string

The output value that appears in the "Tissue Attention Map (Red = most influential region)" Image component.