document
  .getElementById('dataForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();

    const jsonData = document.getElementById('jsonData').value;
    try {
      const data = JSON.parse(jsonData);
      // Add validation here if necessary

      const response = await fetch('http://localhost:3000/insert-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Success:', responseData);
      alert('Data inserted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to insert data: ${error.message}`);
    }
  });
