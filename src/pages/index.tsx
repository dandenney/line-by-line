export default function Home() {
  

  return (
    <div className="mb-8 w-auto h-auto p-4">
      <svg viewBox="0 0 285 436" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '200px', height: 'auto' }}>
        <style>
          {`
                .vertical-line {
                  fill: #1A2630;
                  transform-origin: top;
                  animation: drawVertical 0.8s ease-out forwards;
                  opacity: 0;
                }
                
                .horizontal-line {
                  fill: #1A2630;
                  transform-origin: 133px center;
                  animation: drawHorizontal 0.6s ease-out forwards;
                  opacity: 0;
                }
                
                .line1 { animation-delay: 0s; }
                .line2 { animation-delay: 0.2s; }
                .line3 { animation-delay: 0.4s; }
                .line4 { animation-delay: 0.6s; }
                .line5 { animation-delay: 1.2s; }
                .line6 { animation-delay: 1.4s; }
                .line7 { animation-delay: 1.6s; }
                
                @keyframes drawVertical {
                  0% {
                    opacity: 0;
                    transform: scaleY(0);
                  }
                  100% {
                    opacity: 1;
                    transform: scaleY(1);
                  }
                }
                
                @keyframes drawHorizontal {
                  0% {
                    opacity: 0;
                    transform: scaleX(0);
                  }
                  100% {
                    opacity: 1;
                    transform: scaleX(1);
                  }
                }
              `}
        </style>
        <rect width="19" height="436" fill="black" className="vertical-line line1" />
        <rect x="38" width="19" height="436" fill="black" className="vertical-line line2" />
        <rect x="76" width="19" height="436" fill="black" className="vertical-line line3" />
        <rect x="114" width="19" height="436" fill="black" className="vertical-line line4" />
        <rect x="133" y="417" width="152" height="19" fill="black" className="horizontal-line line5" />
        <rect x="133" y="379" width="152" height="19" fill="black" className="horizontal-line line6" />
        <rect x="133" y="341" width="152" height="19" fill="black" className="horizontal-line line7" />
      </svg>
    </div>
  );
}
