import type { APIRoute } from 'astro'
import { Key } from '../../api/key'
import supabase from '~/api/supabase'

type Body = {
  username: string
  email: string
  content: string
}

const matchEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const matchUsername = /[_a-zA-Z0-9-]*/

const matchJWT = /^Bearer ((?:\.?(?:[A-Za-z0-9-_]+)){3})$/m

export const POST: APIRoute = async ({ request }) => {
  try {
    const JWT = matchJWT.exec(request.headers.get('Authorization'))

    if (!JWT) throw new Error('invalid authorization')

    const [, token] = JWT
    const payload = Key.verifyToken(token)

    const key = await new Key().init(payload.key)

    if (!key.isValid) throw new Error('invalid key')

    const body: Body = await request.json()

    const commentData = { ...body, slug: payload.slug }

    if (!commentData.slug) throw new Error('invalid path')
    if (matchEmail && !matchEmail.exec(commentData?.email))
      throw new Error('invalid email')
    if (!matchUsername.exec(commentData?.username))
      throw new Error('invalid username')
    if (commentData?.username.length >= 64) throw new Error('invalid username')

    const { error, data } = await supabase
      .from('Comments')
      .insert(commentData)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    const responseBody = data
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error(err)

    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
