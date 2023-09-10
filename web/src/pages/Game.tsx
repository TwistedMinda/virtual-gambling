import Footer from 'components/Footer';
import './Game.scss';
import usePopup from 'hooks/usePopup';
import { CREATE_BUCKET } from 'stores/popup-store';
import { useInfo } from 'hooks/useInfo';
import { useDepositLiquidity } from 'hooks/useDepositLiquidity';

const AvailableChunks = () => {
	const { availableChunks, isLoading } = useInfo()

	return (
		<div className="btn">
			{isLoading
				? 'Loading...'
				: `Available chunks: ${availableChunks}`}
		</div>
	)
}

const Gamble = () => {
	const { show } = usePopup(CREATE_BUCKET)
	
	return (
		<div onClick={show} className="btn">
			Go & Gamble
		</div>
	)
}
const Deposit = () => {
	const { depositLiquidity, isLoading } = useDepositLiquidity()

	return (
		<div onClick={isLoading ? undefined : depositLiquidity} className="btn">
			{isLoading ? 'Depositing...' : 'Provide Liquidity'}
		</div>
	)
}

export default function GamePage() {
  return (
		<div className="game-wrapper">
			<div className="main-box">
				<div className="col center">
					<Deposit />
					
					<Gamble />
				</div>

				<AvailableChunks />

				<Footer />
			</div>
		</div>
  );
}
