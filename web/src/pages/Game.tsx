import Footer from 'components/Footer';
import usePopup from 'hooks/usePopup';
import { CREATE_BUCKET } from 'stores/popup-store';
import { useInfo } from 'hooks/useInfo';
import { useClaim, usePlay } from 'hooks/usePlay';
import { Graph } from 'components/Graph';
import { useParams } from 'react-router-dom';

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
	const params = useParams()
	console.log(params.id)

	return (
		<div className="flex flex-col flex-1">
			<Play />
			<Claim />

			<AvailableChunks />

			<Graph />

			<Footer />
		</div>
  );
}
