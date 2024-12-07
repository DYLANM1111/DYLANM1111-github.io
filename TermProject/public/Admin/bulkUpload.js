document.getElementById('bulkUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submission triggered');
    
    // Get the file input and the selected file
    const fileInput = document.getElementById('myFile');
    const file = fileInput.files[0];
    console.log('Selected file:', file);
    
    // Check if file is selected
    if (!file) {
        alert('No file selected. Please choose a JSON file.');
        console.error('No file selected.');
        return;
    }
    
    // Validate the file type
    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Invalid file type. Please upload a JSON file.');
        console.error('Invalid file type:', file.name);
        return;
    }
    
    // Disable the submit button and show uploading status
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Uploading...';
    
    try {
        // Read the JSON file content
        const data = await readFile(file);
        console.log('File read successfully:', data);
        
        // If the JSON data is valid, proceed with the upload
        if (data && typeof data === 'object') {
            console.log('Preparing to upload data to the server...');
            await uploadBulkData(data);
            alert('Upload successful!');
        } else {
            alert('The uploaded file contains invalid or empty JSON.');
            console.error('Invalid or empty JSON data:', data);
        }
    } catch (error) {
        console.error('Error during file processing or upload:', error.message);
        alert(`Upload failed: ${error.message}`);
    } finally {
        // Re-enable the submit button and reset its text
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});

// Function to read the file content and parse it as JSON
async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                resolve(jsonData); // Resolve with the parsed JSON data
            } catch (parseError) {
                reject(new Error('Invalid JSON file: ' + parseError.message));
            }
        };
        
        reader.onerror = () => reject(new Error('Error reading the file.'));
        reader.readAsText(file); // Read the file as text
    });
}

// Function to upload the parsed JSON data to the server
async function uploadBulkData(data) {
    try {
        const response = await fetch('/api/bulk-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // Send the JSON data as the request body
        });

        if (!response.ok) {
            console.error('Error response from server:', await response.text());
            throw new Error(await response.text());
        }

        return response.json(); // Return the response from the server (if any)
    } catch (error) {
        console.error('Error during upload:', error);
        throw new Error('Server upload failed: ' + error.message);
    }
}
