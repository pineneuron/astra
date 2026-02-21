"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()

    // Redirect if already authenticated
    useEffect(() => {
        if (status === 'authenticated' && session) {
            const redirectUrl = session.user?.role === 'ADMIN' ? '/admin' : '/'
            router.push(redirectUrl)
        }
    }, [status, session, router])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to send reset email")
                setLoading(false)
                return
            }

            setSuccess(true)
            setLoading(false)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
            console.error("Forgot password error:", errorMessage)
            setError(errorMessage)
            setLoading(false)
        }
    }

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-4xl font-bold mb-5 text-center">Forgot Password</h1>
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
            <h1 className="text-4xl font-bold mb-5 text-center">Forgot Password</h1>

            {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}

            {success ? (
                <div className="space-y-4">
                    <div className="bg-green-50 text-green-700 rounded p-4 text-center border border-green-200">
                        <p className="font-medium mb-2">✓ Email sent successfully!</p>
                        <p className="text-sm">
                            If an account with that email exists, we&apos;ve sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and click the link to reset your password.
                        </p>
                        <p className="text-sm mt-2">The link will expire in 1 hour.</p>
                    </div>
                    <div className="text-center">
                        <Link href="/auth/login" className="text-[#030e55] underline">Back to Login</Link>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-6 text-center">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <input
                                type="email"
                                id="forgot-email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                                className="peer w-full border rounded-lg px-4 py-4 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
                                placeholder="Email"
                            />
                            <label
                                htmlFor="forgot-email"
                                className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
                  text-gray-400 text-base top-4
                  peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
                  peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
                  peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                            >
                                Email
                            </label>
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
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Remember your password? <Link href="/auth/login" className="text-[#030e55] underline">Log in</Link>
                    </div>
                </>
            )}
        </div>
    )
}
