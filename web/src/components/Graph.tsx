import { AxisOptions, Chart } from 'react-charts'
import { useMemo } from 'react';
import { useEthPrice } from 'hooks/useEthPrice';

export const Graph = () => {

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
					stars: 10,
				},
				{
					date: new Date('09/16/2023'),
					stars: 200,
				},
				{
					date: new Date('09/17/2023'),
					stars: 240,
				},
				{
					date: new Date('09/18/2023'),
					stars: 140,
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
				elementType: 'line',
				formatters: {
					tooltip: (datum: any) => `${datum}€`
				}
			},
		],
		[]
	)


  return (
		<div className='w-96'>
			<div className='bg-white h-96 rounded'>
				<Chart
					options={{
						data,
						primaryAxis,
						secondaryAxes,
					}}
				/>
			</div>
			<div className='flex flex-row justify-center'>

				<div className='text-red-500 text-center flex-1 rounded bg-gray-100 p-2 opacity-80'>
					BUY
				</div>

				<div className='text-red-500 text-center flex-1 rounded bg-gray-100 p-2 opacity-80'>
					SELL
				</div>
			</div>
		</div>
  )
}