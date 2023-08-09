# azure-forms-submission
Please note that to run this application, you'll need to have Node.js installed and an Azure Form Recognizer API subscription with access to the Document Analyzer service. Additionally, you should have the @azure/identity, @azure/ai-form-recognizer, and fs packages installed in your project. You can install them using npm:

npm install @azure/identity @azure/ai-form-recognizer fs

Remember to replace the YOUR_FORM_RECOGNIZER_ENDPOINT and YOUR_CUSTOM_MODEL_ID with your actual Form Recognizer endpoint and custom model ID if applicable.

Please make sure you have your Azure Form Recognizer subscription keys or authentication properly configured to ensure the application can access the service successfully. 

## Execution

node app.js "path/to/image/directory"

It will read all the JPG files in the specified directory, extract tables from each image, and save the extracted tables as CSV files with the same prefix names as their corresponding JPG files. For example, if the original JPG file is named "example.jpg," the CSV file with the extracted table will be saved as "example.csv" in the extracted_tables folder.
