function uploadImage() {
    const input = document.getElementById('imageUpload').files[0];

    if (input) {
        const reader = new FileReader();

        reader.onload = () => {
            // Convert image to base64 and remove the prefix
            const imageData = reader.result.replace(/^data:image\/(png|jpeg);base64,/, '');

            // Make POST request to Google Vision API
            fetch(`https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDo8Sew3VrKJFR1TRlhl-jd0-m4TKxlrqM`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content: imageData },
                            features: [{ type: 'TEXT_DETECTION' }]
                        }
                    ]
                })
            })
            .then(response => response.json())
            .then(data => {
                const resultsDiv = document.getElementById('results');
                const annotations = data.responses[0].textAnnotations;

                if (annotations && annotations.length > 0) {
                    // Display the recognised text in the "results" div
                    resultsDiv.innerHTML = `<pre>${annotations[0].description}</pre>`;
                } else {
                    resultsDiv.innerHTML = 'No text found in the image.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const resultsDiv = document.getElementById('results');
                resultsDiv.innerHTML = 'Error processing image.';
            });
        };

        reader.readAsDataURL(input); // Read the uploaded image
    } else {
        alert('Please select an image.');
    }
}
