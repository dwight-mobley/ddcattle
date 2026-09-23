
import { Link } from "react-router-dom";
import logo from "../assets/ddcc-B7n0MI5M.png";

export default function About() {
  return (
    <main className="bg-desert-sand text-charcoal">       
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-saddle-brown/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32">
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">

            <div>
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-rust">
                DD Cattle Company
              </p>

              <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] text-saddle-brown sm:text-6xl lg:text-8xl">
                Built on friendship.
                <span className="block text-sage">
                  Driven by horses.
                </span>
              </h1>
            </div>

            <div className="max-w-md lg:pb-2">
                <img src={logo} alt="DD Cattle Company Logo" className="h-100 w-100 " />
              <p className="text-lg leading-8 text-charcoal/65">
                For David and Dwight, DD Cattle Company is more than a
                ranch. It is a place built around a lifelong friendship,
                a shared respect for animals, and a passion for the
                horses that need understanding the most.
              </p>
            </div>

          </div>
        </div>

        {/* Decorative element */}
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-rust/10" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full border border-rust/10" />
      </section>


      {/* Story */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">

          <div className="lg:col-span-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rust">
              Our Story
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-saddle-brown sm:text-5xl">
              Two friends.
              <br />
              One shared passion.
            </h2>
          </div>

          <div className="space-y-6 text-lg leading-8 text-charcoal/70 lg:col-span-7 lg:col-start-6">
            <p>
              David and Dwight have been friends for more than 20 years.
              Their friendship began in 2006 and, over the years, grew
              into a shared passion for horses, ranch life, and the
              animals that often need a little extra patience and
              understanding.
            </p>

            <p>
              That passion eventually became the foundation for
              <span className="font-semibold text-saddle-brown">
                {" "}DD Cattle Company
              </span>.
              What started with a friendship has grown into a ranch
              centered around working with mustangs, misunderstood
              horses, and animals that require time, trust, and a
              different approach.
            </p>

            <p>
              Neither David nor Dwight sees training as simply teaching
              an animal what to do. To them, it is about building a
              relationship—learning to communicate, earning trust, and
              giving an animal the opportunity to become confident in
              its own way.
            </p>
          </div>
        </div>
      </section>


      {/* Pull Quote */}
      <section className="bg-saddle-brown text-desert-sand">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8 lg:py-28">
          <div className="mx-auto mb-8 h-px w-16 bg-rust" />

          <blockquote className="font-serif text-3xl leading-relaxed sm:text-4xl lg:text-5xl">
            “Every animal has a story. Sometimes they just need someone
            willing to take the time to listen.”
          </blockquote>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-desert-sand/50">
            The DD Cattle Company philosophy
          </p>
        </div>
      </section>


      {/* What We Love */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">

        <div className="mb-14 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rust">
            What Drives Us
          </p>

          <h2 className="mt-4 font-serif text-4xl text-saddle-brown sm:text-5xl">
            More than a ranch.
          </h2>

          <p className="mt-5 text-lg leading-8 text-charcoal/60">
            Our work is rooted in a few simple things: patience,
            horsemanship, friendship, and a love for the open trail.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl bg-saddle-brown/10 md:grid-cols-3">

          {/* Mustangs */}
          <div className="bg-desert-sand p-8 lg:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
              <span className="font-serif text-2xl">01</span>
            </div>

            <h3 className="font-serif text-2xl text-saddle-brown">
              Mustangs
            </h3>

            <p className="mt-4 leading-7 text-charcoal/60">
              We have a deep respect for mustangs and the unique
              challenges and qualities they bring. Working with them
              requires patience, consistency, and a willingness to
              understand the horse in front of you.
            </p>
          </div>

          {/* Understanding */}
          <div className="bg-desert-sand p-8 lg:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-rust/10 text-rust">
              <span className="font-serif text-2xl">02</span>
            </div>

            <h3 className="font-serif text-2xl text-saddle-brown">
              Understanding
            </h3>

            <p className="mt-4 leading-7 text-charcoal/60">
              Some animals have simply been misunderstood. We believe
              patience and clear communication can create opportunities
              where frustration once stood.
            </p>
          </div>

          {/* Trail */}
          <div className="bg-desert-sand p-8 lg:p-10">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-saddle-brown/10 text-saddle-brown">
              <span className="font-serif text-2xl">03</span>
            </div>

            <h3 className="font-serif text-2xl text-saddle-brown">
              The Trail
            </h3>

            <p className="mt-4 leading-7 text-charcoal/60">
              Trail riding is a big part of what we love. There is
              something about putting miles behind you, spending time
              outside, and experiencing the country from the back of a
              horse.
            </p>
          </div>

        </div>
      </section>


      {/* David & Dwight */}
      <section className="border-y border-saddle-brown/10 bg-white/40">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">

          <div className="grid items-center gap-14 lg:grid-cols-2">

            <div>
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-sage/10">
                {/* Replace this with a ranch photo */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-5xl text-sage/30">
                      DD
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-sage/50">
                      David & Dwight
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rust">
                David & Dwight
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-saddle-brown sm:text-5xl">
                Friends since 2006.
                <br />
                Partners in the ranch.
              </h2>

              <div className="mt-7 space-y-5 text-lg leading-8 text-charcoal/65">
                <p>
                  More than two decades of friendship have shaped the
                  way David and Dwight approach everything they do at
                  DD Cattle Company.
                </p>

                <p>
                  Their shared love of horses brought them together in
                  the arena and on the trail, but it is their belief in
                  patience, trust, and good horsemanship that continues
                  to drive the ranch forward.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-6">
                <div>
                  <p className="font-serif text-3xl text-saddle-brown">
                    2006
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sage">
                    Friendship began
                  </p>
                </div>

                <div className="h-12 w-px bg-saddle-brown/15" />

                <div>
                  <p className="font-serif text-3xl text-saddle-brown">
                    20+
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sage">
                    Years together
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Closing CTA */}
      <section className="bg-desert-sand">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-28">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rust">
            Come see what we're about
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight text-saddle-brown sm:text-5xl lg:text-6xl">
            There is always another
            <span className="text-sage"> trail to ride.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-charcoal/60">
            Get to know the animals that call DD Cattle Company home,
            or reach out and say hello.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/barn"
              className="rounded-lg bg-saddle-brown px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rust"
            >
              Meet the animals
            </Link>

            <Link
              to="/contact"
              className="rounded-lg border border-saddle-brown/20 bg-white px-7 py-3.5 text-sm font-semibold text-saddle-brown transition-colors hover:border-rust hover:text-rust"
            >
              Get in touch
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}