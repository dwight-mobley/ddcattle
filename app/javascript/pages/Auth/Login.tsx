import React from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Layout from "@/components/layout/Layout";

export default function Login() {
  const { flash } = usePage<{ flash?: { alert?: string; notice?: string } }>().props;
  const {data, setData, post} = useForm({
    username:'',
    password: ''
  })
  const handleSubmit = (e: React.SubmitEvent)=>{
    e.preventDefault();
    post('/login')
  }


  return (
    <>
      <Head title="Login" />

      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-20">
        <div className="w-full max-w-md rounded-[2rem] border border-brand-tan/40 bg-white/95 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-brand-sage">Member login</p>
            <h1 className="mt-4 text-3xl font-bold text-brand-dark">Sign in to DDCattle</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your username and password to manage your account.
            </p>
          </div>

          {flash?.alert?.message && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {flash.alert.message}
            </div>
          )}

          {flash?.notice && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {flash.notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">


            <label className="block">
              <span className="text-sm font-medium text-brand-dark">Username</span>
              <input
                name="username"
                type="text"
                value={data.username}
                onChange={(event) => setData('username', event.target.value)}
                className="mt-2 w-full rounded-3xl border border-brand-tan/50 bg-brand-cream/50 px-4 py-3 text-sm text-brand-dark outline-none transition focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20"
                required
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-brand-dark">Password</span>
              <input
                name="password"
                type="password"
                value={data.password}
                onChange={(event) => setData('password', event.target.value)}
                className="mt-2 w-full rounded-3xl border border-brand-tan/50 bg-brand-cream/50 px-4 py-3 text-sm text-brand-dark outline-none transition focus:border-brand-clay focus:ring-2 focus:ring-brand-clay/20"
                required
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-3xl bg-brand-clay px-5 py-3 text-sm font-semibold text-brand-cream transition hover:bg-brand-clay/90"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="font-medium text-brand-clay hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

Login.layout = (page: React.ReactNode) => <Layout>{page}</Layout>;