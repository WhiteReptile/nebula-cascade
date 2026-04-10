import { useNavigate } from 'react-router-dom';

const Options = () => {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center font-mono"
      style={{ backgroundColor: '#050510' }}
    >
      <h1
        className="menu-title-glow uppercase tracking-[0.4em] text-3xl md:text-5xl font-bold mb-4 select-none"
        style={{ color: '#e0f0ff' }}
      >
        OPTIONS
      </h1>
      <p className="text-gray-500 tracking-widest uppercase text-sm mb-10">
        Coming Soon
      </p>
      <button
        onClick={() => navigate('/')}
        className="menu-item-glow uppercase tracking-[0.2em] text-base bg-transparent border-none cursor-pointer"
        style={{ color: '#66ffee' }}
      >
        ← Back
      </button>
    </div>
  );
};

export default Options;
