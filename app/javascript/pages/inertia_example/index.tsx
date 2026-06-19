import Layout from "@/components/layout/Layout"
import { ReactNode } from "react"

export default function InertiaExample(


) {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark font-sans p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-brand-tan overflow-hidden">

        {/* Card Header image placeholder area */}
        <div className="h-48 bg-brand-sage flex items-center justify-center text-brand-cream font-display text-2xl">
          DDCattle Co. Mustangs
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <span className="inline-block bg-brand-tan text-brand-dark text-xs font-semibold px-2.5 py-0.5 rounded">
            Available for Adoption
          </span>

          <h3 className="font-display text-2xl font-bold tracking-tight">
            Wild Mustang Training Program
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            Raised on the range, refined by hand. Founded by two lifelong friends dedicated to preserving the spirit of the American West.
          </p>

          <button className="w-full bg-brand-clay hover:bg-opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-sm">
            Meet the Horses
          </button>
        </div>
      </div>
    </div>

  )
}

InertiaExample.layout = (page: ReactNode) => <Layout>{page}</Layout>
