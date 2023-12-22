import { getUsers, addUser, deleteUser } from './userRepository';
import { readFile } from 'fs/promises';
import { insertFoodData, deleteFoodData } from './foodRepository';
import { getAllData } from './dataRepository';

Bun.serve({
  fetch: handleRequest,
});

type RouteHandler = (
  request: Request,
  url: URL,
  params: { [key: string]: string }
) => Promise<Response>;

type RouteParams = { [key: string]: string };

const STATIC_FILES: { [key: string]: string } = {
  '/': 'public/index.html',
  '/json-data-input': 'public/routes/json-data-input.html',
  '/json-data-input.js': 'public/js/json-data-input.js',
  '/read-data': 'public/routes/read-data-from-db.html',
  '/displayData.js': 'public/js/displayData.js',
  '/js/app.js': 'public/js/app.js',
} as const;

const DYNAMIC_HANDLERS: { [key: string]: RouteHandler } = {
  '/insert-data': handleInsertData,
  '/get-all-data': handleGetAllData,
  '/users': handleGetUsers,
  '/add-user': handleAddUser,
  '/delete-user': handleDeleteUser,
} as const;

const dynamicRoutePatterns: { [key: string]: RouteHandler } = {
  '/delete-data/:foodId': handleDeleteData,
};

async function handleRequest(request: Request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (path in STATIC_FILES) {
      const filePath = STATIC_FILES[path];
      const contentType = path.endsWith('.js')
        ? 'application/javascript'
        : 'text/html';
      return serveFile(filePath, contentType);
    }

    // Handle dynamic routes
    if (path in DYNAMIC_HANDLERS) {
      return DYNAMIC_HANDLERS[path](request, url, {});
    }

    for (const pattern in dynamicRoutePatterns) {
      const patternSegments = pattern.split('/').filter(Boolean);

      if (
        pathSegments.length === patternSegments.length &&
        patternSegments.every(
          (seg, i) => seg.startsWith(':') || seg === pathSegments[i]
        )
      ) {
        const params = patternSegments.reduce((acc: RouteParams, seg, i) => {
          if (seg.startsWith(':')) {
            acc[seg.substring(1)] = pathSegments[i];
          }
          return acc;
        }, {} as RouteParams);

        return dynamicRoutePatterns[pattern](request, url, params);
      }
    }
    return new Response('Not Found', { status: 404 });
  } catch (err: unknown) {
    return handleError(err);
  }
}

function handleError(err: unknown): Response {
  if (err instanceof Error) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  } else {
    return new Response(`Error: An unknown error occurred`, { status: 500 });
  }
}

async function serveFile(filePath: string, contentType: string) {
  const fileContents = await readFile(filePath, 'utf8');
  return new Response(fileContents, {
    headers: { 'Content-Type': contentType },
  });
}

async function handleInsertData(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const jsonData = await request.json();
    const result = await insertFoodData(jsonData);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      // JSON parsing error
      return new Response(`Invalid JSON data: ${err.message}`, {
        status: 400,
      });
    }

    return handleError(err);
  }
}

async function handleDeleteData(
  request: Request,
  url: URL,
  params: { [key: string]: string }
) {
  if (request.method === 'DELETE') {
    const url = new URL(request.url);
    const food_id = parseInt(params.foodId); // Assumes URL format is /delete-data/123

    if (isNaN(food_id)) {
      return new Response('Invalid ID', { status: 400 });
    }

    return deleteFoodData(food_id)
      .then(
        () =>
          new Response(
            JSON.stringify({ message: 'Food item deleted successfully' }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            }
          )
      )
      .catch((err: unknown) => handleError(err));
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleGetAllData() {
  return getAllData()
    .then(
      (data) =>
        new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        })
    )
    .catch((err) => new Response(`Error: ${err.message}`, { status: 500 }));
}

async function handleGetUsers() {
  return getUsers()
    .then(
      (users) =>
        new Response(JSON.stringify(users), {
          headers: { 'Content-Type': 'application/json' },
        })
    )
    .catch((err) => new Response(`Error: ${err.message}`, { status: 500 }));
}

async function handleAddUser(request: Request) {
  if (request.method === 'POST') {
    return request
      .json()
      .then((userData) => {
        return addUser(userData).then(
          (newUser) =>
            new Response(JSON.stringify(newUser), {
              headers: { 'Content-Type': 'application/json' },
            }),
          (err) =>
            new Response(`Error adding user: ${err.message}`, {
              status: 500,
            })
        );
      })
      .catch(
        (err) =>
          new Response(`Invalid request data: ${err.message}`, {
            status: 400,
          })
      );
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleDeleteUser(request: Request, url: URL) {
  if (request.method === 'DELETE') {
    const id = parseInt(url.pathname.split('/')[2]); // Assumes URL format is /delete-user/123
    return deleteUser(id).then(
      (success) =>
        success
          ? new Response('User deleted successfully')
          : new Response('User not found', { status: 404 }),
      (err) => new Response(`Error: ${err.message}`, { status: 500 })
    );
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}
