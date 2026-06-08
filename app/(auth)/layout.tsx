export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <a href="/" className="flex justify-center">
          <img
            src="/logo/AIsistent-Logo_6003x180.png"
            alt="AIsistent"
            height={36}
            style={{ objectFit: 'contain', maxWidth: '160px', width: 'auto' }}
          />
        </a>
        <p className="mt-1 text-sm text-gray-500">aisistent.rs</p>
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
