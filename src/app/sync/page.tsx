'use client'

import React, { useEffect, useState } from 'react'
import {
  getGoogleAccounts,
  editGoogleAccount,
} from '@/lib/data/getGoogleAccounts'
import { GoogleAccount, UserGoogleAccount } from '@prisma/client'
import { GoogleSyncButton } from '@/components/Sync'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/common/spinner'
import { Switch } from '@headlessui/react'
import GoogleAccountsMenu from '@/components/GoogleAccountsMenu'
import Menu from '@/components/GoogleAccountsMenu'

interface ExtendedUserGoogleAccount extends UserGoogleAccount {
  googleAccount: GoogleAccount
}

export default function SyncGoogleAccounts() {
  const [userGoogleAccounts, setUserGoogleAccounts] = useState<
    ExtendedUserGoogleAccount[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      let response = await getGoogleAccounts()
      setUserGoogleAccounts(response)
    }

    fetchData()
  }, [])

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  const changeAbleToWrite = (
    e: boolean,
    eachUserGoogleAccount: ExtendedUserGoogleAccount,
  ) => {
    const indexOfChange = userGoogleAccounts.findIndex((e) => {
      return e.id === eachUserGoogleAccount.id
    })
    setUserGoogleAccounts(
      userGoogleAccounts.with(indexOfChange, {
        ...userGoogleAccounts[indexOfChange],
        googleAccount: {
          ...userGoogleAccounts[indexOfChange].googleAccount,
          ableToWrite: e,
        },
      }),
    )
    editGoogleAccount(
      userGoogleAccounts[indexOfChange].id,
      userGoogleAccounts[indexOfChange].googleAccount,
    )
  }
  return (
    <div className="">
      <div className="">
        {userGoogleAccounts.length > 0 ? (
          <div className="">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-base font-semibold leading-6 text-white">
                    Connected accounts
                  </h1>
                  <p className="mt-2 text-sm text-gray-300">
                    This are the connected accounts
                  </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <Button
                    href="/api/auth/google"
                    className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    Add google account
                  </Button>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="sm:-mx-6 lg:-mx-8">
                  <div className="inline-block py-2 align-middle sm:px-6 lg:px-8">
                    <table className=" divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Connected since
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            Edit contacts
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                          >
                            <span className="sr-only">Connect / Sync</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {(userGoogleAccounts || []).map(
                          (eachUserGoogleAccount) => (
                            <tr key={eachUserGoogleAccount.id}>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {eachUserGoogleAccount.googleAccount.email}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                {eachUserGoogleAccount.createdAt.toLocaleString()}
                              </td>
                              <td className="margin-auto">
                                <Switch
                                  checked={
                                    eachUserGoogleAccount.googleAccount
                                      .ableToWrite
                                  }
                                  onChange={(e) => {
                                    changeAbleToWrite(e, eachUserGoogleAccount)
                                  }}
                                  className={classNames(
                                    eachUserGoogleAccount.googleAccount
                                      .ableToWrite
                                      ? 'bg-teal-600'
                                      : 'bg-gray-200',
                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
                                  )}
                                >
                                  <span
                                    aria-hidden="true"
                                    className={classNames(
                                      eachUserGoogleAccount.googleAccount
                                        .ableToWrite
                                        ? 'translate-x-5'
                                        : 'translate-x-0',
                                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                    )}
                                  />
                                </Switch>
                                <span className="ml-3 text-sm">(BETA)</span>
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <Menu
                                  googleAccountId={
                                    eachUserGoogleAccount.googleAccountId
                                  }
                                ></Menu>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <LoadingSpinner size={100} className="mx-auto" />
        )}
      </div>
    </div>
  )
}
