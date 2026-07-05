import HomeClient from "./page-client";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export default function Page() {
  return <HomeClient />;
}
