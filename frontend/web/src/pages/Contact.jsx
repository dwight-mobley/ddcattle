import { Link } from "react-router-dom";
import ContactForm from "../components/forms/ContactForm";

export default function Contact() {
  return (
    <main className="min-h-screen bg-desert-sand text-charcoal">     
      {/* Hero */}
      {/* <section className="border-b border-saddle-brown/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.75fr] lg:items-end">

            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.3em] text-rust">
                Get in Touch
              </p>

              <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] text-saddle-brown sm:text-6xl lg:text-7xl">
                Come say
                <span className="block text-sage">hello.</span>
              </h1>
            </div>

            <div className="max-w-lg lg:pb-1">
              <p className="text-lg leading-8 text-charcoal/65">
                Whether you have a question about one of our animals,
                want to learn more about DD Cattle Company, or simply
                want to connect with us, we would love to hear from you.
              </p>
            </div>

          </div>
        </div>
      </section> */}


      {/* Contact Content */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

          {/* Contact Information */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rust">
              Contact
            </p>

            <h2 className="mt-4 font-serif text-4xl text-saddle-brown">
              Let's talk horses.
            </h2>

            <p className="mt-5 leading-7 text-charcoal/60">
              We are always happy to talk about horses, mustangs,
              trail riding, ranch life, or the animals that make
              DD Cattle Company what it is.
            </p>

            <div className="mt-10 space-y-7">

              {/* Email */}
              {/* <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rust/10 text-rust">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.91l-7.5 4.615a2.25 2.25 0 0 1-2.36 0l-7.5-4.614a2.25 2.25 0 0 1-1.07-1.91V6.75"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                    Email
                  </p>

                  <a
                    href="mailto:hello@ddcattlecompany.com"
                    className="mt-1 block text-base font-medium text-saddle-brown transition-colors hover:text-rust"
                  >
                    hello@ddcattlecompany.com
                  </a>
                </div>
              </div> */}


              {/* Phone */}
              {/* <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.09l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.329.438-.934.588-1.43.342a12.035 12.035 0 0 1-5.383-5.383c-.246-.496-.096-1.101.342-1.43l1.293-.97c.394-.296.556-.81.417-1.173L8.515 4.65A1.125 1.125 0 0 0 7.425 3.75H6.75A4.5 4.5 0 0 0 2.25 8.25v-1.5Z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                    Phone
                  </p>

                  <a
                    href="tel:+10000000000"
                    className="mt-1 block text-base font-medium text-saddle-brown transition-colors hover:text-rust"
                  >
                    (000) 000-0000
                  </a>
                </div>
              </div> */}


              {/* Location */}
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-saddle-brown/10 text-saddle-brown">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                    Location
                  </p>

                  <p className="mt-1 text-base font-medium text-saddle-brown">
                    Gillsville, Ga
                  </p>

                  <p className="mt-1 text-sm text-charcoal/50">
                    By appointment
                  </p>
                </div>
              </div>

            </div>


            {/* Barn link */}
            <div className="mt-12 border-t border-saddle-brown/10 pt-8">
              <p className="text-sm text-charcoal/50">
                Want to meet the animals first?
              </p>

              <Link
                to="/barn"
                className="mt-2 inline-flex items-center gap-2 font-medium text-saddle-brown transition-colors hover:text-rust"
              >
                Visit the barn
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>


        <ContactForm />

        </div>
      </section>


      {/* Bottom Statement */}
      <section className="bg-saddle-brown text-desert-sand">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-24">

          <div className="mx-auto mb-7 h-px w-12 bg-rust" />

          <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
            Good horses, good friends,
            <span className="block text-sage">
              and good miles on the trail.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-desert-sand/55">
            DD Cattle Company is built on a lifelong friendship and a
            shared love for the animals and lifestyle that bring us
            together.
          </p>

        </div>
      </section>

    </main>
  );
}