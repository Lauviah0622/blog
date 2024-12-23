import supabase from './supabase'
import jwt from 'jsonwebtoken'

const head = <T = any>(arr: T[]) => (arr?.[0] ? arr[0] : undefined)

const JWT_SECRET = import.meta.env.JWT_SECRET
const IS_DEV = import.meta.env.DEV


export class Key {
  #LIFETIME_MS = 1000 * 60 * 60 * 24 // a day
  #data
  async init(key?: string) {
    const { data, error } = key
      ? await supabase.from('Keys').select().eq('key', key)
      : await supabase.from('Keys').insert({}).select()

    if (error && !IS_DEV) {
      throw new Error(error.message)
    }

    return this.#applyToLocal(data)
  }

  async expire() {
    if (!this.#data) return
    if (!this.isValid) return
    const { key } = this.#data

    const { data, error } = await supabase
      .from('Keys')
      .update({ expired: true })
      .eq('key', key)
      .select()

    if (error && !IS_DEV) {
      throw new Error(error.message)
    }

    return this.#applyToLocal(data)
  }

  get isValid() {
    if (!this.#data) return
    const { created_at, expired } = this.#data
    const isOverdue =
      new Date().getTime() - new Date(created_at).getTime() > this.#LIFETIME_MS

    return !expired && !isOverdue
  }

  get key() {
    if (!this.#data) return
    const { key } = this.#data
    return key
  }

  createJwt(body: Record<string, any> = {}) {
    if (!this.#data) return
    if (!this.isValid) return

    const exp = Math.floor(
      (new Date(this.#data.created_at).getTime() + this.#LIFETIME_MS) / 1000
    )

    const token = jwt.sign({ exp, key: this.#data.key, ...body }, JWT_SECRET)
    // const token = jwt.sign({ exp, data: 'bc0ba36e-81b5-4e42-ab8e-be292f2e2b22' }, JWT_SECRET)

    return token
  }

  // TODO check the income JWT

  #applyToLocal(data: any[]) {
    head(data) && (this.#data = head(data))

    return this
  }

  static verifyToken(authHeader: string) {
    const payload = jwt.verify(authHeader, JWT_SECRET)

    return payload
  }
}
