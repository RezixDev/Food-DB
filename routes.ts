import { getUserById } from './userRepository';

export async function getUser(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id') || '');
  const user = await getUserById(id);

  if (user) {
    return new Response(JSON.stringify(user), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } else {
    return new Response('User not found', { status: 404 });
  }
}
