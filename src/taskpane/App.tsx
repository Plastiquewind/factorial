import { OrientationSetting, UsageInfo } from "./features";

// Layout only: add a feature by adding its component here.
export function App() {
  return (
    <main className="app">
      <UsageInfo />
      <OrientationSetting />
    </main>
  );
}
