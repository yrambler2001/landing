import { FaSpotify } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <h1>TODO: Home page</h1>
      <h2>
        <Link to="/spotify" className="spotify-row">
          <span className="spotify-icon-container">
            <FaSpotify className="spotify-icon" />
          </span>
          <span>Look what I&apos;m listening to right now ...</span>
        </Link>
      </h2>
      <iframe
        className="youtube-iframe"
        width="1014"
        height="676"
        src="https://www.youtube.com/embed/r_u2j1g-_TE?autoplay=1&loop=1&playlist=r_u2j1g-_TE&mute=1&showinfo=0&controls=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
