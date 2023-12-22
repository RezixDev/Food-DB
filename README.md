# Poradnik Bun

Czym jest Bun?

Środowiskiem wykonawczym dla JavaScriptu (Runtime).

Jakie istnieją jeszcze inne środowiska wykonawcze?

- Node.js
- Deno

Jakie są plusy Buna?

- Szybka kompilacja
- Wbudowany Serwer HTTP
- Zintegrowane Zarządzanie Pakietami (kompatybilny z npm)
- Wysoka wydajność (korzysta z Rusta i Ziga)

Jak zainstalować: Bun.js

Według oficjalnej dokumentacji (https://bun.sh/) wpisując w terminalu:
"curl -fsSL https://bun.sh/install | bash"

W przypadku używania Windowsa wymagane będzie użycie WSL2 ( Windows Subsystem for Linux)

# Stwórz swój pierwszy projekt

**Kroki:**

1. **Utwórz Nowy Katalog:** `mkdir projekt-bun && cd projekt-bun`
2. **Inicjalizacja Projektu:** `bun init`
3. **Tworzenie Pliku:** Utwórz plik, np. `index.js` i dodaj prosty kod JavaScript, np. `console.log('Hello, Bun!');`
4. **Uruchomienie Skryptu:** `bun run index.js`

**Importowanie Modułów:**

- Bun wspiera importowanie modułów z NPM bezpośrednio.
- Przykład: `import express from 'express';`

https://bun.sh/guides/ecosystem/express

Bun można podobnie używać jak Node.js:

```
import express from "express";

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
```

Ale jako, że Bun, ma w sobie wbudowany Serwer HTTP, to możemy ten krok pominąć
https://bun.sh/docs/api/http

Ten sam kod używając Bun.serve można byłoby napisać tak:

```
const port = 8080;

Bun.serve({
  fetch(req) {
    // Obsługa żądania GET dla ścieżki "/"
    if (req.method === 'GET' && new URL(req.url).pathname === '/') {
      return new Response('Hello World!');
    }
    // Domyślna odpowiedź dla nieobsługiwanego Routingu
    return new Response('Not Found', { status: 404 });
  },
  port: port,
});

console.log(`Listening on port ${port}...`);

```

Jeżeli nie zdefiniujemy Portu, to standardowym portem będzie :3000

Oznacza to, że odpalimy naszą aplikację na http://localhost:3000/

# Prosty Routing

Możemy sobie dodać nowy url /json

```
Bun.serve({
  fetch(request: Request)) {
    const url = new URL(request.url);

    switch(url.pathname) {
      case "/json":
        return new Response(JSON.stringify({ message: "Hello, JSON!" }), {
          headers: { "Content-Type": "application/json" },
        });

      default:
        return new Response("Hello World from Bun!");
    }
  },
});

```

Aby oczyścić nasz plik index.ts tworzymy sobie nowy plik o nazwie routes.ts

```
export function getHome(request: Request): Response {
  return new Response("Welcome to the Bun App!");
}

export function getJson(request: Request): Response {
  const data = { message: "This is a JSON response" };
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}

```

I modyfikujemy odpowiednio nasz plik index.ts:

```
import { getHome, getJson } from "./routes";

Bun.serve({
  fetch(request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/":
        return getHome(request);
      case "/json":
        return getJson(request);
      default:
        return new Response("Not Found", { status: 404 });
    }
  },
});

```

Co możemy dalej zrobić z tą wiedzą?
Zainstalować postgresa i stworzyć prostego calla.

# Postgres

Ja sam zainstalowałem go na Macu ale istnieje również klient Windowsa:
https://www.postgresql.org/download/

### Windows

1. **Pobierz Instalator:** Odwiedź oficjalną stronę [PostgreSQL](https://www.postgresql.org/download/windows/) i pobierz instalator dla Windows.
2. **Uruchom Instalator:** Kliknij dwukrotnie pobrany plik i postępuj zgodnie z instrukcjami instalatora. W trakcie instalacji zostaniesz poproszony o ustawienie hasła dla użytkownika `postgres`, który jest domyślnym superużytkownikiem.
3. **Konfiguracja Ścieżki:** Upewnij się, że ścieżka do PostgreSQL (zazwyczaj `C:\Program Files\PostgreSQL\<wersja>\bin`) została dodana do zmiennej środowiskowej `PATH`.
4. **Uruchomienie i Testowanie:** Po zainstalowaniu PostgreSQL możesz uruchomić polecenie `psql` w wierszu poleceń, aby połączyć się z lokalnym serwerem baz danych

jak mamy działającego postgresa to możemy stworzyć naszą bazę danych
i użyć paczki "pg"

```
bun add pg
```

Jak będziecie w Konsoli psql to odpalacie:

```
CREATE DATABASE twoja_baza_danych;
```

To stworzy wam bazę danych z wybraną przez was nazwą.

Żeby sprawdzić czy wasza baza danych została utworzona piszecie:

```
\l
```

To wylistuje wam wszystkie utworzone bazy danych.

Aby połączyć się z waszą bazą danych używacie:

```
\c twoja_baza_danych
```

Stwórzmy sobie przykładową tabelkę z użytkownikami o nazwie "users"

```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Jak chcecie zobaczyć wszystkie istniejące tabelki w waszej bazie to piszecie w konsoli:

```
\dt
```

A jak chcecie więcej informacji o danej tabelce to używacie tego polecenia:

```
\d users
```

Stwórz w głównym folderze aplikacji plik o nazwie: "database.ts"
Ten plik będzie odpowiedzialny za konfigurację naszego połączenie z bazą danych:

```
import { Client } from "pg";

const client = new Client({
  user: 'twoja_nazwa_użytkownika',
  host: 'localhost',
  database: 'twoja_baza_danych',
  password: 'twoje_hasło',
  port: 5432,
});

await client.connect();
```

Alternatywą by było użycie zamiast Client(), new Pool() ale w przypadku pojedynczych połączeń Client() nam wystarczy.

Potem tworzymy przykładowy Model dla naszego użytkownika składający się z id, nazwy użytkownika, adresu e-mail i hasła.

```
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
}
```

Teraz potrzebujemy jakiegoś calla (wezwania) do bazy danych, które nam te dane odbierze.

Tworzymy plik o nazwie userRepository.ts

```
import pool from './database';
import { User } from './models';

export async function getUserById(id: number): Promise<User | null> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}
```

Modyfikujemy również nasz plik ze ścieżkami routes.ts:

```
import { getUserById } from './userRepository';

export async function getUser(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id') || '');
  const user = await getUserById(id);

  if (user) {
    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" }
    });
  } else {
    return new Response("User not found", { status: 404 });
  }
}
```

Na tym etapie prawdopodobnie zacznie Visual Studio wam wywalać błędy z typami od postgresa.

Dodanie tej paczki powinien rozwiązać ten problem:

```
bun add @types/pg
```

Jeżeli chcecie mieć pokazane informacje o wszystkich użytkownikach to może wam się przydać ta funkcja w pliku userRepository.ts

```
export async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}
```

Aby wykorzystać tą funkcję i dostać wszystkich użytkowników znajdujących się w bazie musimy rozwinąć nasz plik index.ts o dodatkowego case:

```
...
    const url = new URL(request.url);

    switch (url.pathname) {
...

      case "/users":
        return getUsers().then(users =>
          new Response(JSON.stringify(users), {
            headers: { "Content-Type": "application/json" }
          })
        ).catch(err =>
	        new Response(`Error: ${err.message}`, { status: 500 })
	    );

      // ... reszta ścieżek

```

Dobra, skoro mamy odbieranie informacji skończone to teraz czas na tworzenie informacji.
Bo w sumie ciężko coś odebrać, jak nic w bazie nie ma.

Tworzycie sobie tą Insert funkcję addUser(user: User) w pliku userRepository.ts

```
export async function addUser(user: User) {
  const { username, email } = user;
  const query = `
    INSERT INTO users (username, email)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [username, email];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

i rozwijacie o kolejnego Endpointa w pliku index.ts

```

import { getHome, getJson } from './routes'';
import { getUsers, addUser } from './userRepository';

Bun.serve({
  fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      // ... inne ścieżki

      case '/add-user':
        if (request.method === 'POST') {
          return request.json().then(userData => {
            return addUser(userData).then(
              newUser => new Response(JSON.stringify(newUser), {
                headers: { 'Content-Type': 'application/json' },
              }),
              err => new Response(`Error: ${err.message}`, { status: 500 })
            );
          }).catch(
	          (err) =>
				new Response(`Invalid request data: ${err.message}`, {
					status: 400,
				})
			);
		} else {
			return new Response('Method Not Allowed', { status: 405 });
		}
	     // ... inne ścieżki

      default:
        return new Response('Not Found', { status: 404 });
    }
  },
});
```

A teraz testujecie waszego Endpointa.

Jak macie odpalony serwer to piszecie w innym oknie terminala:

```
curl -X POST http://localhost:3000/add-user -H "Content-Type: application/json" -d '{"username": "testuser", "email": "testuser@example.com"}'
```

Aby sprawdzić, czy rzeczywiście dodano waszego użytkownika odpalacie:

```
http://localhost:3000/users
```

Dobra, dobra. Wszystko działa, ale ja nie chce wpisywać danych z Terminala. Ja chce mieć Input Fieldsy, Chce wpisać coś w przeglądarkę, a nie bawić się w jakieś tam komendy konsolowe.

Dobra, to teraz czas na Frontend.

# Frontend

Tworzycie sobie nowy folder o nazwie "public", a w nim plik o nazwie index.html, który zawiera ten kod HTML:

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Add User</title>
  </head>
  <body>
    <form id="addUserForm">
      <input type="text" id="username" placeholder="Username" required />
      <input type="email" id="email" placeholder="Email" required />
      <button type="submit">Add User</button>
    </form>

    <div id="userList">
      <h2>Current Users:</h2>
      <ul id="users"></ul>
    </div>

    <script src="/js/app.js"></script>
  </body>
</html>

```

W folderze public, tworzymy nowy plik o nazwie app.js

```
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
        li.textContent = `${user.username} (${user.email})`;
        userList.appendChild(li);
      });
    })
    .catch((error) => console.error('Error:', error));
}

// wezwanie funkcji fetchUsers aby załadować users (użytkowników) kiedy strona zostanie załadowana
window.onload = fetchUsers;

```

Posiada ona dwie funkcje.

Pierwsza to "submit" call, aby zapisać nasze dane w bazie danych, a druga to fetchUsers(), aby załadować aktualnie istniejących użytkowników w bazie danych.

Musimy dla naszego pliku app.js określić też ścieżkę, gdzie się ten nasz plik znajduje. Piszemy do tego nowego case w naszym pliku index.ts

```
 case '/js/app.js':
        return readFile('public/js/app.js', 'utf8')
          .then(
            (fileContents) =>
              new Response(fileContents, {
                headers: { 'Content-Type': 'application/javascript' },
              })
          )
          .catch(
            (err) => new Response(`Error: ${err.message}`, { status: 500 })
          );
```

Jeżeli odpalicie waszą apkę na localhoście i wpiszecie nazwę użytkownika oraz E-Mail, to powinni oni zostać dodani do waszej bazy danych.

Żeby zobaczyć, czy rzeczywiście użytkownicy zostali dodani, będziecie musieli odświeżyć stronę. Jeżeli wszystko zrobiliście poprawnie, to powinna się pojawić nowa linijka z waszymi wpisanymi danymi.

To byłoby tyle poradnika o Bunie.

Na podstawie tego kodu, możecie dodać kolejne funkcjonalności i dalej rozwinąć waszą aplikację.

Mam nadzieję, że się czegoś nauczyliście no i powodzenia w programowaniu :)
# bun-example-server
