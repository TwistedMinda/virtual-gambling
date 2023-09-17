import { useNavigate } from 'react-router-dom'
import './Landing.scss'
import { usePlay } from 'hooks/usePlay'
import { useInfo } from 'hooks/useInfo'
import Footer from 'components/Footer'

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

const Play = () => {
	const { play, isLoading } = usePlay()

	return (
		<div onClick={isLoading ? undefined : play} className="btn">
			{isLoading ? 'Setting up...' : 'Fight now'}
		</div>
	)
}

export const Landing = () => {
  const navigate = useNavigate()

  const onPress = () =>
    navigate('/02')

  return (
    <div className="landing-wrapper">
      <div className='main-box mt-48 text-center'>
        <div 
          onClick={onPress} 
          className='rounded cursor-pointer bg-gray-100 p-2 text-black'
        >
          Check out example fight
        </div>

        <Play />
        <AvailableChunks />

        <Footer />
      </div>
    </div>
  )
}