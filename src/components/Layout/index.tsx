import { ReactNode } from "react";
import { NavBar } from "../NavBar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <NavBar />
      <main className="container mt-4">{children}</main>
    </>
  );
}
