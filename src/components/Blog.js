import React from 'react';
import './Blog.css';

const Blog = () => {
  return (
    <section id="blog" className="blog-section">
      <div className="container">
        <div className="blog-header">
          <h1 className="blog-title">Blog</h1>
          <h2 className="blog-main-heading">PG CARDS: Redefining Networking in the Digital Age</h2>
        </div>

        <article className="blog-content">
          <div className="blog-section-content">
            <h3>Introduction to PG CARDS</h3>
            <p>
              Traditional paper business cards are becoming a thing of the past. They get lost, discarded, forgotten, and contribute to environmental waste. Enter <strong>PG CARDS</strong> — a smart NFC business card solution that combines technology, style, and sustainability to revolutionize the way professionals connect.
            </p>
          </div>

          <div className="blog-section-content">
            <h3>The Problem with Traditional Business Cards</h3>
            <p>
              Every year, millions of trees are cut down, billions of gallons of water are used, and the vast majority of paper cards are thrown away within days. Traditional cards lack interactivity and adaptability. In a world that thrives on instant digital communication, relying on paper cards can slow you down.
            </p>
          </div>

          <div className="blog-section-content">
            <h3>Smart, Seamless, and Contactless (Why choose PG CARDS)</h3>
            <p>
              <strong>PG CARDS</strong> leverages cutting-edge <strong>NFC technology</strong> to make networking effortless. Share your contact details, social media profiles, websites, and more with a simple tap. It's instant, secure, and completely paper-free. No scanning, no apps, no clutter — just a smooth, professional connection that leaves a lasting impression.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
};

export default Blog;

