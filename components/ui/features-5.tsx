import { Activity, DraftingCompass, Mail, Zap } from "lucide-react";
import Image from "next/image";

export function Features5() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-xl md:max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-semibold lg:text-5xl">
                Built for Scaling teams
              </h2>
              <p className="mt-6">
                Orrupti aut temporibus assumenda atque ab, accusamus sit,
                molestiae veniam laboriosam pariatur.
              </p>
            </div>
            <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
              <li>
                <Mail className="size-5" />
                Email and web support
              </li>
              <li>
                <Zap className="size-5" />
                Fast response time
              </li>
              <li>
                <Activity className="size-5" />
                Menitoring and analytics
              </li>
              <li>
                <DraftingCompass className="size-5" />
                Architectural review
              </li>
            </ul>
          </div>
          <div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
            <div className="bg-gradient-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                className="hidden rounded-[15px] dark:block object-cover"
                alt="analytics dashboard dark"
                width={1207}
                height={929}
              />
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
                className="rounded-[15px] shadow dark:hidden object-cover"
                alt="analytics dashboard light"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
