'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import confetti, { Options } from 'canvas-confetti';
import YouTube from 'react-youtube';
import { CONTRACT_ADDRESS } from './contractaddress';
import { getRandomShareText } from './components/ShareTexts';

interface Reward {
  type: 'good' | 'bad';
  image: string;
}

const goodRewards = ['/rewards/good/chinese-gold-ingot-png.webp'];
const badRewards = ['/rewards/bad/Poop-PNG-Pic.png'];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeScale, setChargeScale] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [clapFrame, setClapFrame] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const playerRef = useRef<YT.Player | null>(null);

  // YouTube player options
  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: 'hwQZxqwkJNU', // Same video ID for looping
    },
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    playerRef.current = event.target;
    // Start with lower volume
    playerRef.current.setVolume(30);
    if (isMuted) {
      playerRef.current.mute();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
  };

  // Initialize Web Audio API
  useEffect(() => {
    // Create AudioContext on first user interaction
    const initAudio = async () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        // Fetch and decode audio file
        const response = await fetch('/clap.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    // Initialize on mount
    initAudio();

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClap = async () => {
    try {
      if (audioContextRef.current && audioBufferRef.current) {
        // Create a new buffer source for each play
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);
        source.start(0);
      }
    } catch (error) {
      console.error('Error playing clap:', error);
    }
  };

  const fireConfetti = () => {
    // Create gold confetti burst
    const count = 200;
    const defaults: Options = {
      origin: { y: 0.7 },
      colors: ['#FFD700', '#DAA520', '#FDB931'], // Gold colors
      shapes: ['square'],
      ticks: 300,
    };

    function fire(particleRatio: number, opts: Partial<Options>) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Fire multiple bursts for a richer effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reward?.type === 'good') {
      // Start frame animation
      interval = setInterval(() => {
        setClapFrame(prev => prev === 1 ? 2 : 1);
      }, 300);

      // Play sound with a slight delay
      setTimeout(() => {
        playClap();
      }, 100);

      // Fire confetti
      fireConfetti();
    }
    return () => {
      clearInterval(interval);
    };
  }, [reward?.type]);

  useEffect(() => {
    if (isCharging) {
      const interval = setInterval(() => {
        setChargeScale(prev => {
          if (prev >= 1.8) return 1.8;
          return prev + 0.08;
        });
        setBrightness(prev => {
          if (prev >= 3) return 3;
          return prev + 0.2;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setChargeScale(1);
      setBrightness(1);
    }
  }, [isCharging]);

  const getRandomReward = (): Reward => {
    // 30% chance for good reward
    const isGoodReward = Math.random() < 0.3;
    const rewardsList = isGoodReward ? goodRewards : badRewards;
    const randomImage = rewardsList[Math.floor(Math.random() * rewardsList.length)];
    return {
      type: isGoodReward ? 'good' : 'bad',
      image: randomImage
    };
  };

  const handleEnvelopeClick = () => {
    if (isOpen) {
      setIsOpen(false);
      setReward(null);
      setChargeScale(1);
      setBrightness(1);
      return;
    }

    setIsCharging(true);

    setTimeout(() => {
      setIsCharging(false);
      setIsOpen(true);
      
      setTimeout(() => {
        setReward(getRandomReward());
      }, 300);
    }, 2000);
  };

  const resetGame = () => {
    setIsOpen(false);
    setReward(null);
    setIsCharging(false);
    setChargeScale(1);
    setBrightness(1);
    setClapFrame(1);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-red-600 to-red-800">
      {/* Background Music Player */}
      <div className="fixed bottom-4 right-4 z-50">
        <YouTube
          videoId="hwQZxqwkJNU"
          opts={opts}
          onReady={onPlayerReady}
          className="hidden"
        />
        <button
          onClick={toggleMute}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors shadow-lg"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
      <div className="text-center">
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {/* Background Light Effect */}
          <motion.div
            className="absolute inset-0 bg-white rounded-full blur-3xl"
            animate={{
              scale: isCharging ? [1, 1.2, 1.4, 1.6] : 1,
              opacity: isCharging ? [0.1, 0.2, 0.3, 0.4] : 0
            }}
            transition={{
              duration: 2,
              repeat: isCharging ? Infinity : 0,
              ease: "easeInOut"
            }}
          />

          {/* Red Envelope */}
          <AnimatePresence>
            {!reward && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={!isCharging ? { scale: 1.05 } : {}}
                whileTap={!isCharging ? { scale: 0.95 } : {}}
                onClick={!isCharging ? handleEnvelopeClick : undefined}
              >
                <motion.div
                  animate={
                    isCharging
                      ? {
                          scale: chargeScale,
                          rotate: [-2, 2, -2],
                        }
                      : { scale: 1 }
                  }
                  transition={
                    isCharging
                      ? {
                          scale: { duration: 0.2 },
                          rotate: { duration: 0.1, repeat: Infinity },
                        }
                      : { duration: 0.3 }
                  }
                  style={{ 
                    width: 'fit-content',
                    height: 'fit-content',
                    position: 'relative'
                  }}
                  className="cursor-pointer"
                >
                  {/* Particle effects */}
                  <AnimatePresence>
                    {isCharging && (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {[...Array(30)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            animate={{
                              x: [
                                0,
                                (Math.random() - 0.5) * 300 * (chargeScale),
                              ],
                              y: [
                                0,
                                (Math.random() - 0.5) * 300 * (chargeScale),
                              ],
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: Math.random(),
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Brightness mask */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      maskImage: 'url(/red-envelope.webp)',
                      WebkitMaskImage: 'url(/red-envelope.webp)',
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      WebkitMaskPosition: 'center',
                    }}
                  >
                    <motion.div
                      className="w-full h-full bg-white"
                      animate={{
                        opacity: isCharging ? (brightness - 1) * 0.5 : 0
                      }}
                    />
                  </motion.div>

                  <Image
                    src="/red-envelope.webp"
                    alt="Red Envelope"
                    width={340}
                    height={340}
                    className="transition-transform duration-500"
                    style={{ 
                      objectFit: 'contain',
                    }}
                    priority
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reward Display */}
          <AnimatePresence>
            {reward && (
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Clapping hands for good rewards */}
                {reward.type === 'good' && (
                  <>
                    {/* Left clap */}
                    <motion.div
                      className="absolute left-[-200px] top-1/2 transform -translate-y-1/2"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ 
                        x: 0,
                        opacity: 1,
                        rotate: [-5, 5, -5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 0.5,
                        rotate: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        scale: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <Image
                        src={`/clap${clapFrame}.png`}
                        alt="Clapping"
                        width={200}
                        height={200}
                        className="object-contain"
                        priority
                      />
                    </motion.div>

                    {/* Right clap */}
                    <motion.div
                      className="absolute right-[-200px] top-1/2 transform -translate-y-1/2"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ 
                        x: 0,
                        opacity: 1,
                        rotate: [-5, 5, -5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 0.5,
                        rotate: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        scale: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <Image
                        src={`/clap${clapFrame}.png`}
                        alt="Clapping"
                        width={200}
                        height={200}
                        className="object-contain scale-x-[-1]"
                        priority
                      />
                    </motion.div>
                  </>
                )}

                {/* Light effect */}
                <motion.div 
                  className="relative"
                  style={{
                    width: '300px',
                    height: '300px',
                  }}
                >
                  {/* Background pulse effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        maskImage: `url(${reward.image})`,
                        WebkitMaskImage: `url(${reward.image})`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        mixBlendMode: 'screen',
                      }}
                    >
                      {[...Array(2)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0"
                          animate={{
                            background: reward.type === 'good'
                              ? [
                                  'radial-gradient(circle at center, rgba(253,224,71,0.5) 20%, transparent 100%)',
                                  'radial-gradient(circle at center, rgba(253,224,71,0.7) 35%, transparent 100%)',
                                  'radial-gradient(circle at center, rgba(253,224,71,0.5) 20%, transparent 100%)'
                                ]
                              : [
                                  'radial-gradient(circle at center, rgba(209,213,219,0.5) 20%, transparent 100%)',
                                  'radial-gradient(circle at center, rgba(209,213,219,0.7) 35%, transparent 100%)',
                                  'radial-gradient(circle at center, rgba(209,213,219,0.5) 20%, transparent 100%)'
                                ],
                            scale: [0.95, 1.05, 0.95]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 1
                          }}
                          style={{
                            mixBlendMode: 'screen',
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Edge light effect */}
                  <motion.div 
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Glow effect that matches image transparency */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        maskImage: `url(${reward.image})`,
                        WebkitMaskImage: `url(${reward.image})`,
                        maskSize: 'contain',
                        WebkitMaskSize: 'contain',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        mixBlendMode: 'screen',
                      }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0"
                          animate={{
                            background: reward.type === 'good'
                              ? [
                                  'radial-gradient(circle at 45% 45%, rgba(253,224,71,0.8) 0%, transparent 100%)',
                                  'radial-gradient(circle at 55% 55%, rgba(253,224,71,0.2) 0%, transparent 100%)',
                                  'radial-gradient(circle at 50% 50%, rgba(253,224,71,0.6) 0%, transparent 100%)',
                                  'radial-gradient(circle at 45% 55%, rgba(253,224,71,0.3) 0%, transparent 100%)',
                                  'radial-gradient(circle at 55% 45%, rgba(253,224,71,0.7) 0%, transparent 100%)',
                                ]
                              : [
                                  'radial-gradient(circle at 45% 45%, rgba(209,213,219,0.8) 0%, transparent 100%)',
                                  'radial-gradient(circle at 55% 55%, rgba(209,213,219,0.2) 0%, transparent 100%)',
                                  'radial-gradient(circle at 50% 50%, rgba(209,213,219,0.6) 0%, transparent 100%)',
                                  'radial-gradient(circle at 45% 55%, rgba(209,213,219,0.3) 0%, transparent 100%)',
                                  'radial-gradient(circle at 55% 45%, rgba(209,213,219,0.7) 0%, transparent 100%)',
                                ],
                            scale: [1, 1.1, 0.95, 1.05, 1],
                            opacity: [0.8, 0.4, 0.9, 0.5, 0.7]
                          }}
                          transition={{
                            background: {
                              duration: 2 + i,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                              times: [0, 0.2, 0.4, 0.6, 0.8],
                              delay: i * 0.5
                            },
                            scale: {
                              duration: 1.5 + i * 0.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                              delay: i * 0.3
                            },
                            opacity: {
                              duration: 2 + i * 0.7,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                              delay: i * 0.2
                            }
                          }}
                          style={{
                            mixBlendMode: 'screen',
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Reward Image */}
                  <motion.div
                    className="relative w-full h-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: 1,
                      opacity: 1,
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut",
                      rotate: {
                        duration: 0.3,
                        times: [0, 0.3, 0.6, 1]
                      }
                    }}
                  >
                    <Image
                      src={reward.image}
                      alt="Reward"
                      fill
                      className="object-contain z-10"
                      priority
                    />
                  </motion.div>
                </motion.div>

                {/* Buttons */}
                <motion.div 
                  className="flex flex-col gap-3 mt-4 w-full max-w-xs mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {reward.type === 'good' ? (
                    <>
                      <motion.div
                        className="text-center text-xl font-bold text-yellow-500 mb-2"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10
                        }}
                      >
                        🎉 Congratulations! 🎉
                      </motion.div>
                      <button
                        onClick={resetGame}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                      >
                        Try Your Luck Again! 🎲
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={resetGame}
                      className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      Try Again 🎲
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Get random share text based on reward type
                      const text = getRandomShareText(reward.type === 'good');
                      
                      // Create the share URL with just the text
                      const shareUrl = new URL('https://twitter.com/intent/tweet');
                      shareUrl.searchParams.append('text', text);
                      
                      // Open in new tab
                      window.open(shareUrl.toString(), '_blank');
                    }}
                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Share on <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contract Address and Social Links */}
        <AnimatePresence>
          {!isCharging && !reward && (
            <motion.div 
              className="mt-8 flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="text-white/80 hover:text-white cursor-pointer flex items-center gap-2 group"
                onClick={copyToClipboard}
              >
                <span className="text-sm">Contract Address:</span>
                <span className="font-mono text-sm">
                  {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showCopied ? 1 : 0 }}
                  className="text-xs text-green-400 absolute ml-48"
                >
                  Copied!
                </motion.span>
              </div>

              <div className="flex gap-4">
                <a 
                  href="https://twitter.com/your_twitter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://t.me/your_telegram" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
