import { useRef, useState } from 'react'

export function Comment({ token }) {
  return (
    <div>
      <PostComment token={token} />
    </div>
  )
}

export function PostComment({ token }) {
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef(null)
  return (
    <form method="post" id="form" ref={formRef}>
      <div>
        <label htmlFor="name">123123123</label>
        <input type="text" name="user_name" />
      </div>
      <div>
        <label htmlFor="email">Enter your email:</label>
        <input type="email" name="email" />
      </div>
      <div>
        <label htmlFor="email">content</label>
        <textarea name="content"></textarea>
      </div>
      <div>
        <button
          disabled={isLoading}
          onClick={async (e) => {
            e.preventDefault()

            setIsLoading(true)
            if (!formRef.current) {
              return
            }
            const formData = new FormData(formRef.current)

            const body = {}
            for (const [key, value] of formData) {
              body[key] = value
            }

            const res = await fetch('http://localhost:4321/api/comment', {
              method: 'POST',
              body: JSON.stringify(body),
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            setIsLoading(false)
            location.reload()
          }}
        >
          {isLoading ? 'loading...' : 'submit'}
        </button>
      </div>
    </form>
  )
}
