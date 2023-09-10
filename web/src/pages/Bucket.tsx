import Footer from 'components/Footer';
import { useParams } from 'react-router-dom';

const BucketContent = ({ id }: { id: string }) => {
  
  const isLoading = false
  const notExist = false

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <img src="./loading.gif" width="32px" height="32px" />
      </div>
    )
  }

  if (notExist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-4 top-4 right-4 flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            <code className="font-mono font-bold">{`Unkown bucket: {{${id}}}`}</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-4 top-4 right-4 flex justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          What are your feelings about me?{' '}
          <code className="font-mono font-bold">{'{{Let me know}}'}</code>
        </p>
      </div>
      <div className="pt-24 grid gap-y-20 bg-red text-center">
        <a
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Hello
          </h2>
          <h2 className={`mb-3 text-4xl font-semibold`}>
            😡
          </h2>
          <p className={`m-0 max-w-[30ch] ml-auto mr-auto  text-sm opacity-50`}>
            Show your
          </p>
        </a>
      </div>
      <Footer />

      <div className="pointer-events-none absolute top-60 flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        
      </div>

    </main>
  );
}

export default function BucketPage() {
  const params = useParams()
  const id = params.id ?? ''

  return (
    <BucketContent id={id} />
  )
}
