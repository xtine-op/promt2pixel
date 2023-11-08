
'use client'

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "./Home.module.css";
import { Quicksand } from 'next/font/google'
 
const quicksand = Quicksand({ subsets: ['latin'] })


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({prediction})
      setPrediction(prediction);
    }
  };

  return (
  
    <div className={`${styles.container} ${quicksand.className}`}>
      <Head>
        <title>Replicate + Next.js</title>
      </Head>

      <p className={styles.text}> Unleash Your Creative Vision with our 
      <p className={styles.gradient}>Image Generative AI</p>
      </p>
      <p className={styles.paragraph}>Whether you're a seasoned artist, a budding designer, or just someone with a passion for visual storytelling, 
        our AI-powered tool will empower you to bring your ideas to life like never before.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="text" name="prompt" placeholder="Enter a prompt to display an image" />
        <button type="submit">Go!</button>
      </form>

      {error && <div>{error}</div>}

      {prediction && (
        <div>
            {prediction.output && (
              <div className={styles.imageWrapper}>
              <Image
                fill
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes='100vw'
              />
              </div>
            )}
            <p>status: {prediction.status}</p>
        </div>
      )}
    </div>
  );
}