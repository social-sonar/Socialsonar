'use client'

import { redirect, RedirectType } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingSpinner from "./spinner";

type AuthenticatedComponent = (props: any) => React.ReactElement | null

export const protectPage = (WrappedComponent: React.ComponentType<any>): AuthenticatedComponent => {
  return function WithAuth(props: any) {
    const session = useSession()
    if (session.status == 'authenticated' && session.data?.user) {
      return <WrappedComponent {...props} />;
    }
    if (session.status == 'unauthenticated') {
      redirect("/", RedirectType.replace);
    }
    return <div className="inline">Authenticating...</div>
  };
};

export default protectPage
