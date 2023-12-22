document
  .getElementById('addUserForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    fetch('http://localhost:3000/add-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ username, email }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  });

function fetchUsers() {
  fetch('http://localhost:3000/users')
    .then((response) => response.json())
    .then((data) => {
      const userList = document.getElementById('users');
      userList.innerHTML = ''; // Clear existing list
      data.forEach((user) => {
        const li = document.createElement('li');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.onclick = function () {
          deleteUser(user.id);
        };

        li.textContent = `${user.username} (${user.email})`;
        li.appendChild(deleteButton);
        userList.appendChild(li);
      });
    })
    .catch((error) => console.error('Error:', error));
}

function deleteUser(userId) {
  fetch(`http://localhost:3000/delete-user/${userId}`, {
    method: 'DELETE',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
    .then((response) => {
      if (response.ok) {
        fetchUsers(); // Refresh the user list
      } else {
        console.error('Delete failed');
      }
    })
    .catch((error) => console.error('Error:', error));
}

window.onload = fetchUsers;
