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
    <div className='bg-white w-96 h-96 rounded'>
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