import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { WagmiConfig, createClient } from 'wagmi';
import { configureChains } from '@wagmi/core';
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import { sepolia } from 'wagmi/chains';

import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { SEPOLIA_CONFIG } from 'constants/index';

import './index.scss';

const { provider, chains } = configureChains(
  [sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.id === sepolia.id ? SEPOLIA_CONFIG.dev.node : SEPOLIA_CONFIG.prod.node
      })
    })
  ]
);

const client = createClient(
  getDefaultClient({
    appName: 'Ponzi Button',
    chains,
    provider: provider
  })
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <RouterProvider router={router} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
