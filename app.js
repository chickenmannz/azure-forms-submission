const { DocumentAnalysisClient, DocumentModelAdministrationClient } = require("@azure/ai-form-recognizer");
const { DefaultAzureCredential } = require("@azure/identity");
const fs = require("fs");
const path = require("path");

// Azure Form Recognizer Configuration
const endpoint = "YOUR_FORM_RECOGNIZER_ENDPOINT";
const modelId = "YOUR_CUSTOM_MODEL_ID"; // Optional: If you have a custom model, replace with your custom model ID

// Initialize Azure Form Recognizer client
const credential = new DefaultAzureCredential();
const documentAnalysisClient = new DocumentAnalysisClient(endpoint, credential);
const modelClient = new DocumentModelAdministrationClient(endpoint, credential);

// Main function to analyze and extract tables
async function extractTablesFromImages(directoryPath) {
  try {
    // Create a new model if modelId is not provided (optional if you have a custom model)
    if (!modelId) {
      const model = await modelClient.createComposedModel({ modelIds: ["prebuilt-document"] });
      modelId = model.modelId;
    }

    const csvFolderPath = "./extracted_tables";
    if (!fs.existsSync(csvFolderPath)) {
      fs.mkdirSync(csvFolderPath);
    }

    // Read the files in the specified directory
    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        console.error("Error reading directory:", err.message);
        return;
      }

      // Filter JPG images
      const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === ".jpg");

      // Process each image
      for (let i = 0; i < jpgFiles.length; i++) {
        const jpgFileName = jpgFiles[i];
        const imagePath = path.join(directoryPath, jpgFileName);
        const imageBuffer = fs.readFileSync(imagePath);

        // Analyze the document
        const poller = await documentAnalysisClient.beginAnalyzeDocument(
          modelId,
          imageBuffer,
          { contentType: "image/jpeg" }
        );

        // Wait for the result
        const { pages } = await poller.pollUntilDone();

        // Extract tables from the pages
        const tables = [];
        for (const page of pages) {
          for (const table of page.tables) {
            const tableData = table.rows.map(row => row.cells.map(cell => cell.text).join(",")).join("\n");
            tables.push(tableData);
          }
        }

        // Save the extracted table data as a CSV file with the same prefix as the JPG file
        const csvFileName = `${path.parse(jpgFileName).name}.csv`;
        const csvFilePath = path.join(csvFolderPath, csvFileName);
        fs.writeFileSync(csvFilePath, tables.join("\n"));
        console.log(`Extracted table from ${imagePath} and saved as ${csvFileName}`);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Usage: node app.js "path/to/image/directory"
const directoryPath = process.argv[2];
if (!directoryPath) {
  console.error("Please provide the path to the image directory.");
} else {
  extractTablesFromImages(directoryPath);
}
