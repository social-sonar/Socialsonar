import { Button } from '@/components/Button'
import { APP_NAME, REPO_URL } from '@/lib/constants'
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
} from '@heroicons/react/20/solid'
import {
  EnvelopeOpenIcon,
  CalendarDaysIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

import { signIn } from '@/actions'

import Avatar from '@/images/avatar.png'
import merge from '@/images/photos/merge.jpg'
import landing from '@/images/photos/landing-1.webp'

import Image from 'next/image'

const primaryFeatures = [
  {
    name: 'Open source',
    description:
      'Know exactly what we are doing with your information with the security and long-term plan that an open source community project provides.',
    href: REPO_URL,
    icon: EnvelopeOpenIcon,
  },
  {
    name: 'Collaborate',
    description:
      `Share your contacts or groups of contacts with your work group in real time in a collaborative way. Never ask a teammate for someone's business card again.`,
    href: '#',
    icon: UsersIcon,
  },
  {
    name: 'Scheduling',
    description:
      'It has a simple way to share a URL and manage your appointments or those of your team. No thousands of options that get in the way of the options you actually use',
    href: '',
    icon: CalendarDaysIcon,
  },
]
const secondaryFeatures = [
  {
    name: 'Cloud based',
    description:
      'No matter what device you use, all your contacts will be there and updated waiting for you to take advantage',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'No big data with your YOUR data',
    description:
      'The information is only yours, it will not be used for anything other than providing you value.',
    icon: LockClosedIcon,
  },
  {
    name: 'Stay synchronized',
    description:
      'Choose the contacts from the provider you prefer, they will always be updated and synchronized.',
    icon: ArrowPathIcon,
  },
  {
    name: 'The person behind the contact',
    description:
      'We understand your contacts as unique identities and not only as numbers or addresses that are empty of importance.',
    icon: FingerPrintIcon,
  },
  {
    name: `It's your decision`,
    description:
      'Configure which feature you want to use and which not with your contact list, we are here to solve your contact book problems.',
    icon: Cog6ToothIcon,
  },
  {
    name: 'Export your data as you want',
    description:
      'We use the standard vcard format so you can export your contacts and migrate to another platform if is your choice.',
    icon: ServerIcon,
  },
]

export default function Home() {
  return (
    <div className="">
      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden">
          <div
            className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
            aria-hidden="true"
          >
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-40 lg:flex lg:px-8 lg:pt-40">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">

              <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                {APP_NAME}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                {APP_NAME} keeps your contacts organized by eliminating
                duplicates, updating all your contact details, and identifying
                missing information. Optimize your contact book today
                using {APP_NAME}
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                {CallToActionButton()}
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-0 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-0">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <Image
                  src={landing.src}
                  alt="App screenshot"
                  className="w-[76rem] opacity-50"
                  width={1792}
                  height={1024}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Have your contacts up to date
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything your agenda needs to be updated, reliable and
              synchronized
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {primaryFeatures.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-white">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500">
                      <feature.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                    <p className="mt-6">
                      <a
                        href={feature.href}
                        className="text-sm font-semibold leading-6 text-indigo-400"
                      >
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-32 sm:mt-56">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl sm:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-400">
                Everything you need in your agenda is solved by {APP_NAME}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                No time to fix your contacts? No problem.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Let artificial intelligence unlock the true value of all the
                contacts you have collected throughout your life and nourish them
                with useful information.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Image
                src={merge.src}
                alt="App screenshot"
                className="mb-[-12%]"
                width={2432}
                height={1442}
              />
              <div className="relative" aria-hidden="true">
                <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-gray-900 pt-[7%]" />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
            <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {secondaryFeatures.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-white">
                    <feature.icon
                      className="absolute left-1 top-1 h-5 w-5 text-indigo-500"
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>{' '}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* CTA section */}
        <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
          <svg
            className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="1d4240dd-898f-445f-932d-e2872fd12de3"
                width={200}
                height={200}
                x="50%"
                y={0}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={0} className="overflow-visible fill-gray-800/20">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#1d4240dd-898f-445f-932d-e2872fd12de3)"
            />
          </svg>
          <div
            className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Boost your network. Improve your business.
              <br />
              Start using {APP_NAME} today.
            </h2>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {CallToActionButton()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )

  function CallToActionButton() {
    return (
      <form action={signIn}>
        <Button className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">
          Get started
        </Button>
      </form>
    )
  }
}
