function uploadImage() {
    const input = document.getElementById('imageUpload').files[0];
    if (input) {
        const reader = new FileReader();
        reader.readAsDataURL(input);
        reader.onload = () => {
            const imageData = reader.result.replace(/^data:image\/(png|jpeg);base64,/, '');

            fetch(`https://vision.googleapis.com/v1/images:annotate?key=82b7a546e0a7d21dc28991401cf98564ad25aca6`, {
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
                if (annotations.length > 0) {
                    resultsDiv.innerHTML = `<pre>${annotations[0].description}</pre>`;
                } else {
                    resultsDiv.innerHTML = 'No text found.';
                }
            })
            .catch(error => console.error('Error:', error));
        };
    } else {
        alert('Please select an image.');
    }
}
