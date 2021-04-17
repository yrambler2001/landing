export default function Home() {
  return (
    <div className="container">
      <h1>TODO: Home page</h1>
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
