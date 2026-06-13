# KOETSUGI(声次)
`KOETSUGI`はWebブラウザ上で動作する、インタラクティブな音楽再生・ワークフローエンジンアプリケーションです。
単純なプレイリストの枠を超え、音声トラックの再生完了後に「ユーザーの選択」「ランダムな確率」「ループ」といった条件分岐を持つワークフローを構築し、それに沿って音声作品を楽しむことができます。

詳細なプロダクトビジョンについては [PRODUCT.md](./PRODUCT.md) を、AIエージェント向けのシステム規約については [AGENTS.md](./AGENTS.md) を参照してください。

## ✨ 主な機能 (Features)

* **インタラクティブな再生ワークフロー:**
  * **選択 (Choice):** トラック終了時、次に再生するトラックをユーザーに選択させる分岐を作成。
  * **ランダム (Random):** 設定した重み付け（確率）に基づいて自動的に分岐。
  * **ダイレクト/ループ (Direct):** 自動的に次のトラックへ進行、または過去のノードへ戻るループ構造。
* **モバイルファースト・デザイン:**
  * スマートフォンでの片手操作に最適化。
  * ワークフロー構築（エディタ）は、ドラッグ＆ドロップを排除したカードリスト＋ボトムシート（Drawer）のフォーム形式を採用。
  * 再生・選択画面（プレイヤー）は、誤操作を防ぐ巨大なボタンUIで構成。

## 🛠 技術スタック (Tech Stack)

* **Framework:** React 18+ (Vite)
* **Routing:** TanStack Router
* **UI & Styling:** Tailwind CSS, shadcn/ui, Radix UI
* **State Management (Domain):** XState (ワークフローエンジン、状態遷移)
* **State Management (Infrastructure):** Zustand (ディレクトリハンドルのメモリ保持)
* **Validation:** Zod (ワークフローJSONのスキーマ検証)
* **Linter/Formatter:** Biome

## 🚀 開発環境のセットアップ (Getting Started)

### 前提条件
* Node.js (v20以上を推奨)
* `File System Access API` をサポートするモダンブラウザ (Chrome, Edgeなど)


## 📄 ワークフロー仕様 (Workflow Schema)

本アプリケーションで扱うワークフローデータは、ネストを避けた**フラットなRecord（辞書型）構造**のJSONとして保存されます。

```json
{
  "workflowId": "uuid-v4",
  "initialNodeId": "node-1",
  "nodes": {
    "node-1": {
      "id": "node-1",
      "audioPath": "chapter1/track_a.mp3",
      "transitions": [
        { "type": "choice", "targetId": "node-2", "buttonText": "森へ進む" },
        { "type": "choice", "targetId": "node-3", "buttonText": "洞窟へ進む" }
      ]
    }
    // ... other nodes
  }
}

```



# Getting Started

To run this application:

```bash
pnpm install
pnpm dev
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `pnpm add @tailwindcss/vite tailwindcss --dev`

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
pnpm lint
pnpm format
pnpm check
```



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
