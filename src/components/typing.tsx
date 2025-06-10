'use client';
import React from "react";
import Typewriter from "typewriter-effect";
export default function typing() {
  return (
    <div>
     <Typewriter
        options={{
        //   strings: ['A24 Building...', 'A24 is Airdrop Hounter', 'A24 is BlockCain Explorer'],
          autoStart: true,
          loop: true,
          deleteSpeed: 50,
          delay: 75,
        }}
        onInit={(typewriter) => {
          typewriter
            .typeString('A24 Building...')
            .pauseFor(1000)
            .deleteAll()
            .typeString('A24 is Airdrop Hounter')
            .pauseFor(1000)
            .deleteAll()
            .typeString('A24 is BlockCain Explorer')
            .pauseFor(1000)
            .start();
        }}
      />
    </div>
  );
}
