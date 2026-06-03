export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <a href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
          AI<span className="text-blue-600">sistent</span>
        </a>
        <p className="mt-1 text-sm text-gray-500">aisistent.rs</p>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {children}
      </div>
    </div>
  )
}
