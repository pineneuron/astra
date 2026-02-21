"use client"
import { useState, Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { ValidationUtils } from "@/lib/utils"

function ResetPasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useSearchParams()

    // Redirect if already authenticated (unless they have a valid reset token)
    useEffect(() => {
        if (status === 'authenticated' && session && !params.get("token")) {
            const redirectUrl = session.user?.role === 'ADMIN' ? '/admin' : '/'
            router.push(redirectUrl)
        }
    }, [status, session, router, params])

    useEffect(() => {
        const tokenParam = params.get("token")
        const emailParam = params.get("email")

        if (!tokenParam || !emailParam) {
            setError("Invalid or missing reset link. Please request a new password reset.")
            return
        }

        setToken(tokenParam)
        setEmail(emailParam)
    }, [params])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!token || !email) {
            setError("Invalid reset link")
            setLoading(false)
            return
        }

        // Validate password strength
        const passwordValidation = ValidationUtils.validatePassword(password)
        if (!passwordValidation.valid) {
            setError(passwordValidation.error || "Invalid password")
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Failed to reset password")
                setLoading(false)
                return
            }

            setSuccess(true)
            setLoading(false)

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
            console.error("Reset password error:", errorMessage)
            setError(errorMessage)
            setLoading(false)
        }
    }

    // Show loading while checking session
    if (status === 'loading') {
        return (
            <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-4xl font-bold mb-5 text-center">Reset Password</h1>
                <div className="text-center">Loading...</div>
            </div>
        )
    }

    // Don't render form if authenticated without token (will redirect)
    if (status === 'authenticated' && !params.get("token")) {
        return null
    }

    if (!token || !email) {
        return (
            <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-4xl font-bold mb-5 text-center">Reset Password</h1>
                {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}
                <div className="text-center">
                    <Link href="/auth/forgot-password" className="text-[#030e55] underline">Request a new password reset</Link>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-4xl font-bold mb-5 text-center">Password Reset Successful</h1>
                <div className="bg-green-50 text-green-700 rounded p-4 text-center border border-green-200">
                    <p className="font-medium mb-2">✓ Your password has been reset successfully!</p>
                    <p className="text-sm">Redirecting to login page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h1 className="text-4xl font-bold mb-5 text-center">Reset Password</h1>

            {error && <div className="bg-red-100 text-red-700 rounded p-2 mb-4 text-center">{error}</div>}

            <p className="text-gray-600 mb-6 text-center">
                Enter your new password below. Password must be at least 8 characters long and contain both letters and numbers.
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="reset-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoFocus
                        minLength={8}
                        className="peer w-full border rounded-lg px-4 py-4 pr-12 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
                        placeholder="New Password"
                    />
                    <label
                        htmlFor="reset-password"
                        className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                    >
                        New Password
                    </label>
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
                        id="reset-confirm-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="peer w-full border rounded-lg px-4 py-4 pr-12 text-base focus:outline-none focus:border-[#030e55] border-gray-300 placeholder-transparent transition-all"
                        placeholder="Confirm Password"
                    />
                    <label
                        htmlFor="reset-confirm-password"
                        className="absolute left-4 bg-white px-1 font-medium pointer-events-none transition-all duration-200
              text-gray-400 text-base top-4
              peer-focus:text-xs peer-focus:text-[#030e55] peer-focus:top-1 peer-focus:bg-white peer-focus:px-1
              peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4
              peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-[#030e55] peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-1"
                    >
                        Confirm Password
                    </label>
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
                    disabled={loading}
                    className="w-full py-2 bg-[#030e55] text-white rounded font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading && (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <div className="mt-4 text-center text-sm">
                Remember your password? <Link href="/auth/login" className="text-[#030e55] underline">Log in</Link>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-lg mx-auto my-16 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h1 className="text-4xl font-bold mb-8 text-center">Reset Password</h1>
                <div className="text-center">Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
