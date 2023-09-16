import Footer from 'components/Footer';
import './Game.scss';
import usePopup from 'hooks/usePopup';
import { CREATE_BUCKET } from 'stores/popup-store';
import { useInfo } from 'hooks/useInfo';
import { useClaim, usePlay } from 'hooks/usePlay';

const AvailableChunks = () => {
	const { availableChunks, isLoading } = useInfo()

	return (
		<div className="btn">
			{isLoading
				? 'Loading...'
				: `Pending fighter: ${availableChunks}`}
		</div>
	)
}

const Buy = () => {
	const { show } = usePopup(CREATE_BUCKET)
	
	return (
		<div onClick={show} className="btn">
			Buy
		</div>
	)
}

const Play = () => {
	const { play, isLoading } = usePlay()

	return (
		<div onClick={isLoading ? undefined : play} className="btn">
			{isLoading ? 'Setting up...' : 'Fight now'}
		</div>
	)
}
const Claim = () => {
	const { claim, isLoading } = useClaim()

	return (
		<div onClick={isLoading ? undefined : claim} className="btn">
			{isLoading ? 'Claiming...' : 'Claim rewards'}
		</div>
	)
}

export default function GamePage() {
  return (
		<div className="game-wrapper">
			<div className="main-box">
				<div className="col center">
					<Play />
					<Claim />
				</div>

				<AvailableChunks />

				<Footer />
			</div>
		</div>
  );
}
