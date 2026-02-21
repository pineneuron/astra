"use client"
import { useState, Suspense, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const callbackUrl = params.get("callbackUrl") || "/"
      const redirectUrl = session.user?.role === 'ADMIN' ? '/admin' : callbackUrl
      router.push(redirectUrl)
    }
  }, [status, session, router, params])

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Helper to timeout signIn if it never resolves
    const signInWithTimeout = (opts: Parameters<typeof signIn>[1], ms = 10000) =>
      Promise.race([
        // Call NextAuth signIn (returns a Promise)
        signIn("credentials", { ...opts, redirect: false }),
        // Timeout fallback
        new Promise((_, reject) => setTimeout(() => reject(new Error("signIn timeout")), ms))
      ])

    try {
      console.log("client: calling signIn with", { email, password })
      const res = await signInWithTimeout({
        email,
        password,
        callbackUrl: params.get("callbackUrl") || "/",
      }, 10000) // 10s timeout

      console.log("client: signIn result", res)
      setLoading(false)

      // res can be undefined in some builds; guard it
      if (!res) {
        setError("Login failed: no response from auth")
        return
      }
      if (typeof res === "object" && "error" in res) {
        const errorValue = (res as { error?: string }).error
        if (errorValue) {
          setError(errorValue || "Invalid email or password")
          return
        }
      }

      // Check user role and redirect accordingly
      // Wait a bit for session to be updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Fetch session to get user role
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      
      // Redirect based on role
      let redirectUrl = params.get("callbackUrl") || "/"
      if (session?.user?.role === 'ADMIN') {
        redirectUrl = '/admin'
      }
      
      router.push(redirectUrl)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      console.error("client signIn error:", errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }
    setMagicLinkLoading(true)
    setError("")
    setMagicLinkSuccess(false)
    
    try {
      const res = await signIn("email", {
        redirect: false,
        email,
        callbackUrl: params.get("callbackUrl") || "/",
      })
      
      if (res?.error) {
        setError("Failed to send magic link. Please try again.")
        setMagicLinkSuccess(false)
      } else {
        setMagicLinkSuccess(true)
        setError("")
      }
    } catch {
      setError("An error occurred. Please try again.")
      setMagicLinkSuccess(false)
    } finally {
      setMagicLinkLoading(false)
    }
  }

  async function loginWith(provider: string) {
    // For OAuth providers, redirect to home first, then check session and redirect admin users
    const callbackUrl = params.get("callbackUrl") || "/"
    signIn(provider, { callbackUrl })
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-center">Log in to your account</h1>
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Don't render form if authenticated (will redirect)
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Log in to your account</h1>

      {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}

      <form className="space-y-6" onSubmit={handleCredentials}>
        <div className="relative">
          <input
            type="email"
            id="login-email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
            placeholder="Email"
          />
          <label
            htmlFor="login-email"
            className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
          >
            Email
          </label>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="login-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="peer w-full border rounded-lg px-4 py-4 pr-12 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
            placeholder="Password"
          />
          <label
            htmlFor="login-password"
            className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-sm text-[#030e55] underline hover:text-[#020a3f]">
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[#030e55] text-white rounded font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="flex justify-between items-center my-4">
        <span className="text-gray-500 text-sm">or</span>
        <button 
          className="text-[#030e55] text-sm underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleMagicLink}
          disabled={magicLinkLoading || loading}
        >
          {magicLinkLoading ? 'Sending magic link...' : magicLinkSuccess ? 'Email sent! Check your inbox' : 'Sign in by Email (Magic Link)'}
        </button>
      </div>
      
      {magicLinkSuccess && (
        <div className="bg-green-50 text-green-700 rounded p-3 text-sm border border-green-200">
          <p className="font-medium mb-1">✓ Email sent successfully!</p>
          <p>Please check your email inbox and click the sign-in link we just sent to <strong>{email}</strong>. The link will expire in 24 hours.</p>
        </div>
      )}

      <div className="flex flex-col gap-2 my-4">
        <button onClick={() => loginWith("google")}
          className="w-full flex items-center justify-center bg-white border border-gray-300 rounded py-2 font-semibold hover:bg-gray-50">
          <Image src="/images/google.svg" alt="Google" width={20} height={20} className="mr-2" /> Continue with Google
        </button>
        <button onClick={() => loginWith("facebook")}
          className="w-full flex items-center justify-center bg-white border border-gray-300 rounded py-2 font-semibold hover:bg-gray-50 hidden">
          <Image src="/images/facebook.svg" alt="Facebook" width={20} height={20} className="mr-2" /> Continue with Facebook
        </button>
      </div>

      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account? <Link href="/auth/register" className="text-[#030e55] underline">Sign up</Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-center">Log in to your account</h1>
        <div className="text-center">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
