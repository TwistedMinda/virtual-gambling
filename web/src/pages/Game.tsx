import Footer from 'components/Footer';
import './Game.scss';
import usePopup from 'hooks/usePopup';
import { CREATE_BUCKET } from 'stores/popup-store';
import { useInfo } from 'hooks/useInfo';
import { useClaim, usePlay } from 'hooks/usePlay';
import { AxisOptions, Chart } from 'react-charts'
import { useMemo } from 'react';
import { useEthPrice } from 'hooks/useEthPrice';

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

	const { price } = useEthPrice()

	type DailyStars = {
		date: Date,
		stars: number,
	}
	
	type Series = {
		label: string,
		data: DailyStars[]
	}
	
	const data: Series[] = [
		{
			label: '',
			data: [
				{
					date: new Date('09/15/2023'),
					stars: price - 10,
				},
				{
					date: new Date('09/16/2023'),
					stars: price + 200,
				},
				{
					date: new Date('09/17/2023'),
					stars: price,
				}
			]
		}
	]

	const primaryAxis = useMemo(
		(): AxisOptions<DailyStars> => ({
			getValue: datum => datum.date,
		}),
		[]
	)

	const secondaryAxes = useMemo(
		(): AxisOptions<DailyStars>[] => [
			{
				getValue: datum => datum.stars,
			},
		],
		[]
	)

  return (
		<div className="game-wrapper">
			<div className="main-box">
				<div className="col center">
					<Play />
					<Claim />
				</div>

				<AvailableChunks />

				<div className='bg-white w-96 h-96 rounded'>
					<Chart
						options={{
							data,
							primaryAxis,
							secondaryAxes,
						}}
						itemType='line'
					/>
				</div>

				<Footer />
			</div>
		</div>
  );
}
