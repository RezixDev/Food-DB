function fetchData() {
  fetch('http://localhost:3000/get-all-data')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        displayData(data);
      } else {
        throw new Error('Data is not in expected format');
      }
    })
    .catch((error) => console.error('Error:', error));
}
function displayData(data) {
  console.log(data);
  const container = document.getElementById('dataContainer');
  container.innerHTML = ''; // Clear existing content

  // Create table
  const table = document.createElement('table');
  table.className = 'food-table';

  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
  <tr>
    <th>Food Name</th>
    <th>Serving Size</th>
    <th>Calories</th>
    <th>Nutrients</th>
    <th>Usage Tips</th>
    <th>Common Uses</th>
    <th>Glycemic Index</th>
    <th>Organic</th>
    <th>Allergens</th>
    <th>Environmental Impact</th>
    <th>Actions</th>
  </tr>
`;

  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');

  data.forEach((item) => {
    const row = document.createElement('tr');

    // Basic information that is always visible
    row.innerHTML = `
      <td>${item.name} (${item.category})</td>
      <td>${item.serving_size}</td>
      <td>${item.calories}</td>
      <td>${formatNutrients(item.nutrients)}</td>
      <td>${formatList(item.usageTips)}</td>
      <td>${formatList(item.commonUses)}</td>
      <td>${item.glycemicIndex}</td>
      <td>${item.organic ? 'Yes' : 'No'}</td>
      <td>${item.allergens}</td>
      <td>${item.environmental_impact}</td>
    `;

    // Delete button
    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteFood(item.food_id));
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    tbody.appendChild(row);

    // Additional information initially hidden
    const hiddenInfo = document.createElement('tr');
    hiddenInfo.className = 'hidden-row';
    hiddenInfo.style.display = 'none'; // Hide initially
    hiddenInfo.innerHTML = `
      <td colspan="10">
        <strong>Varieties:</strong> ${formatList(item.varieties)}<br>
        <strong>Description:</strong> ${item.description}<br>
        <strong>Cultural Significance:</strong> ${
          item.cultural_significance
        }<br>
        <strong>Health Benefits:</strong> ${formatList(
          item.health_benefits
        )}<br>
        <strong>Storage Tips:</strong> ${formatList(item.storage_tips)}<br>
        <strong>Image:</strong> <a href="${
          item.image_reference
        }" target="_blank">View Image</a><br>
        <strong>Pairings:</strong> ${formatList(item.pairings)}<br>
        <strong>Seasonality:</strong> ${formatList(item.seasonality)}<br>
        <strong>History:</strong> ${item.history}<br>
        <strong>Pesticides Info:</strong> ${item.pesticides_info}<br>
        <strong>Botanical Information:</strong> ${formatBotanicalInfo(
          item.botanical_information
        )}
      </td>
    `;

    // Toggle button
    const toggleCell = document.createElement('td');
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Details';
    toggleButton.addEventListener('click', () => {
      hiddenInfo.style.display =
        hiddenInfo.style.display === 'none' ? '' : 'none';
    });
    toggleCell.appendChild(toggleButton);
    row.appendChild(toggleCell);

    tbody.appendChild(hiddenInfo);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

function formatBotanicalInfo(botanicalInfo) {
  // Ensure botanicalInfo is an array
  botanicalInfo = botanicalInfo || [];
  return botanicalInfo
    .map(
      (info) =>
        `Family: ${info.family}, Genus: ${info.genus}, Species: ${info.species}`
    )
    .join('<br>');
}

function formatList(items) {
  return items && items.length > 0
    ? `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
    : 'Not available';
}

function deleteFood(foodId) {
  fetch(`http://localhost:3000/delete-data/${foodId}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    .then(() => {
      alert('Food item deleted successfully');
      fetchData(); // Refetch the data to update the display
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Failed to delete item');
    });
}

function formatNutrients(nutrients) {
  if (nutrients && nutrients.length > 0) {
    return `<ul>${nutrients
      .map((n) => `<li>${n.nutrient_name}: ${n.amount} ${n.unit}</li>`)
      .join('')}</ul>`;
  }
  return 'Not available';
}

fetchData();
