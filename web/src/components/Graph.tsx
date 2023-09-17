import { AxisOptions, Chart } from 'react-charts'
import { useMemo } from 'react';

import ETH_HISTORY from '../eth.json'

type PriceFeed = {
	date: Date,
	price: number,
}

type Series = {
	label: string,
	data: PriceFeed[]
}

const ethHistory = ETH_HISTORY.map((item) => ({
	date: new Date(item.timestamp),
	price: item.close,
}))


export const Graph = () => {

	const data: Series[] = [
		{
			label: '',
			data: ethHistory
		}
	]

	const primaryAxis = useMemo(
		(): AxisOptions<PriceFeed> => ({
			getValue: datum => datum.date,
		}),
		[]
	)

	const secondaryAxes = useMemo(
		(): AxisOptions<PriceFeed>[] => [
			{
				getValue: datum => datum.price,
				elementType: 'line',
				formatters: {
					tooltip: (datum: any) => `${datum}€`
				}
			},
		],
		[]
	)


  return (
		<div className='bg-white h-96'>
			<Chart
				options={{
					data,
					primaryAxis,
					secondaryAxes,
				}}
			/>
		</div>
  )
}