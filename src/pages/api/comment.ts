import type { APIRoute } from 'astro'
import { Key } from '../../api/key'
import supabase from '~/api/supabase'

type Body = {
  user_name: string
  email: string
  content: string
}

const matchEmail =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const matchUsername = /-?[_a-zA-Z]+[_a-zA-Z0-9-]*/

const checkUserName = (input: string | undefined) => {
  if (!input) return false
  return /-?[_a-zA-Z]+[_a-zA-Z0-9-]*/.exec(input) && input.length <= 64
}

export const GET: APIRoute = async () => {
  try {
    const key = new Key()
    await key.init()
    // await key.expire()

    const payload = { key: key.key, isValid: key.isValid }

    return new Response(JSON.stringify(payload), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const matchJWT = /^Bearer ((?:\.?(?:[A-Za-z0-9-_]+)){3})$/m
    const match = request.headers.get('Authorization').match(matchJWT)

    if (!match) throw new Error('invalid authorization')

    const [, token] = match
    const payload = Key.verifyToken(token)
    console.log('payload', payload)

    // return new Response(JSON.stringify({}), { status: 200 })

    const key = await new Key().init(payload.key)

    if (!key.isValid) throw new Error('invalid key')

    const body: Body = await request.json()

    const commentData = { ...body, slug: payload.slug }

    // TODO email check in FE
    if (!commentData.slug) throw new Error('invalid path')
    if (matchEmail && !matchEmail.exec(commentData?.email))
      throw new Error('invalid email')
    if (!matchUsername.exec(commentData?.user_name))
      throw new Error('invalid username')
    if (commentData?.user_name.length >= 64) throw new Error('invalid username')

    const { error, data } = await supabase
      .from('Comments')
      .insert(commentData)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    const responseBody = data

    return new Response(JSON.stringify(responseBody), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 400,
    })
  }
}
