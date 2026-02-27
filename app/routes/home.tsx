import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HuskyRentLens | MTU Housing" },
    { name: "description", content: "Transparent MTU Housing" },
  ];
}

export default function Home() {
  return <Welcome />;
}
