# Real-Time Streaming AI Chat Interface

A professional, high-performance streaming AI chat interface built with **Next.js**, **React**, and **Tailwind CSS**. This repository features a token-by-token streaming mechanism utilizing Next.js Edge Runtime and client-side stream consumption.

## 🚀 Features Implemented

- **Token-by-Token Real-Time Streaming:** Backend processes data chunks using a lightweight `ReadableStream` transmitted via chunked transfer encoding, avoiding server-side buffering delay.
- **Smart Auto-Scroll Management:** The UI automatically scrolls down to display incoming text chunks. If the user scrolls up manually to review past text, the auto-scroll gracefully pauses to avoid interrupting the user's view.
- **Interrupt Generation (Stop Button):** Fully integrated `AbortController` in the client-side fetch wrapper. Clicking the red stop button instantly aborts the transmission pipeline safely.
- **Modern UI Components:** Dark theme layout featuring responsive state-driven chat bubbles, loading indicators, and clean layout iconography.

## 📂 Project Architecture

The core architecture follows the Next.js App Router pattern:
```text
app/
├── api/
│   └── chat/
│       └── route.ts      # Edge Runtime Streaming API Endpoint
├── layout.tsx            # Global Layout Wrapper
├── page.tsx              # Main Reactive Chat Dashboard Core
└── globals.css           # Custom CSS utilities
