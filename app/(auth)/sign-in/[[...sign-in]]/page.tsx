import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <span className="text-[#1D9E75]">Raport</span>KS
          </h1>
          <p className="text-gray-500 text-sm mt-2">Platforma civike e Kosovës</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
