"use client"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { ValidationUtils } from "@/lib/utils"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"form" | "verify">("form")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const redirectUrl = session.user?.role === 'ADMIN' ? '/admin' : '/'
      router.push(redirectUrl)
    }
  }, [status, session, router])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email || !name || !password) {
      setError("Please fill in all fields")
      return
    }

    // Validate password strength
    const passwordValidation = ValidationUtils.validatePassword(password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setSendingCode(true)
    try {
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send verification code")
        setSendingCode(false)
        return
      }

      setSuccess("Verification code sent to your email!")
      setStep("verify")
      setSendingCode(false)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("Send code error:", errorMessage)
      setError(errorMessage)
      setSendingCode(false)
    }
  }

  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-and-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code: verificationCode })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      setSuccess("Registration successful! Logging you in...")

      // Auto-login after successful registration
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password
      })

      if (signInResult && "error" in signInResult && signInResult.error) {
        setError(signInResult.error || "Login failed after registration")
        setLoading(false)
        return
      }

      // Check user role and redirect accordingly
      await new Promise(resolve => setTimeout(resolve, 100))
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      let redirectUrl = "/"
      if (session?.user?.role === 'ADMIN') {
        redirectUrl = '/admin'
      }

      router.push(redirectUrl)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("Register client error:", errorMessage)
      setError(errorMessage)
      setLoading(false)
    }
  }

  function loginWith(provider: string) {
    signIn(provider, { callbackUrl: "/" })
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-4xl font-bold mb-5 text-center">Register</h1>
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
      <h1 className="text-4xl font-bold mb-5 text-center">Register</h1>
      {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 rounded p-2 mb-4 text-center">{success}</div>}

      {step === "form" ? (
        <form className="space-y-6" onSubmit={handleSendCode}>
          <div className="relative">
            <input type="text" id="register-name" value={name} onChange={e => setName(e.target.value)} required
              className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all" placeholder="Name" />
            <label htmlFor="register-name" className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
            >Name</label>
          </div>
          <div className="relative">
            <input type="email" id="register-email" value={email} onChange={e => setEmail(e.target.value)} required
              className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all" placeholder="Email" />
            <label htmlFor="register-email" className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
            >Email</label>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="register-password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              minLength={8}
              className="peer w-full border rounded-lg px-4 py-4 pr-12 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all" 
              placeholder="Password" 
            />
            <label htmlFor="register-password" className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
            >Password (min. 8 chars, letters & numbers)</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              id="register-confirm" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required
              className="peer w-full border rounded-lg px-4 py-4 pr-12 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all" 
              placeholder="Confirm Password" 
            />
            <label htmlFor="register-confirm" className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
            >Confirm Password</label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={sendingCode}
            className="w-full py-2 bg-[#030e55] text-white rounded font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sendingCode && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sendingCode ? "Registering..." : "Register"}
          </button>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Verification code sent!</strong> We&apos;ve sent a 6-digit verification code to <strong>{email}</strong>
            </p>
            <p className="text-xs text-blue-600">Please check your email and enter the code below. The code will expire in 10 minutes.</p>
          </div>
          <div className="relative">
            <input
              type="text"
              id="verification-code"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="peer w-full border rounded-lg px-4 py-4 text-base text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
              placeholder="000000"
            />
            <label htmlFor="verification-code" className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
            >Verification Code</label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep("form"); setVerificationCode(""); setError(""); setSuccess(""); }}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-bold cursor-pointer transition-colors hover:bg-gray-300"
            >
              Change Email
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 py-2 bg-[#030e55] text-white rounded font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Verifying..." : "Verify & Register"}
            </button>
          </div>
        </form>
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
        Already have an account? <Link href="/auth/login" className="text-[#030e55] underline">Log in</Link>
      </div>
    </div>
  )
}
