import React, { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/components/newsletter.module.css";
import Button from "../components/UI/button";
import { useState } from "react";
import { useAccount } from "@starknet-react/core";

const NewsletterPage: NextPage = () => {
  const { address } = useAccount();
  const [error, setError] = useState<string>("");
  const submitHandler = () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/newsletter_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        address: address || null,
      }),
    })
      .then((res) =>
        res.json().then(() => window.open("/newsletter/confirm", "_self"))
      )
      .catch((err) => {
        setError("This email is already registered.");
        console.log("Error on registering to email:", err);
      });
  };

  return (
    <div className={styles.page}>
      <div className={styles.balloon}>
        <Image src="/visuals/balloon.webp" alt="hot-air balloon" fill />
      </div>
      <div className={styles.coconut}>
        <Image src="/visuals/coconut.webp" alt="coconut" fill />
      </div>
      <div className={styles.starknet}>
        <Image src="/icons/starknet.svg" alt="starknet" fill />
      </div>
      <div className={styles.lilLeaf1}>
        <Image src="/leaves/new/lilLeaf01.svg" alt="leaf" fill />
      </div>
      <div className={styles.lilLeaf2}>
        <Image src="/leaves/new/lilLeaf01.svg" alt="leaf" fill />
      </div>
      <div className={styles.lilLeaf3}>
        <Image src="/leaves/new/lilLeaf02.svg" alt="leaf" fill />
      </div>
      <div className={styles.tree1}>
        <Image src="/visuals/coconutTree1.webp" alt="coconut tree" fill />
      </div>
      <div className={styles.tree2}>
        <Image src="/visuals/coconutTree2.webp" alt="coconut tree" fill />
      </div>
      <p className={styles.subtitle}>Starknet news</p>
      <h1 className={styles.title}>
        <strong>Subscribe</strong> to our Newsletter
      </h1>
      <p className={styles.description}>
        Stay connected with the Starknet beat. Subscribe for direct updates on
        Starknet airdrops, opportunities, and news.
      </p>
      <section className={styles.form}>
        {error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : (
          <p className="mb-2 text-center">Your email address</p>
        )}
        <input
          required
          className={styles.input}
          id="email"
          onChange={() => setError("")}
          autoComplete="off"
        />
        <div className="w-fit block mx-auto">
          <Button onClick={submitHandler} disabled={!!error}>
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NewsletterPage;
