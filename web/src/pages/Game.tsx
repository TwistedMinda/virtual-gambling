import Footer from 'components/Footer';
import './Game.scss';
import usePopup from 'hooks/usePopup';
import { CREATE_BUCKET } from 'stores/popup-store';

export default function GamePage() {
	
	const { show } = usePopup(CREATE_BUCKET)

  return (
		<div className="game-wrapper">
			<div className="main-box">
				<div className="col center">
					<div onClick={show} className="btn">
						Provide Liquidity
					</div>

					<div onClick={show} className="btn">
						Go & Gamble
					</div>
				</div>

				<Footer />
			</div>
		</div>
  );
}
