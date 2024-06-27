'use client'

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

type AuthenticatedComponent = (props: any) => React.ReactElement | null

export const protectPage = (WrappedComponent: React.ComponentType<any>): AuthenticatedComponent => {
  return function WithAuth(props: any) {
    const session = useSession()
    if (!session.data?.user) {
      redirect("/");
    }
    return <WrappedComponent {...props} />;
  };
};

export default protectPage
