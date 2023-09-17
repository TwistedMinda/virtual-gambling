import { useNavigate } from 'react-router-dom'
import './Landing.scss'

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
      </div>
    </div>
  )
}