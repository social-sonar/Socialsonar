'use client'

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

type AuthenticatedComponent = (props: Record<string, any>) => React.ReactElement | null

export const protectPage = (WrappedComponent: React.ComponentType<Record<string, any>>): AuthenticatedComponent => {
  return function WithAuth(props: Record<string, any>) {
    const session = useSession()
    if (!session.data?.user) {
      redirect("/");
    }
    return <WrappedComponent {...props} />;
  };
};

export default protectPage
