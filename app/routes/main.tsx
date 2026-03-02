import MainPage from "~/pages/mainPage";
import type { Route } from "./+types/main";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HuskyRentLens | MTU Housing" },
    { name: "description", content: "Transparent MTU Housing" },
  ];
}

export default function Main() {
  return <MainPage />;
}
