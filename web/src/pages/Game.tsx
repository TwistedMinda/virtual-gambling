import Footer from 'components/Footer';
import { useClaim } from 'hooks/usePlay';
import { Graph } from 'components/Graph';
import { useNavigate, useParams } from 'react-router-dom';
import { HTMLProps } from 'react';
import { CREATE_BUCKET } from 'stores/popup-store';
import usePopup from 'hooks/usePopup';
import { DAI_IMG, ETH_IMG } from 'images';
import { useEthPrice } from 'hooks/useEthPrice';

const Claim = () => {
	const { claim, isLoading } = useClaim()

	return (
		<GameButton
			onClick={isLoading ? undefined : claim}
			title={isLoading ? 'Claiming...' : 'Claim rewards'}
			/>
	)
}

const GameButton = ({
	title,
	...props
}: {
	title: string
} & HTMLProps<any>) => {
	return (
		<div
			className={`text-red-500 text-center flex-1 rounded bg-gray-100 p-2 opacity-80 cursor-pointer`}
			{...props}
			>
			{title}
		</div>
	)
}

const Buy = () => {
	const { show } = usePopup(CREATE_BUCKET)
	
	return (
		<GameButton onClick={show} title='Buy' />
	)
}
const Sell = () => {
	const { show } = usePopup(CREATE_BUCKET)
	
	return (
		<GameButton onClick={show} title='Sell' />
	)
}

export default function GamePage() {
	const params = useParams()
	console.log(params.id)
	const { price } = useEthPrice()
	const navigate = useNavigate()
	const goBack = () => navigate('/')

	return (
		<div className="flex flex-col flex-1">
			
			<div className='text-red-500 text-center flex-1 bg-gray-100 p-2 opacity-80'>
				<div>Game ID: 22408</div>
				<div onClick={goBack} className='text-black absolute top-2 left-4 cursor-pointer'>
					{'< Home'}
				</div>
			</div>

			<Graph />

			<div className='self-center py-4'>
				
				<div className='flex flex-row items-center'>
					<img className='w-4 mr-2' src={ETH_IMG} />
					<div>{0} ETH</div>
				</div>
				
				<div className='flex flex-row items-center'>
					<img className='w-4 mr-2' src={DAI_IMG} />
					<div>{price} DAI</div>
				</div>
				
				<div>Total Value: {price}€</div>
			</div>

			<div className='flex flex-row justify-center mx-4 gap-2'>
				<Buy />

				<Sell />
			</div>

			<div className='mt-4 opacity-20 self-center'>
				<Claim />
			</div>

			<Footer />
		</div>
  );
}
